import 'colors';
import del from 'del';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { Exam, Question, Section } from './core/exam_components';
import { renderAnnouncements, renderHead, renderInstructions } from './core/exam_renderer';
import { chooseAllSkins, MinMaxPoints, QuestionChooser, realizeQuestion, realizeSection, SectionChooser, SkinChooser } from './core/exam_specification';
import { createCompositeSkin, ExamComponentSkin, isDefaultSkin } from './core/skins';
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

  private options: ExamPreviewOptions;

  private onStatus?: (status: string) => void;

  public constructor(exam: Exam, options: Partial<ExamPreviewOptions> = {}, onStatus?: (status: string) => void) {
    this.exam = exam;
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.onStatus = onStatus;
  }

  private writeMedia(outDir: string) {
    let mediaOutDir = path.join(outDir, this.options.frontend_media_dir);
    ExamUtils.writeExamMedia(mediaOutDir, this.exam, this.exam.allSections, this.exam.allQuestions);
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

  private renderBody() {
    return `<div id="examma-ray-exam" class="container-fluid" data-exam-id="${this.exam.exam_id}">
      <div class="row">
        <div class="bg-light" style="position: fixed; width: 300px; top: 0; left: 0; bottom: 0; padding-left: 5px; z-index: 10; overflow-y: auto; border-right: solid 1px #dedede; font-size: 85%">
          <div class="text-center pb-1 border-bottom">
            <h5>${this.renderMinMaxPointsBadge(this.exam.points, "badge-secondary")}</h5>
            <span style="font-size: large; font-weight: bold; color: purple;">Exam Preview</span>
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

  private renderNav() {
    return `<ul class="nav show-small-scrollbar" style="display: block; flex-grow: 1; font-weight: 500; overflow-y: scroll">
      ${this.exam.sections.map((s, i) => 
        this.renderSectionOrChooserNav(s, i+1, true)
      ).join("")}
    </ul>`;
  }

  private renderSectionOrChooserNav(section: Section | SectionChooser, section_index: number, show_index: boolean) : string {
    return (
      section.component_kind === "component" ? this.renderSectionNav(section, section_index, show_index) :
      section.component_kind === "chooser" ? this.renderSectionChooserNav(section, section_index, show_index) :
      assertNever(section)
    );
  }

  private renderSectionNav(section: Section, section_index: number, show_index: boolean) {
    return `<li class = "nav-item text-truncate er-preview-nav er-preview-nav-section">
      ${show_index ? section_index : ""} ${this.renderSkinOrChooserNavIcon(section.skin)}
      <a style="padding: 0.1rem" href="#section-${section.section_id}">
        ${section.title}
      </a>
      <ul class="nav er-preview-nav-group">
        ${section.questions.map((q, i) => 
          this.renderQuestionOrChooserNav(q, section_index, i+1, true)
        ).join("")}
      </ul>
    </li>`;
  }

  private renderSectionChooserNav(section: SectionChooser, section_index: number, show_index: boolean) {
    return `<li class = "nav-item text-truncate er-preview-nav er-preview-nav-section-chooser">
      ${this.renderChooserNavHeader(section, (offset) => `${section_index+offset}`)}
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

  private renderQuestionOrChooserNav(question: Question | QuestionChooser, section_index: number, question_index: number, show_index: boolean) : string {
    return (
      question.component_kind === "component" ? this.renderQuestionNav(question, section_index, question_index, show_index) :
      question.component_kind === "chooser" ? this.renderQuestionChooserNav(question, section_index, question_index, show_index) :
      assertNever(question)
    );
  }

  private renderQuestionNav(question: Question, section_index: number, question_index: number, show_index: boolean) {
    return `<li class = "nav-item text-truncate er-preview-nav er-preview-nav-question">
      ${show_index ? section_index+"."+question_index : ""} ${this.renderSkinOrChooserNavIcon(question.skin)}
      <a style="padding: 0.1rem" href="#question-anchor-${question.question_id}">
        ${question.question_id}
      </a>
    </li>`;
  }

  private renderQuestionChooserNav(question: QuestionChooser, section_index: number, question_index: number, show_index: boolean) {
    return `<li class = "nav-item text-truncate er-preview-nav er-preview-nav-question-chooser">
      ${this.renderChooserNavHeader(question, (offset) => `${section_index}.${question_index+offset}`)}
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

  private renderChooserNavHeader(chooser: SectionChooser | QuestionChooser | SkinChooser, display_index: (offset: number) => string) {
    const strategy = chooser.spec.strategy;
    return `<div>${(
      strategy.kind === "group" ? `<i class="bi bi-collection"></i> Group` :
      strategy.kind === "random_1" ? `${display_index(0)} <i class="bi bi-dice-6"></i> Random 1` :
      strategy.kind === "random_n" ? `${display_index(0)}-${display_index(strategy.n-1)} <i class="bi bi-dice-6"></i> Random ${strategy.n}` :
      strategy.kind === "shuffle" ? `<i class="bi bi-shuffle"></i> shuffle` :
      assertNever(strategy)
    )}</div>`;
  }
  
  private renderSkinOrChooserNavIcon(skin: ExamComponentSkin | SkinChooser) {
    return skin.component_kind === "chooser" ? this.renderSkinChooserNavIcon(skin) : this.renderSkinIcon(skin);
  }
  
  private renderSkinIcon(skin: ExamComponentSkin) {
    if (isDefaultSkin(skin)) {
      return "";
    }
    
    return `<span class="er-preview-skin-icon" data-toggle="tooltip" data-placement="top" title="1 skin">
      <i class="bi bi-sunglasses"></i><sub>1</sub>
    </span>`;
  }

  private renderSkinChooserNavIcon(chooser: SkinChooser) {
    let n = chooser.all_choices.length;
    return `<span class="er-preview-skin-icon" data-toggle="tooltip" data-placement="top" title="${n} skin${n > 1 ? "s" : ""} ">
      <i class="bi bi-sunglasses"></i><sub>${n}</sub>
    </span>`;
  }


  // private renderNav() {
  //   return `
  //     <ul class="nav show-small-scrollbar" style="display: block; flex-grow: 1; font-weight: 500; overflow-y: scroll">
  //       ${this.exam.sections.map(s => ).join("")}
  //     </ul>`
  // }

  private renderMinMaxPointsBadge(points: MinMaxPoints, cssClass?: string) {
    if (points.min_points === points.max_points) {
      return renderPointsWorthBadge(points.min_points, cssClass);
    }
    else {
      return renderPointsWorthBadge(points.min_points, cssClass) + renderPointsWorthBadge(points.max_points, cssClass);
    }
  }
  
  private renderHeader() {
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
  
  private renderSections() {
    return this.exam.sections.map((s, i) => 
      s.component_kind === "component" ? this.renderSection(s, i+1) :
      s.component_kind === "chooser" ? this.renderSectionChooser(s, i+1) :
      assertNever(s)
    ).join("<br />");
  }


  private renderSection(section: Section, section_index: number) {
    const sectionSkins = chooseAllSkins(section.skin);
    return `
      <div id="section-${section.section_id}">
        ${sectionSkins.map((skin, i) =>`
          <div data-skin-id="${skin.skin_id}" class="examma-ray-section" style="display: ${i === 0 ? "block" : "none"};">
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
        `).join("\n")}
      </div>
      `;
  }
  
  private renderSectionHeader(section: Section, section_index: number) {
    return `
      <div class="examma-ray-section-heading">
        <div class="badge badge-primary">
          ${section_index}: ${section.title} ${this.renderMinMaxPointsBadge(section.points, "badge-light")}
        </div>
        ${this.renderSectionHeaderSkin(section.section_id, section.skin)}
      </div>
    `;
  }
  
  private renderSectionHeaderSkin(section_id: string, skin: ExamComponentSkin | SkinChooser) {
    if (skin.component_kind === "chooser") {
      return this.renderSectionHeaderSkinPicker(section_id, skin);
    }
    else {
      return this.renderSkinIcon(skin);
    }
  }

  private renderSectionHeaderSkinPicker(section_id: string, chooser: SkinChooser) {
    return `<div class="btn-group" style="float: right;">
      <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span class="er-preview-skin-icon" >
          <i class="bi bi-sunglasses"></i><sub><span class="er-current-section-skin-num">1</span>/${chooser.all_choices.length}</sub>
        </span>
        <span class="er-current-section-skin-id" style="font-family: monospace;">${chooser.all_choices[0].skin_id}</span>
      </button>
      <div class="dropdown-menu">
        ${chooser.all_choices.map((skin, i) => `
          <button class="er-section-skin-picker-link dropdown-item" data-section-id="${section_id}" data-skin-id="${skin.skin_id}" data-skin-num="${i+1}">${skin.skin_id}</button>
        `).join("\n")}
      </div>
    </div>`;
  }

  private renderSectionChooser(section: SectionChooser, section_index: number) {
    return section.all_choices.map(
      (s, i) => this.renderSection(realizeSection(s), section_index)
    ).join("<br />");
  }

  private renderQuestion(question: Question, section_index: number, question_index: number, section_skin: ExamComponentSkin) {
    const questionSkins = chooseAllSkins(question.skin).map(q_skin => createCompositeSkin(section_skin, q_skin));
    const q_id = question.question_id;
    return `
      <div id="question-${q_id}" >
        ${questionSkins.map((skin, i) =>`
          <div data-skin-id="${skin.non_composite_skin_id}" class="examma-ray-question card-group" style="display: ${i === 0 ? "block" : "none"};">
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
        `).join("\n")}
      </div>
    `;
  }
  
  private renderQuestionHeader(question: Question, section_index: number, question_index: number) {
    return `
      <b>${section_index}.${question_index}</b>
      ${renderPointsWorthBadge(question.pointsPossible)}
      <span class="badge badge-info" style="font-family: monospace;">${question.question_id}</span>
      ${this.renderQuestionHeaderSkin(question.question_id, question.skin)}
    `;
  }
  
  private renderQuestionHeaderSkin(question_id: string, skin: ExamComponentSkin | SkinChooser) {
    if (skin.component_kind === "chooser") {
      return this.renderQuestionHeaderSkinPicker(question_id, skin);
    }
    else {
      return this.renderSkinIcon(skin);
    }
  }

  private renderQuestionHeaderSkinPicker(question_id: string, chooser: SkinChooser) {
    return `<div class="btn-group" style="float: right;">
      <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span class="er-preview-skin-icon">
          <i class="bi bi-sunglasses"></i><sub><span class="er-current-question-skin-num">1</span>/${chooser.all_choices.length}</sub>
        </span>
        <span class="er-current-question-skin-id" style="font-family: monospace;">${chooser.all_choices[0].skin_id}</span>
      </button>
      <div class="dropdown-menu">
        ${chooser.all_choices.map((skin, i) => `
          <button class="er-question-skin-picker-link dropdown-item" data-question-id="${question_id}" data-skin-id="${skin.skin_id}" data-skin-num="${i+1}">${skin.skin_id}</button>
        `).join("\n")}
      </div>
    </div>`;
  }
  
  private renderQuestionContent(question: Question, q_id: string, skin: ExamComponentSkin) {
    return question.renderResponse(q_id, skin);
  }

  private renderQuestionChooser(chooser: QuestionChooser, section_index: number, question_index: number, section_skin: ExamComponentSkin) {
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

