import 'colors';
import del from 'del';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { Exam, Question, Section } from './core/exam_components';
import { renderAnnouncements, renderHead, renderInstructions } from './core/exam_renderer';
import { chooseAllSkins, QuestionChooser, realizeQuestion, realizeSection, SectionChooser, SkinChooser } from './core/exam_specification';
import { createCompositeSkin, ExamComponentSkin } from './core/skins';
import { renderPointsWorthBadge } from './core/ui_components';
import { assertNever } from './core/util';
import { ExamUtils, writeFrontendJS } from './ExamUtils';


const NO_REFERNECE_MATERIAL = "This section has no reference material."

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

  private writeMedia(outDir: string) {
    let mediaOutDir = path.join(outDir, this.options.frontend_media_dir);
    ExamUtils.writeExamMedia(mediaOutDir, this.exam, <Section[]>Object.values(this.sectionsMap), <Question[]>Object.values(this.questionsMap));
  }

  public renderPreview() {
    return `
      <!DOCTYPE html>
      <html>
      ${renderHead(`
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css">
        <script src="${path.join(this.options.frontend_js_path, "frontend-preview.js")}"></script>
      `)}
      <body>
        ${this.renderBody()}
      </body>
      </html>
    `;
  }

  protected renderBody() {
    return `<div id="examma-ray-exam" class="container-fluid" data-exam-id="${this.exam.exam_id}">
      <div class="row">
        <div class="bg-light" style="position: fixed; width: 300px; top: 0; left: 0; bottom: 0; padding-left: 5px; z-index: 10; overflow-y: auto; border-right: solid 1px #dedede; font-size: 85%">
          <div class="text-center pb-1 border-bottom">
            <h5>${renderPointsWorthBadge(-1, "badge-success")}</h5>
            <span style="font-size: large; font-weight: bold; color: red;">Sample Solution</span>
          </div>
          ${this.renderNav()}
        </div>
        <div style="margin-left: 310px; width: calc(100% - 320px);">
          ${this.renderHeader()}
          ${this.renderSections()}
        </div>
      </div>
    </div>`;
  }

  protected renderNav() {
    return `<ul class="nav show-small-scrollbar" style="display: block; flex-grow: 1; font-weight: 500; overflow-y: scroll">
      ${this.exam.sections.map((s, i) => 
        this.renderSectionOrChooserNav(s, i+1, true)
      ).join("")}
    </ul>`;
  }

  protected renderSectionOrChooserNav(s: Section | SectionChooser, section_index: number, show_index: boolean) : string {
    return (
      s.component_kind === "component" ? this.renderSectionNav(s, section_index, show_index) :
      s.component_kind === "chooser" ? this.renderSectionChooserNav(s, section_index, show_index) :
      assertNever(s)
    );
  }

  protected renderSectionNav(s: Section, section_index: number, show_index: boolean) {
    return `<li class = "nav-item text-truncate er-preview-nav er-preview-nav-section">
      ${show_index ? section_index : ""}
      <a style="padding: 0.1rem" href="#section-${s.section_id}">
        ${s.title}
      </a>
      <ul class="nav er-preview-nav-group">
        ${s.questions.map((q, i) => 
          this.renderQuestionOrChooserNav(q, section_index, i+1, true)
        ).join("")}
      </ul>
    </li>`;
  }

  protected renderSectionChooserNav(section: SectionChooser, section_index: number, show_index: boolean) {
    return `<li class = "nav-item text-truncate er-preview-nav er-preview-nav-section-chooser">
    ${this.renderChooserHeader(section, (offset) => `${section_index+offset}`)}
      <ul class="nav er-preview-nav-group">
        ${section.spec.choices.map(
          (s, i) => this.renderSectionOrChooserNav(
            realizeSection(s), section_index,
            section.spec.strategy.kind === "group" || section.spec.strategy.kind === "shuffle"
          )
        ).join("")}
      </ul>
    </li>`;
  }

  protected renderQuestionOrChooserNav(q: Question | QuestionChooser, section_index: number, question_index: number, show_index: boolean) : string {
    return (
      q.component_kind === "component" ? this.renderQuestionNav(q, section_index, question_index, show_index) :
      q.component_kind === "chooser" ? this.renderQuestionChooserNav(q, section_index, question_index, show_index) :
      assertNever(q)
    );
  }

  protected renderQuestionNav(q: Question, section_index: number, question_index: number, show_index: boolean) {
    return `<li class = "nav-item text-truncate er-preview-nav er-preview-nav-question">
      ${show_index ? section_index+"."+question_index : ""} 
      <a style="padding: 0.1rem" href="#question-anchor-${q.question_id}">
        ${q.question_id}
      </a>
    </li>`;
  }

  protected renderQuestionChooserNav(question: QuestionChooser, section_index: number, question_index: number, show_index: boolean) {
    return `<li class = "nav-item text-truncate er-preview-nav er-preview-nav-question-chooser">
      ${this.renderChooserHeader(question, (offset) => `${section_index}.${question_index+offset}`)}
      <ul class="nav er-preview-nav-group">
        ${question.spec.choices.map(
          (q, i) => this.renderQuestionOrChooserNav(
            realizeQuestion(q), section_index, question_index,
            question.spec.strategy.kind === "group" || question.spec.strategy.kind === "shuffle"
          )
        ).join("")}
      </ul>
    </li>`;
  }

  protected renderChooserHeader(chooser: SectionChooser | QuestionChooser | SkinChooser, display_index: (offset: number) => string) {
    const strategy = chooser.spec.strategy;
    return `<div>${(
      strategy.kind === "group" ? `<i class="bi bi-collection"></i> Group` :
      strategy.kind === "random_1" ? `${display_index(0)} <i class="bi bi-dice-6"></i> Random 1` :
      strategy.kind === "random_n" ? `${display_index(0)}-${display_index(strategy.n)} {<i class="bi bi-dice-6"></i> Random ${strategy.n}` :
      strategy.kind === "shuffle" ? `<i class="bi bi-shuffle"></i> shuffle` :
      assertNever(strategy)
    )}</div>`;
  }

  // protected renderNav() {
  //   return `
  //     <ul class="nav show-small-scrollbar" style="display: block; flex-grow: 1; font-weight: 500; overflow-y: scroll">
  //       ${this.exam.sections.map(s => ).join("")}
  //     </ul>`
  // }

  protected renderNavBadge(s: Section) {
    return renderPointsWorthBadge(-1, "badge-secondary", true);
  }
  
  protected renderHeader() {
    return `
      <div class="examma-ray-header">
        <div class="text-center mb-3 border-bottom">
          <h2>${this.exam.title}</h2>
          <h4 style="color: purple; font-weight: bold;">Exam Preview</h4>
        </div>
        <div>
          ${renderInstructions(this.exam)}
          ${renderAnnouncements(this.exam)}
        </div>
      </div>
    `;
  }
  
  protected renderSections() {
    return this.exam.sections.map((s, i) => 
      s.component_kind === "component" ? this.renderSection(s, i+1) :
      s.component_kind === "chooser" ? this.renderSectionChooser(s, i+1) :
      assertNever(s)
    ).join("<br />");
  }


  protected renderSection(section: Section, section_index: number) {
    const sectionSkins = chooseAllSkins(section.skin);
    const skin = sectionSkins[0];
    return `
      <div id="section-${section.section_id}" class="examma-ray-section">
        <hr />
        <table class="examma-ray-section-contents">
          <tr>
            <td class="examma-ray-questions-container">
              ${this.renderSectionHeader(section, section_index)}
              <div class="examma-ray-section-description">${section.renderDescription(skin)}</div>
              ${section.questions.map((q, i) => 
                q.component_kind === "component" ? this.renderQuestion(q, section_index, i+1, skin) :
                q.component_kind === "chooser" ? this.renderQuestionChooser(q, section_index, i+1, skin) :
                assertNever(q)
              ).join("<br />")}
            </td>
            <td class="examma-ray-section-reference-column" style="width: ${section.reference_width}%;">
              <div class="examma-ray-section-reference-container">
                <div class="examma-ray-section-reference">
                  <div class = "examma-ray-section-reference-width-slider-container">
                    <div class = "examma-ray-section-reference-width-value">${section.reference_width}%</div>
                    <input class="examma-ray-section-reference-width-slider" type="range" min="10" max="100" step="10" value="${section.reference_width}">
                  </div>
                  <h6>Reference Material (Section ${section_index})</h6>
                  ${section.renderReference(skin) ?? NO_REFERNECE_MATERIAL}
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }
  
  protected renderSectionHeader(s: Section, section_index: number) {
    return `
      <div class="examma-ray-section-heading">
        <div class="badge badge-primary">
          ${section_index}: ${s.title} ${renderPointsWorthBadge(-1, "badge-light")}
        </div>
      </div>
    `;
  }

  protected renderSectionChooser(s: SectionChooser, section_index: number) {
    return s.all_choices.map(
      (s, i) => this.renderSection(realizeSection(s), section_index)
    ).join("<br />");
  }

  protected renderQuestion(question: Question, section_index: number, question_index: number, section_skin: ExamComponentSkin) {
    const questionSkins = chooseAllSkins(question.skin);
    const skin = section_skin ? createCompositeSkin(section_skin, questionSkins[0]) : questionSkins[0];
    const q_id = question.question_id;
    return `
      <div id="question-${q_id}" class="examma-ray-question card-group">
        <div id="question-anchor-${q_id}" class="examma-ray-question-anchor"></div>
        <div class="card">
          <div class="card-header">
            ${this.renderQuestionHeader(question, section_index, question_index)}
          </div>
          <div class="card-body">
            <div class="examma-ray-question-description">
              ${question.renderDescription(skin)}
            </div>
            ${this.renderQuestionContent(question, q_id, skin)}
          </div>
        </div>
      </div>
    `;
  }
  
  protected renderQuestionHeader(question: Question, section_index: number, question_index: number) {
    return `
      <b>${section_index}.${question_index}</b>
      ${renderPointsWorthBadge(-1)}
      <span class="badge badge-info" style="font-family: monospace;">${question.question_id}</span>
    `;
  }
  
  protected renderQuestionContent(question: Question, q_id: string, skin: ExamComponentSkin) {
    return question.renderResponse(q_id, skin);
  }

  protected renderQuestionChooser(chooser: QuestionChooser, section_index: number, question_index: number, section_skin: ExamComponentSkin) {
    return chooser.all_choices.map(
      (q, i) => this.renderQuestion(realizeQuestion(q), section_index, question_index, section_skin)
    ).join("<br />");
  }

  public writeAll(previewDir: string = "preview") {
    this.onStatus && this.onStatus("Phase 3/3: Saving exam data...")

    previewDir = path.join(previewDir, `${this.exam.exam_id}`);
    // Create output directories and clear previous contents
    mkdirSync(previewDir, { recursive: true });
    del.sync(`${previewDir}/*`);

    writeFrontendJS(`${previewDir}/js`, "frontend.js");
    writeFrontendJS(`${previewDir}/js`, "frontend-preview.js");
    writeFrontendJS(`${previewDir}/js`, "frontend-solution.js");
    this.writeMedia(`${previewDir}`);

    writeFileSync(`${previewDir}/preview.html`, this.renderPreview(), {encoding: "utf-8"});

  }

}

