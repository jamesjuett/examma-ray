import 'colors';
import { writeFileSync, mkdirSync } from 'fs';
import json_stable_stringify from "json-stable-stringify";
import { AssignedExam, AssignedQuestion, AssignedSection } from './core/assigned_exams';
import { ExamRenderer, OriginalExamRenderer, renderAnnouncements, renderHead, renderInstructions } from './core/exam_renderer';
import { createQuestionSkinRandomizer, createSectionChoiceRandomizer, createQuestionChoiceRandomizer, createSectionSkinRandomizer, Randomizer } from "./core/randomization";
import { assert } from './core/util';
import { unparse } from 'papaparse';
import del from 'del';
import { chooseQuestions, chooseSections, realizeQuestions, realizeSections, StudentInfo } from './core/exam_specification';
import { createCompositeSkin, ExamComponentSkin } from './core/skins';
import { createStudentUuid, writeFrontendJS, ExamUtils } from './ExamUtils';
import path from 'path';
import { Exam, Question, Section } from './core/exam_components';
import { renderPointsWorthBadge } from './core/ui_components';

export type ExamPreviewOptions = {
  frontend_js_path: string,
  frontend_media_dir: string,
};

const DEFAULT_OPTIONS = {
  frontend_js_path: "js/",
  frontend_media_dir: "media"
};

export type ExamPreviewSpecification = Partial<ExamPreviewOptions>;

export class ExamPreview {

  public readonly exam: Exam;

  private readonly sectionsMap: { [index: string]: Section | undefined } = {};
  private readonly questionsMap: { [index: string]: Question | undefined } = {};

  private options: ExamPreviewOptions;

  private onStatus?: (status: string) => void;

  public constructor(exam: Exam, options: Partial<ExamPreviewOptions> = {}, onStatus?: (status: string) => void) {
    this.exam = exam;
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.onStatus = onStatus;
  }

  private createRandomizedExam() {
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
    let sectionSkins = section.skin.component_kind === "chooser" ? section.skin.choose(this.exam, student, skinRand) : [section.skin];
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

    let questionSkins =
      (question.skin.component_kind === "chooser" ? question.skin.choose(this.exam, student, rand) : [question.skin])
      .map(qSkin => createCompositeSkin(sectionSkin, qSkin));
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

  public renderPreview() {
    return `
      <!DOCTYPE html>
      <html>
      ${renderHead(
        `<script src="${path.join(this.options.frontend_js_path, "frontend.js")}"></script>`
      )}
      <body>
        ${this.renderBody()}
      </body>
      </html>
    `;
  }

  protected renderBody() {
    return `<div id="examma-ray-exam" class="container-fluid" data-exam-id="${this.exam.exam_id}">
      <div class="row">
        <div class="bg-light" style="position: fixed; width: 200px; top: 0; left: 0; bottom: 0; padding-left: 5px; z-index: 10; overflow-y: auto; border-right: solid 1px #dedede; font-size: 85%">
          <div class="text-center pb-1 border-bottom">
            <h5>${renderPointsWorthBadge(-1, "badge-success")}</h5>
            <span style="font-size: large; font-weight: bold; color: red;">Sample Solution</span>
          </div>
          ${this.renderNav()}
        </div>
        <div style="margin-left: 210px; width: calc(100% - 220px);">
          ${this.renderHeader()}
          ${this.renderSections(ae)}
        </div>
      </div>
    </div>`;
  }

  protected renderNav() {
    return `
      <ul class="nav show-small-scrollbar" style="display: unset; flex-grow: 1; font-weight: 500; overflow-y: scroll">
        ${this.exam.sections.map(s => `<li class = "nav-item">
          <a class="nav-link text-truncate" style="padding: 0.1rem" href="#section-${s.uuid}">${this.renderNavBadge(s)} ${s.displayIndex + ": " + s.section.title}</a>
        </li>`).join("")}
      </ul>`
  }

  protected renderNavBadge(s: AssignedSection) {
    return renderPointsWorthBadge(s.pointsPossible, "badge-secondary", true);
  }
  
  protected renderHeader() {
    return `
      <div class="examma-ray-header">
        <div class="text-center mb-3 border-bottom">
          <h2>${this.exam.title}</h2>
          <h6 style="color: purple; font-weight: bold;">Exam Preview</h6>
        </div>
        <div>
          ${renderInstructions(this.exam)}
          ${renderAnnouncements(this.exam)}
        </div>
      </div>
    `;
  }

  public writeAll(exam_renderer: ExamRenderer, previewDir: string = "preview") {
    this.onStatus && this.onStatus("Phase 3/3: Saving exam data...")

    previewDir = path.join(previewDir, `${this.exam.exam_id}`);
    // Create output directories and clear previous contents
    mkdirSync(previewDir, { recursive: true });
    del.sync(`${previewDir}/*`);

    writeFrontendJS(`${previewDir}/js`, "frontend.js");
    writeFrontendJS(`${previewDir}/js`, "frontend-solution.js");
    this.writeMedia(`${previewDir}`);

    writeFileSync(`${previewDir}/preview.html`, this.renderPreview(), {encoding: "utf-8"});

  }

}

