import 'colors';
import { writeFileSync, mkdirSync } from 'fs';
import json_stable_stringify from "json-stable-stringify";
import { AssignedExam, AssignedQuestion, AssignedSection } from './core/assigned_exams';
import { ExamRenderer, OriginalExamRenderer } from './core/exam_renderer';
import { createQuestionSkinRandomizer, createSectionChoiceRandomizer, createQuestionChoiceRandomizer, createSectionSkinRandomizer, Randomizer } from "./core/randomization";
import { assert } from './core/util';
import { unparse } from 'papaparse';
import del from 'del';
import { chooseQuestions, chooseSections, chooseSkins, realizeQuestions, realizeSections, StudentInfo } from './core/exam_specification';
import { createCompositeSkin, ExamComponentSkin } from './core/skins';
import { createStudentUuid, writeFrontendJS, ExamUtils } from './ExamUtils';
import path from 'path';
import { Exam, Question, Section } from './core/exam_components';

type SectionStats = {
  section: Section,
  n: number
};

type QuestionStats = {
  question: Question,
  n: number
};

export type UUID_Strategy = "plain" | "uuidv4" | "uuidv5";

export type ExamGeneratorOptions = {
  frontend_js_path: string,
  frontend_media_dir: string,
  uuid_strategy: UUID_Strategy,
  uuidv5_namespace?: string,
  allow_duplicates: boolean,
  consistent_randomization?: boolean
};

const DEFAULT_OPTIONS = {
  frontend_js_path: "js/",
  frontend_media_dir: "media",
  uuid_strategy: "plain",
  allow_duplicates: false
};

function verifyOptions(options: Partial<ExamGeneratorOptions>) {
  assert(options.uuid_strategy !== "uuidv5" || options.uuidv5_namespace, "If uuidv5 filenames are selected, a uuidv5_namespace option must be specified.");
  assert(!options.uuidv5_namespace || options.uuidv5_namespace.length >= 16, "uuidv5 namespace must be at least 16 characters.");
}

export type ExamGeneratorSpecification = Partial<ExamGeneratorOptions>;

export class ExamGenerator {

  public readonly exam: Exam;
  public readonly assignedExams: AssignedExam[] = [];
  public readonly assignedExamsByUniqname: { [index: string]: AssignedExam | undefined; } = {};

  private readonly sectionsMap: { [index: string]: Section | undefined } = {};
  private readonly questionsMap: { [index: string]: Question | undefined } = {};

  private readonly sectionStatsMap: { [index: string]: SectionStats; } = {};
  private readonly questionStatsMap: { [index: string]: QuestionStats; } = {};

  private options: ExamGeneratorOptions;

  private onStatus?: (status: string) => void;
  private totalExams: number;

  public constructor(exam: Exam, options: Partial<ExamGeneratorOptions> = {}, onStatus?: (status: string) => void) {
    this.exam = exam;
    verifyOptions(options);
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.onStatus = onStatus;
    this.totalExams = 0
  }

  public assignExams(students: readonly StudentInfo[]) {
    this.totalExams += students.length;
    students.forEach(s => this.assignExam_impl(s));
  }

  public assignExam(student: StudentInfo) {
    this.totalExams += 1;
    this.assignExam_impl(student);
  }

  private assignExam_impl(student: StudentInfo) {

    console.log(`Creating randomized exam for ${student.uniqname}... (${this.assignedExams.length + 1}/${this.totalExams})`);
    this.onStatus && this.onStatus(`Creating randomized exam for ${student.uniqname}... (${this.assignedExams.length + 1}/${this.totalExams})`);
    let ae = this.createRandomizedExam(student);

    this.assignedExams.push(ae);
    this.assignedExamsByUniqname[student.uniqname] = ae;

    assert(ae.pointsPossible === this.assignedExams[0].pointsPossible, `Error: Inconsistent total point values. ${this.assignedExams[0].student.uniqname}=${this.assignedExams[0].pointsPossible}, ${ae.student.uniqname}=${ae.pointsPossible}.`.red);

    return ae;
  }

  private createRandomizedExam(
    student: StudentInfo,
    rand: Randomizer = createSectionChoiceRandomizer(this.makeSeed(student), this.exam))
  {
    let ae = new AssignedExam(
      createStudentUuid(this.options, student, this.exam.exam_id),
      this.exam,
      student,
      this.exam.sections
        .flatMap(chooser => realizeSections(chooseSections(chooser, this.exam, student, rand)))
        .flatMap((s, sectionIndex) => this.createRandomizedSection(s, student, sectionIndex)),
      this.options.allow_duplicates
    );

    this.checkExam(ae);

    return ae;
  }

  private makeSeed(student: StudentInfo) {
    return this.options.consistent_randomization
      ? "common"
      : student.uniqname;
  }

  private createRandomizedSection(
    section: Section,
    student: StudentInfo,
    sectionIndex: number,
    rand: Randomizer = createQuestionChoiceRandomizer(this.makeSeed(student), this.exam, section),
    skinRand: Randomizer = createSectionSkinRandomizer(this.makeSeed(student), this.exam, section))
  {
    let sectionSkins = chooseSkins(section.skin, this.exam, student, skinRand);
    assert(this.options.allow_duplicates || sectionSkins.length === 1, "Generating multiple skins per section is only allowed if an exam allows duplicate sections.")
    return sectionSkins.map(sectionSkin => new AssignedSection(
      createStudentUuid(this.options, student, this.exam.exam_id + "-s-" + section.section_id),
      section,
      sectionIndex,
      sectionSkin,
      section.questions
        .flatMap(chooser => realizeQuestions(chooseQuestions(chooser, this.exam, student, rand)))
        .flatMap((q, partIndex) => this.createRandomizedQuestion(q, student, sectionIndex, partIndex, sectionSkin))
    ));
  }

  private createRandomizedQuestion(
    question: Question,
    student: StudentInfo,
    sectionIndex: number,
    partIndex: number,
    sectionSkin: ExamComponentSkin,
    rand: Randomizer = createQuestionSkinRandomizer(this.makeSeed(student), this.exam, question)) {

    let questionSkins = chooseSkins(question.skin, this.exam, student, rand).map(qSkin => createCompositeSkin(sectionSkin, qSkin));
    assert(this.options.allow_duplicates || questionSkins.length === 1, "Generating multiple skins per question is only allowed if an exam allows duplicate sections.")
    return questionSkins.map(questionSkin => new AssignedQuestion(
      createStudentUuid(this.options, student, this.exam.exam_id + "-q-" + question.question_id),
      this.exam,
      student,
      question,
      questionSkin,
      sectionIndex,
      partIndex, "")
    );
  }

  private checkExam(ae: AssignedExam) {
    // Find all sections assigned to any exam
    let sections = ae.assignedSections.map(s => s.section);

    // Keep track of all sections
    sections.forEach(s => this.sectionsMap[s.section_id] = s);

    // Verify that every section with the same ID originated from the same specification
    // If there wasn't a previous stats entry for that section ID, add one
    sections.forEach(
      section => this.sectionStatsMap[section.section_id]
        ? ++this.sectionStatsMap[section.section_id].n && assert(this.options.allow_duplicates || section.spec === this.sectionStatsMap[section.section_id].section.spec, `Multiple sections from different specifications with the ID "${section.section_id}" were detected.`)
        : this.sectionStatsMap[section.section_id] = {
          section: section,
          n: 1
        }
    );


    // Find all questions assigned to any exam
    let questions = ae.assignedSections.flatMap(s => s.assignedQuestions.map(q => q.question));
    
    // Keep track of all questions
    questions.forEach(q => this.questionsMap[q.question_id] = q);

    // Verify that every question with the same ID originated from the same specification
    questions.forEach(
      question => this.questionStatsMap[question.question_id]
        ? ++this.questionStatsMap[question.question_id].n && assert(this.options.allow_duplicates || question.spec === this.questionStatsMap[question.question_id].question.spec, `Multiple questions from different specifications with the ID "${question.question_id}" were detected.`)
        : this.questionStatsMap[question.question_id] = {
          question: question,
          n: 1
        }
    );

  }

  private writeStats() {
    // Create output directory
    mkdirSync(`data/${this.exam.exam_id}/`, { recursive: true });

    // Write to file. JSON.stringify removes the section/question objects
    writeFileSync(`data/${this.exam.exam_id}/stats.json`, json_stable_stringify({
      sections: this.sectionStatsMap,
      questions: this.questionStatsMap
    }, { replacer: (k, v) => k === "section" || k === "question" ? undefined : v, space: 2 }));

  }

  private writeMedia(outDir: string) {

    let mediaOutDir = path.join(outDir, this.options.frontend_media_dir);
    
    ExamUtils.writeExamMedia(mediaOutDir, this.exam, <Section[]>Object.values(this.sectionsMap), <Question[]>Object.values(this.questionsMap));
  }

  public createManifests() {
    return this.assignedExams.map(ex => ex.createManifest());
  }

  public renderExams(exam_renderer: ExamRenderer) {
    return this.assignedExams.map((ex, i) => {
      console.log(`${i + 1}/${this.assignedExams.length} Rendering assigned exam html for ${ex.student.uniqname}`);
      this.onStatus && this.onStatus(`Phase 2/3: Rendering exams... (${i + 1}/${this.totalExams})`);
      return exam_renderer.renderAll(ex, this.options.frontend_js_path);
    });
  }

  public writeExamSpec() {
    // Write exam specification as JSON
    mkdirSync(`data/${this.exam.exam_id}`, { recursive: true });
    ExamUtils.writeExamSpecificationToFileSync(
      `data/${this.exam.exam_id}/exam-spec.json`,
      this.exam.spec
    );
  }

  public writeAll(exam_renderer: ExamRenderer, examDir: string = "out", manifestDir: string = "data") {
    this.onStatus && this.onStatus("Phase 3/3: Saving exam data...")

    this.writeExamSpec();

    examDir = path.join(examDir, `${this.exam.exam_id}/exams`);
    manifestDir = path.join(manifestDir, `${this.exam.exam_id}/manifests`);

    // Create output directories and clear previous contents
    mkdirSync(examDir, { recursive: true });
    del.sync(`${examDir}/*`);
    mkdirSync(manifestDir, { recursive: true });
    del.sync(`${manifestDir}/*`);

    writeFrontendJS(`${examDir}/js`, "frontend.js");
    writeFrontendJS(`${examDir}/js`, "frontend-solution.js");
    this.writeMedia(`${examDir}`);

    this.writeStats();

    let filenames : string[][] = [];

    let manifests = this.createManifests();
    let renderedExams = this.renderExams(exam_renderer);

    let toWrite = manifests
      .map((m, i) => ({
        manifest: m,
        renderedHtml: renderedExams[i]
      }))
      .sort((a, b) => a.manifest.student.uniqname.localeCompare(b.manifest.student.uniqname));
      
    // Write out manifests and exams for all, sorted by uniqname
    toWrite.forEach((ex, i, arr) => {
      let manifest = ex.manifest;
      // Create filename, add to list
      let filenameBase = manifest.student.uniqname + "-" + manifest.uuid;
      filenames.push([manifest.student.uniqname, filenameBase])

      console.log(`${i + 1}/${arr.length} Saving assigned exam manifest for ${manifest.student.uniqname} to ${filenameBase}.json`);
      writeFileSync(`${manifestDir}/${filenameBase}.json`, JSON.stringify(manifest, null, 2), {encoding: "utf-8"});
      console.log(`${i + 1}/${arr.length} Saving assigned exam html for ${manifest.student.uniqname} to ${filenameBase}.html`);
      writeFileSync(`${examDir}/${filenameBase}.html`, ex.renderedHtml, {encoding: "utf-8"});

    });

    writeFileSync(`data/${this.exam.exam_id}/student-ids.csv`, unparse({
      fields: ["uniqname", "filenameBase"],
      data: filenames 
    }));

  }

}

