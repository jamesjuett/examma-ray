import 'colors';
import del from 'del';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import json_stable_stringify from "json-stable-stringify";
import { unparse } from 'papaparse';
import path from 'path';
import { AssignedExam, UUID_Options, UUID_Strategy } from './core/assigned_exams';
import { Exam, Question, Section } from './core/exam_components';
import { ExamRenderer } from './core/exam_renderer';
import { exam_spec_without_assets_dirs, stringifyExamComponentSpecification, StudentInfo, without_content } from './core/exam_specification';
import { createManifestFilenameBase, makeOpaque, stringifyExamSubmission } from './core/submissions';
import { assert } from './core/util';
import { ExamUtils, writeFrontendFile } from './ExamUtils';
import { ncp } from 'ncp';

type ExamStats = {
  sections: { [index: string]: SectionStats; },
  questions: { [index: string]: QuestionStats; }
};

type SectionStats = {
  section: Section,
  n: number
};

type QuestionStats = {
  question: Question,
  n: number
};

type FullExamGeneratorOptions = {
  readonly frontend_js_path: string,
  readonly frontend_assets_dir: string,
  readonly assets_bundle_dir?: string,
  readonly uuid_options: UUID_Options,
  readonly allow_duplicates: boolean,
  readonly consistent_randomization?: boolean
  readonly seed: string
};

export type ExamGeneratorOptions = Partial<FullExamGeneratorOptions>;

const DEFAULT_OPTIONS = {
  frontend_js_path: "js/",
  frontend_assets_dir: "assets",
  uuid_options: { strategy: "plain" },
  allow_duplicates: false,
  consistent_randomization: false,
  seed: ""
};

function verifyOptions(options: FullExamGeneratorOptions) {
  if (options.uuid_options.strategy === "uuidv5") {
    assert(options.uuid_options.v5_namespace.length >= 16, "uuidv5 namespace must be at least 16 characters.");
  }
}

export class ExamGenerator {

  public readonly exam: Exam;
  public readonly assignedExams: AssignedExam[] = [];
  public readonly assignedExamsByUniqname: { [index: string]: AssignedExam | undefined; } = {};

  private readonly sectionsMap: { [index: string]: Section | undefined } = {};
  private readonly questionsMap: { [index: string]: Question | undefined } = {};

  private readonly sectionStatsMap: { [index: string]: SectionStats; } = {};
  private readonly questionStatsMap: { [index: string]: QuestionStats; } = {};

  private readonly options: FullExamGeneratorOptions;

  private onStatus?: (status: string) => void;
  private totalExams: number;

  public constructor(exam: Exam, options: ExamGeneratorOptions = {}, onStatus?: (status: string) => void) {
    this.exam = exam;
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    verifyOptions(this.options);
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
    let ae = AssignedExam.createRandomized(this.exam, student, this.options.uuid_options, this.makeSeed(student));
    this.checkExam(ae);

    this.assignedExams.push(ae);
    this.assignedExamsByUniqname[student.uniqname] = ae;

    assert(ae.pointsPossible === this.assignedExams[0].pointsPossible, `Error: Inconsistent total point values. ${this.assignedExams[0].student.uniqname}=${this.assignedExams[0].pointsPossible}, ${ae.student.uniqname}=${ae.pointsPossible}.`.red);

    return ae;
  }

  private makeSeed(student: StudentInfo) {

    // NOTE: DO NOT change the ordering of the components in the composite seed

    let composite_seed = this.options.consistent_randomization ? "common" : student.uniqname;
    if (this.options.seed) {
      if (this.options.seed.startsWith("legacy-no-dash-")) {
        // legacy seeds had no dash between parts of the composite seed
        composite_seed += this.options.seed.substring(15);
      }
      else {
        composite_seed += ("-" + this.options.seed);
      }
    }
    return composite_seed;
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
        ? ++this.sectionStatsMap[section.section_id].n && assert(
            this.options.allow_duplicates
            || section.spec === this.sectionStatsMap[section.section_id].section.spec
            || stringifyExamComponentSpecification(section.spec) === stringifyExamComponentSpecification(this.sectionStatsMap[section.section_id].section.spec),
          `Multiple sections from different specifications with the ID "${section.section_id}" were detected.`)
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
        ? ++this.questionStatsMap[question.question_id].n && assert(
          this.options.allow_duplicates
            || question.spec === this.questionStatsMap[question.question_id].question.spec
            || stringifyExamComponentSpecification(question.spec) === stringifyExamComponentSpecification(this.questionStatsMap[question.question_id].question.spec),
          `Multiple questions from different specifications with the ID "${question.question_id}" were detected.`)
        : this.questionStatsMap[question.question_id] = {
          question: question,
          n: 1
        }
    );

  }

  private writeStats(dataDir: string) {
    // Create output directory
    mkdirSync(`${dataDir}/${this.exam.exam_id}/`, { recursive: true });

    // Write to file. JSON.stringify removes the section/question objects
    writeFileSync(`${dataDir}/${this.exam.exam_id}/stats.json`, json_stable_stringify({
      sections: this.sectionStatsMap,
      questions: this.questionStatsMap
    }, { replacer: (k, v) => k === "section" || k === "question" ? undefined : v, space: 2 }));

  }

  private updateStats(dataDir: string) {
    // Load stats if already there
    try {
      const existing_stats : ExamStats = JSON.parse(readFileSync(`${dataDir}/${this.exam.exam_id}/stats.json`, "utf8"));
      const new_stats: ExamStats = { sections: this.sectionStatsMap, questions: this.questionStatsMap };
      // Merge existing stats with new stats
      Object.entries(existing_stats.sections).forEach(([section_id, stats]) => {
        if (new_stats.sections[section_id]) {
          new_stats.sections[section_id].n += stats.n;
        }
        else {
          new_stats.sections[section_id] = stats;
        }
      });
      Object.entries(existing_stats.questions).forEach(([question_id, stats]) => {
        if (new_stats.questions[question_id]) {
          new_stats.questions[question_id].n += stats.n;
        }
        else {
          new_stats.questions[question_id] = stats;
        }
      });
      
      // Write updated stats
      // JSON.stringify removes the section/question objects

      writeFileSync(`${dataDir}/${this.exam.exam_id}/stats.json`, json_stable_stringify({
        sections: this.sectionStatsMap,
        questions: this.questionStatsMap
      }, { replacer: (k, v) => k === "section" || k === "question" ? undefined : v, space: 2 }));
    }
    catch(e) {
      if (e instanceof Error && 'code' in e && e.code === "ENOENT") {
        // No existing stats, just write new stats
        this.writeStats(dataDir);
      }
      else {
        throw e;
      }
    }
  }

  private writeAssets(outDir: string) {

    const assetOutDir = path.join(outDir, this.options.frontend_assets_dir);
    
    if (this.options.assets_bundle_dir) {
      ncp(
        this.options.assets_bundle_dir,
        assetOutDir,
        (err) => { // callback
          if (err) {
            console.error("Error copying exam assets: ".red + err);
          }
        }
      );
    }
    else {
      ExamUtils.writeExamAssets(assetOutDir, this.exam, <Section[]>Object.values(this.sectionsMap), <Question[]>Object.values(this.questionsMap));
    }
  }

  public renderExams(exam_renderer: ExamRenderer) {
    return this.assignedExams.map((ex, i) => {
      console.log(`${i + 1}/${this.assignedExams.length} Rendering assigned exam html for ${ex.student.uniqname}`);
      this.onStatus && this.onStatus(`Phase 2/3: Rendering exams... (${i + 1}/${this.totalExams})`);
      return exam_renderer.renderAll(ex, this.options.frontend_js_path);
    });
  }

  public writeAll(exam_renderer: ExamRenderer, outDir: string = "out", dataDir: string = "data", clearExisting: boolean = true) {
    this.onStatus && this.onStatus("Phase 3/3: Saving exam data...")

    const no_assets_exam_spec = exam_spec_without_assets_dirs(this.exam.spec);

    // Write exam specification as JSON to data folder
    mkdirSync(`${dataDir}/${this.exam.exam_id}`, { recursive: true });
    ExamUtils.writeExamSpecificationToFileSync(
      `${dataDir}/${this.exam.exam_id}/exam-spec.json`,
      no_assets_exam_spec
    );

    const examDir = path.join(outDir, `${this.exam.exam_id}/exams`);
    const manifestDir = path.join(dataDir, `${this.exam.exam_id}/manifests`);

    // Create output directories and clear previous contents
    mkdirSync(examDir, { recursive: true });
    if (clearExisting) { del.sync(`${examDir}/*`); }
    mkdirSync(manifestDir, { recursive: true });
    if (clearExisting) { del.sync(`${manifestDir}/*`); }

    // Write frontend js files
    writeFrontendFile(path.join(examDir, this.options.frontend_js_path), "frontend.js");
    writeFrontendFile(path.join(examDir, this.options.frontend_js_path), "frontend-solution.js");
    writeFrontendFile(path.join(examDir, this.options.frontend_js_path), "frontend-doc.js");

    // Write frontend assets
    this.writeAssets(`${examDir}`);

    // Write frontend exam specification
    const specDir = path.join(outDir, this.exam.exam_id, "spec");
    mkdirSync(specDir, { recursive: true });
    if (clearExisting) { del.sync(`${specDir}/*`); }
    ExamUtils.writeExamSpecificationToFileSync(
      path.join(specDir,"exam-spec.json"),
      (no_assets_exam_spec.allow_clientside_content
        ? no_assets_exam_spec
        : without_content(no_assets_exam_spec)
      )
    );

    if (clearExisting) {
      this.writeStats(dataDir);
    }
    else {
      this.updateStats(dataDir);
    }

    let filenames : string[][] = [];

    let manifests = this.assignedExams.map(ex => ex.createManifest());
    let renderedExams = this.renderExams(exam_renderer);

    let toWrite = manifests
      .map((m, i) => ({
        manifest: m,
        renderedHtml: renderedExams[i]
      }))
      .sort((a, b) => a.manifest.student.uniqname.localeCompare(b.manifest.student.uniqname));
    
    const clientside_manifest_dir = path.join(outDir, this.exam.exam_id, "manifests");
    if (this.exam.allow_clientside_content) {
      
      mkdirSync(clientside_manifest_dir, { recursive: true });
      if (clearExisting) { del.sync(`${clientside_manifest_dir}/*`); }
    }

    // Write out manifests and exams for all, sorted by uniqname
    toWrite.forEach((ex, i, arr) => {
      let manifest = ex.manifest;
      // Create filename, add to list
      let filenameBase = createManifestFilenameBase(manifest.student.uniqname, manifest.uuid);
      filenames.push([manifest.student.uniqname, filenameBase])

      const manifest_str = stringifyExamSubmission(manifest);

      console.log(`${i + 1}/${arr.length} Saving assigned exam manifest for ${manifest.student.uniqname} to ${filenameBase}.json`);
      writeFileSync(`${manifestDir}/${filenameBase}.json`, manifest_str, {encoding: "utf-8"});
      
      console.log(`${i + 1}/${arr.length} Saving assigned exam html for ${manifest.student.uniqname} to ${filenameBase}.html`);
      writeFileSync(`${examDir}/${filenameBase}.html`, ex.renderedHtml, {encoding: "utf-8"});

      const clientside_manifest_str = this.exam.allow_clientside_content ? manifest_str : stringifyExamSubmission(makeOpaque(manifest));
      if (this.exam.allow_clientside_content) {
        console.log(`${i + 1}/${arr.length} Saving clientside exam manifest for ${manifest.student.uniqname} to ${filenameBase}.json`);
        writeFileSync(`${clientside_manifest_dir}/${filenameBase}.json`, clientside_manifest_str, {encoding: "utf-8"});
      }

    });

    writeFileSync(`${dataDir}/${this.exam.exam_id}/student-ids.csv`, unparse({
      fields: ["uniqname", "filenameBase"],
      data: filenames 
    }));

  }

}

