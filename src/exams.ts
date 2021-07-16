import { FILE_CHECK, FILE_DOWNLOAD, FILE_UPLOAD, FILLED_STAR } from './icons';
import { asMutable, assert, Mutable } from './util';
import { parse_submission, ResponseSpecification, render_response, SubmissionType } from './response/responses';
import { BLANK_SUBMISSION, ResponseKind } from './response/common';
import { mk2html } from './render';
import { maxPrecisionString, renderFixedPrecisionBadge, renderPointsWorthBadge, renderScoreBadge, renderUngradedBadge } from "./ui_components";
import { Exception, GraderMap } from './ExamGrader';
import { QuestionGrader, GradingResult } from './QuestionGrader';
import { QuestionSpecification, SkinGenerator, SectionSpecification, QuestionChooser, SectionChooser, ExamSpecification, DEFAULT_SKIN_GENERATOR } from './specification';
import { DEFAULT_SKIN, QuestionSkin } from './skins';
import { ExamManifest } from './submissions';
import { sum } from 'simple-statistics';
import { AppliedCurve, ExamCurve } from './ExamCurve';


export enum RenderMode {
  ORIGINAL = "ORIGINAL",
  GRADED = "GRADED",
}

export interface StudentInfo {
  readonly uniqname: string;
  readonly name: string;
}



export class Question<QT extends ResponseKind = ResponseKind> {

  // public readonly raw_description: string;
  // public readonly description: string;
  // public readonly section: Section;
  public readonly spec: QuestionSpecification<QT>;
  public readonly question_id: string;
  public readonly tags: readonly string[];
  public readonly mk_description: string;
  public readonly pointsPossible : number;
  public readonly kind: QT;
  public readonly response : ResponseSpecification<QT>;
  public readonly skins: SkinGenerator;
  public readonly sampleSolution?: Exclude<SubmissionType<QT>, typeof BLANK_SUBMISSION>;
  public readonly defaultGrader?: QuestionGrader<QT>;

  private readonly descriptionCache: {
    [index:string] : string | undefined
  } = {};

  public constructor (spec: QuestionSpecification<QT>) {
    this.spec = spec;
    this.question_id = spec.id;
    this.tags = spec.tags ?? [];
    this.mk_description = spec.mk_description;
    this.pointsPossible = spec.points;
    this.kind = <QT>spec.response.kind;
    this.response = spec.response;
    this.skins = spec.skins ?? DEFAULT_SKIN_GENERATOR;
    this.sampleSolution = <Exclude<SubmissionType<QT>, typeof BLANK_SUBMISSION>>spec.response.sample_solution;
    this.defaultGrader = <QuestionGrader<QT>>spec.response.default_grader;
  }

  public renderResponse(uuid: string, skin?: QuestionSkin) {
    return `<div class="examma-ray-question-response examma-ray-question-response-${this.kind}" data-response-kind="${this.kind}">${render_response(this.response, uuid, skin)}</div>`;
  }

  public renderDescription(skin: QuestionSkin) {
    return this.descriptionCache[skin.id] ??= mk2html(this.mk_description, skin);
  }

  public isKind<RK extends QT>(kind: RK) : this is Question<RK> {
    return this.kind === kind;
  }
};

export class AssignedQuestion<QT extends ResponseKind = ResponseKind> {

  public readonly gradedBy?: QuestionGrader<QT>
  public readonly gradingResult?: GradingResult;
  public readonly exception?: Exception;

  public readonly submission: SubmissionType<QT>;

  public readonly displayIndex;

  private readonly html_description: string;

  public constructor(
    public readonly uuid: string,
    public readonly exam: Exam,
    public readonly student: StudentInfo,
    public readonly question: Question<QT>,
    public readonly skin: QuestionSkin,
    public readonly sectionIndex : number,
    public readonly partIndex : number,
    public readonly rawSubmission: string,
  ) {
    this.displayIndex = (sectionIndex+1) + "." + (partIndex+1);
    this.submission = parse_submission(question.kind, rawSubmission);

    this.html_description = question.renderDescription(this.skin);
  }

  public grade(grader: QuestionGrader<QT>) {
    (<Mutable<this>>this).gradingResult = grader.grade(this);
    if (this.gradingResult) {
      (<Mutable<this>>this).gradedBy = grader;
    }
  }

  public addException(exception: Exception) {
    (<Mutable<this>>this).exception = exception;
  }

  public get pointsEarned() : number | undefined {
    return this.exception?.adjustedScore ?? (
      this.isGraded()
        ? Math.max(0, Math.min(this.question.pointsPossible, this.gradedBy.pointsEarned(this.gradingResult)))
        : undefined
    );
  }

  public get pointsEarnedWithoutExceptions() : number | undefined {
    return this.isGraded()
        ? Math.max(0, Math.min(this.question.pointsPossible, this.gradedBy.pointsEarned(this.gradingResult)))
        : undefined;
  }

  public render(mode: RenderMode) {

    if (mode === RenderMode.ORIGINAL) {
      let question_header_html = `<b>${this.displayIndex}</b> ${renderPointsWorthBadge(this.question.pointsPossible)}`;
      return `
        <div id="question-${this.uuid}" data-question-uuid="${this.uuid}" data-question-display-index="${this.displayIndex}" class="examma-ray-question card-group">
          <div class="card">
            <div class="card-header">
              ${question_header_html}
            </div>
            <div class="card-body">
              <div class="examma-ray-question-description">
                ${this.html_description}
              </div>
              ${this.question.renderResponse(this.uuid, this.skin)}
            </div>
          </div>
        </div>
      `;
    }
    else {
      let question_header_html = `<b>${this.displayIndex}</b> ${this.isGraded() ? renderScoreBadge(this.pointsEarned, this.question.pointsPossible): renderUngradedBadge(this.question.pointsPossible)}`;

      let graded_html: string;
      let exception_html = "";
      
      if (this.isGraded()) {
        graded_html = this.gradedBy.renderReport(this);
        exception_html = this.renderExceptionIfPresent();
      }
      else {
        graded_html = `
        <div class="alert alert-danger" role="alert">
          NOT GRADED
        </div>`; 
      }

      let regrades = `
        <div style="text-align: right">
          <input type="checkbox" id="regrade-${this.uuid}-checkbox" class="examma-ray-regrade-checkbox" data-toggle="collapse" data-target="#regrade-${this.uuid}" role="button" aria-expanded="false" aria-controls="regrade-${this.uuid}"></input>
          <label for="regrade-${this.uuid}-checkbox">Mark for Regrade</label>
        </div>
        <div class="collapse examma-ray-question-regrade" id="regrade-${this.uuid}">
          <p>Please describe your regrade request for this question in the box below. After
          marking <b>all</b> questions for which you would like to request a regrade,
          click "Submit Regrade Request" at the bottom of the page.</p>
          <textarea class="examma-ray-regrade-entry"></textarea>
        </div>
      `;

      return `
      <div id="question-${this.uuid}" data-question-uuid="${this.uuid}" data-question-display-index="${this.displayIndex}" class="examma-ray-question card-group">
        <div class="card">
          <div class="card-header">
            ${question_header_html}
          </div>
          <div class="card-body" style="margin-bottom: 1em">
            <div class="examma-ray-question-description">
              ${this.html_description}
            </div>
            <div class="examma-ray-question-exception">
              ${exception_html}
            </div>
            <div class="examma-ray-grading-report">
              ${graded_html}
            </div>
            ${this.exam.enable_regrades ? regrades : ""}
          </div>
        </div>
      </div>`;
    }
  }

  private renderExceptionIfPresent() {
    if (!this.exception) {
      return "";
    }

    return `<div class="alert alert-warning">
      <p><strong>An exception was applied when grading this question.</strong></p>
      <p>Your score on this question was adjusted from <strong>${this.pointsEarnedWithoutExceptions}</strong> to <strong>${this.pointsEarned}</strong>.</p>
      ${mk2html(this.exception.explanation)}
    </div>`;
  }

  public isGraded() : this is GradedQuestion<QT> {
    return !!this.gradingResult;
  }
  
  public wasGradedBy<GR extends GradingResult>(grader: QuestionGrader<QT, GR>) : this is GradedQuestion<QT,GR> {
    return this.gradedBy === grader;
  };

}

export function wereGradedBy<QT extends ResponseKind, GR extends GradingResult>(
  questions: readonly AssignedQuestion<QT>[],
  grader: QuestionGrader<QT, GR>) : questions is readonly GradedQuestion<QT, GR>[]
{
  return questions.every(q => q.wasGradedBy(grader));
}

export interface GradedQuestion<QT extends ResponseKind, GR extends GradingResult = GradingResult> extends AssignedQuestion<QT> {
  readonly pointsEarned: number;
  readonly pointsEarnedWithoutExceptions: number;
  readonly gradedBy: QuestionGrader<QT>;
  readonly gradingResult: GR;
}


export function areAllGradedQuestions<QT extends ResponseKind>(exams: AssignedQuestion[]) : exams is GradedQuestion<QT>[];
export function areAllGradedQuestions<QT extends ResponseKind>(exams: readonly AssignedQuestion[]) : exams is readonly GradedQuestion<QT>[];
export function areAllGradedQuestions<QT extends ResponseKind>(exams: readonly AssignedQuestion[]) : exams is readonly GradedQuestion<QT>[] {
  return exams.every(ex => ex.isGraded());
}

export function isGradedQuestion<QT extends ResponseKind>(aq: AssignedQuestion<QT>) : aq is GradedQuestion<QT> {
  return aq.isGraded();
} 




const DEFAULT_REFERENCE_WIDTH = 40;

export class Section {

  // public readonly raw_description: string;
  // public readonly description: string;
  // public readonly section: Section;
  public readonly spec: SectionSpecification;
  public readonly section_id: string;
  public readonly title: string;
  public readonly mk_description: string;
  public readonly mk_reference?: string;
  public readonly questions: (QuestionSpecification | Question | QuestionChooser)[];
  public readonly skins: SkinGenerator;

  /**
   * Desired width of reference material as a percent (e.g. 40 means 40%).
   * Guaranteed to be an integral value.
   */
  public readonly reference_width: number;

  private readonly descriptionCache: {
    [index:string] : string | undefined
  } = {};

  private readonly referenceCache: {
    [index:string] : string | undefined
  } = {};

  public constructor (spec: SectionSpecification) {
    this.spec = spec;
    this.section_id = spec.id;
    this.title = spec.title;
    this.mk_description = spec.mk_description;
    this.mk_reference = spec.mk_reference;
    this.questions = Array.isArray(spec.questions) ? spec.questions : [spec.questions];
    this.skins = spec.skins ?? DEFAULT_SKIN_GENERATOR;

    this.reference_width = spec.reference_width ?? DEFAULT_REFERENCE_WIDTH;

    assert(
      Number.isInteger(this.reference_width) && 0 <= this.reference_width && this.reference_width <= 100,
      "Reference material width must be an integer between 0 and 100, inclusive."
    );
  }

  public renderDescription(skin: QuestionSkin) {
    return this.descriptionCache[skin.id] ??= mk2html(this.mk_description, skin);
  }

  public renderReference(skin: QuestionSkin) {
    return this.mk_reference && (this.referenceCache[skin.id] ??= mk2html(this.mk_reference, skin));
  }

}


const NO_REFERNECE_MATERIAL = "This section has no reference material."

export class AssignedSection {

  public readonly displayIndex: string;

  public readonly pointsPossible: number;
  public readonly pointsEarned?: number;

  private _isFullyGraded: boolean = false;
  
  private readonly html_description: string;
  private readonly html_reference?: string;

  public constructor(
    public readonly uuid: string,
    public readonly section: Section, 
    public readonly sectionIndex : number,
    public readonly skin: QuestionSkin,
    public readonly assignedQuestions: readonly AssignedQuestion[])
  {
    this.displayIndex = "" + (sectionIndex+1);
    this.pointsPossible = assignedQuestions.reduce((p, q) => p + q.question.pointsPossible, 0);

    this.html_description = section.renderDescription(this.skin);
    this.html_reference = section.renderReference(this.skin);
  }

  public gradeAllQuestions(ex: AssignedExam, graders: GraderMap) {
    this.assignedQuestions.forEach(aq => {
      let grader = graders[aq.question.question_id] ?? aq.question.defaultGrader;
      if (grader) {
        grader.prepare(ex.exam.exam_id, aq.question.question_id);
        // console.log(`Grading ${aq.question.question_id}`);
        assert(grader.isGrader(aq.question.kind), `Grader ${grader} cannot be used for question ${aq.displayIndex}, which has type "${aq.question.kind}".`);
        aq.grade(grader);
      }
      else {
        // console.log(`No grader found for ${aq.question.question_id}`);
      }
    });
    
    // Only assign a total points earned if all questions have been graded
    if (areAllGradedQuestions(this.assignedQuestions)) {
      this._isFullyGraded = true;
      asMutable(this).pointsEarned = sum(this.assignedQuestions.map(aq => aq.pointsEarned));
    }
  }

  private renderHeader(mode: RenderMode) {
    let badge = mode === RenderMode.ORIGINAL
      ? renderPointsWorthBadge(this.pointsPossible, "badge-light")
      : this.isGraded()
        ? renderScoreBadge(this.pointsEarned, this.pointsPossible)
        : renderUngradedBadge(this.pointsPossible);
    let heading = mode === RenderMode.ORIGINAL
      ? `${this.displayIndex}: ${this.section.title} ${badge}`
      : `${badge} ${this.displayIndex}: ${this.section.title}`;

    return `
      <div class="examma-ray-section-heading">
        <div class="badge badge-primary">${heading}</div>
      </div>`;
  }

  public render(mode: RenderMode) {
    return `
      <div id="section-${this.uuid}" class="examma-ray-section" data-section-uuid="${this.uuid}" data-section-display-index="${this.displayIndex}">
        <hr />
        <table class="examma-ray-section-contents">
          <tr>
            <td class="examma-ray-questions-container">
              ${this.renderHeader(mode)}
              <div class="examma-ray-section-description">${this.html_description}</div>
              ${this.assignedQuestions.map(aq => aq.render(mode)).join("<br />")}
            </td>
            <td style="width: ${this.section.reference_width}%;">
              <div class="examma-ray-section-reference-container">
                <div class="examma-ray-section-reference">
                  <h6>Reference Material (Section ${this.displayIndex})</h6>
                  ${this.html_reference ?? NO_REFERNECE_MATERIAL}
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }
  
  public isGraded() : this is GradedSection {
    return this._isFullyGraded;
  }
}

export interface GradedSection extends AssignedSection {
  readonly pointsEarned: number;
}

export function areAllGradedSections(sections: AssignedSection[]) : sections is GradedSection[];
export function areAllGradedSections(sections: readonly AssignedSection[]) : sections is readonly GradedSection[];
export function areAllGradedSections(sections: readonly AssignedSection[]) : sections is readonly GradedSection[] {
  return sections.every(s => s.isGraded());
}

export class AssignedExam {

  public readonly uuid: string;
  public readonly exam: Exam;
  public readonly student: StudentInfo;

  public readonly pointsPossible: number;
  public readonly pointsEarned?: number;
  private _isFullyGraded: boolean = false;

  public readonly curve?: AppliedCurve;

  private assignedQuestionById: {
    [index: string]: AssignedQuestion | undefined;
  } = {};

  public readonly assignedSections: readonly AssignedSection[];
  public readonly assignedQuestions: readonly AssignedQuestion[];

  public constructor(
    uuid: string,
    exam: Exam,
    student: StudentInfo,
    assignedSections: readonly AssignedSection[],
    allowDuplicates: boolean
  ) {
    this.uuid = uuid;
    this.exam = exam;
    this.student = student;
    this.assignedSections = assignedSections;
    this.assignedQuestions = assignedSections.flatMap(s => s.assignedQuestions);
    this.assignedQuestions.forEach(q => this.assignedQuestionById[q.question.question_id] = q);
    
    this.pointsPossible = assignedSections.reduce((p, s) => p + s.pointsPossible, 0);

    if (!allowDuplicates) {
      let sectionIds = assignedSections.map(s => s.section.section_id);
      assert(new Set(sectionIds).size === sectionIds.length, `This exam contains a duplicate section. Section IDs are:\n  ${sectionIds.sort().join("\n  ")}`);
      let questionIds = assignedSections.flatMap(s => s.assignedQuestions.map(q => q.question.question_id));
      assert(new Set(questionIds).size === questionIds.length, `This exam contains a duplicate question. Question IDs are:\n  ${questionIds.sort().join("\n  ")}`);
    }
  }

  public getAssignedQuestionById(question_id: string) {
    return this.assignedQuestionById[question_id];
  }

  public gradeAll(graders: GraderMap) {
    // console.log(`Grading exam for: ${this.student.uniqname}...`);
    this.assignedSections.forEach(s => s.gradeAllQuestions(this, graders));
    asMutable(this).pointsEarned = <number>this.assignedSections.reduce((prev, s) => prev + s.pointsEarned!, 0);
    this._isFullyGraded = areAllGradedSections(this.assignedSections);
  }
  
  public isGraded() : this is GradedExam {
    return this._isFullyGraded;
  }

  public applyCurve(this: GradedExam, curve: ExamCurve) {
    (<Mutable<GradedExam>>this).curve = curve.applyTo(this);
  }

  public renderGrade() {
    return this.isGraded() ?
      maxPrecisionString(this.curve?.adjustedScore ?? this.pointsEarned, 2) + "/" + this.pointsPossible :
      "?/" + this.pointsPossible;
  }

  public renderNav(mode: RenderMode) {
    return `
      <ul class = "nav" style="display: unset; font-weight: 500">
        ${this.assignedSections.map(s => {
          let scoreBadge = 
            mode === RenderMode.ORIGINAL ? renderPointsWorthBadge(s.pointsPossible, "btn-secondary", true) :
            s.isGraded() ? renderScoreBadge(s.pointsEarned, s.pointsPossible) :
            renderUngradedBadge(s.pointsPossible);
          return `<li class = "nav-item"><a class="nav-link text-truncate" style="padding: 0.1rem" href="#section-${s.uuid}">${scoreBadge} ${s.displayIndex + ": " + s.section.title}</a></li>`
        }).join("")}
      </ul>`
  }

  public renderSaverButton() {
    return `
      <div class="examma-ray-exam-saver-status">
        <div>
          ${this.exam.html_questions_message}
        </div>
        <br />
        <div><button class="examma-ray-exam-answers-file-button btn btn-primary" data-toggle="modal" data-target="#exam-saver" aria-expanded="false" aria-controls="exam-saver">Answers File</button></div>
        <div id="examma-ray-exam-saver-status-note" style="margin: 5px; visibility: hidden;"></div>
      </div>`
  }

  public renderTimer(mode: RenderMode) {
    if (mode === RenderMode.ORIGINAL) {
      return `
        <div class="text-center pb-1 border-bottom">
          <button id="examma-ray-time-elapsed-button" class="btn btn-primary btn-sm" style="line-height: 0.75;" data-toggle="collapse" data-target="#examma-ray-time-elapsed" aria-expanded="true" aria-controls="examma-ray-time-elapsed">Hide</button>
          <b>Time Elapsed</b>
          <br>
          <b><span class="collapse show" id="examma-ray-time-elapsed">?</span></b>
          <br>
          This is not an official timer. Please submit your answers to Canvas before the deadline.
        </div>
      `;
    }
    else {
      return "";
    }
  }

  public renderGradingSummary() {
    // TODO: remove ! assertions and use logic to produce partial summaries instead
    return `<div class="container examma-ray-grading-summary">
      <div class="text-center mb-3 border-bottom">
        <h2>Grading Information</h2>
      </div>
      ${this.curve ? `
        <div>
          ${this.curve.report_html}
        </div>
      ` : ""}
    </div>`;
  }

  public renderBody(mode: RenderMode) {
    return `<div id="examma-ray-exam" class="container-fluid" data-uniqname="${this.student.uniqname}" data-name="${this.student.name}" data-exam-id="${this.exam.exam_id}" data-exam-uuid="${this.uuid}">
      <div class="row">
        <div class="bg-light" style="position: fixed; width: 200px; top: 0; left: 0; bottom: 0; padding-left: 5px; z-index: 10; overflow-y: auto; border-right: solid 1px #dedede; font-size: 85%">
          ${this.renderTimer(mode)}
          <h3 class="text-center pb-1 border-bottom">
            ${mode === RenderMode.ORIGINAL ? renderPointsWorthBadge(this.pointsPossible, "btn-secondary") : this.renderGrade()}
          </h3>
          ${this.renderNav(mode)}
          ${mode === RenderMode.ORIGINAL ? this.renderSaverButton() : ""}
        </div>
        <div style="margin-left: 210px; width: calc(100% - 220px);">
          ${mode === RenderMode.GRADED ? this.renderGradingSummary() : ""}
          ${this.exam.renderHeader(this.student)}
          ${this.assignedSections.map(section => section.render(mode)).join("<br />")}
          <div class="container examma-ray-bottom-message">
            <div class="alert alert-success" style="margin: 2em; margin-top: 4em;">
              ${mk2html(MK_DEFAULT_BOTTOM_MESSAGE_CANVAS)}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  public renderAll(mode: RenderMode, frontendPath: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/@popperjs/core@2" crossorigin="anonymous"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
        <script src="${frontendPath}"></script>
      </head>
      <body>
        ${this.renderBody(mode)}
        ${renderModals(this)}
      </body>
      </html>
    `;
  }

  public createManifest() : ExamManifest {
    return {
      exam_id: this.exam.exam_id,
      uuid: this.uuid,
      student: this.student,
      timestamp: Date.now(),
      trusted: true,
      saverId: 0,
      sections: this.assignedSections.map(s => ({
        section_id: s.section.section_id,
        skin_id: s.skin.id,
        uuid: s.uuid,
        display_index: s.displayIndex,
        questions: s.assignedQuestions.map(q => ({
          question_id: q.question.question_id,
          skin_id: q.skin.non_composite_id ?? q.skin.id,
          uuid: q.uuid,
          display_index: q.displayIndex,
          kind: q.question.kind,
          response: ""
        }))
      }))
    };
  }
}

export function areAllGradedExams(exams: AssignedExam[]) : exams is GradedExam[];
export function areAllGradedExams(exams: readonly AssignedExam[]) : exams is readonly GradedExam[];
export function areAllGradedExams(exams: readonly AssignedExam[]) : exams is readonly GradedExam[] {
  return exams.every(ex => ex.isGraded());
}

export interface GradedExam extends AssignedExam {
  readonly pointsEarned: number;
}

export const MK_DEFAULT_SAVER_MESSAGE_CANVAS = `
  Click the button below to save a copy of your answers as a \`.json\`
  file. You may save as many times as you like. You can also restore answers
  from a previously saved file.
  
  **Important!** You MUST submit your \`.json\` answers file to **Canvas**
  BEFORE exam time is up. This webpage does not save your answers anywhere other than your local computer.
  It is up to you to download your answer file and turn it in on **Canvas**.
  
  **Note:** If you download multiple times, make sure to submit the most recent one. (The name of the file you submit to Canvas does not matter.)`;

export const MK_DEFAULT_BOTTOM_MESSAGE_CANVAS = `
  You've reached the bottom of the exam! If you're done, make sure to
  click the **"Answers File"** button, download a **\`.json\`
  answers file**, and submit to **Canvas** before the end of the exam!`;


export const MK_DEFAULT_REGRADE_MESSAGE = 
`Please note that you should only submit a regrade request
if you belive a grading **mistake** was made. Do not submit
regrade requests based on a disagreement with the rubric or
point values/weighting for rubric items.`;


export class Exam {

  public readonly exam_id: string;
  public readonly title: string;

  public readonly html_instructions: string;
  public readonly html_announcements: readonly string[];
  public readonly html_questions_message: string;

  public readonly sections: readonly (SectionSpecification | Section | SectionChooser)[];

  public readonly enable_regrades: boolean;

  public constructor(spec: ExamSpecification) {
    this.exam_id = spec.id;
    this.title = spec.title;
    this.html_instructions = mk2html(spec.mk_intructions);
    this.html_announcements = spec.mk_announcements?.map(a => mk2html(a)) ?? [];
    this.html_questions_message = spec.html_questions_message ?? "";
    this.sections = spec.sections;
    this.enable_regrades = !!spec.enable_regrades;
  }

  public addAnnouncement(announcement_mk: string) {
    asMutable(this.html_announcements).push(mk2html(announcement_mk));
  }

  public renderHeader(student: StudentInfo) {
    return `
      <div class="examma-ray-header">
        <div class="text-center mb-3 border-bottom">
          <h2>${this.title}</h2>
          <h6>${student.name} (${student.uniqname})</h6>
        </div>
        <div>
          ${this.renderInstructions()}
          ${this.renderAnnouncements()}
        </div>
      </div>
    `;
  }

  public renderInstructions() {
    return `<div class="container examma-ray-instructions">
      ${this.html_instructions}
    </div>`
  }

  public renderAnnouncements() {
    return `<div class="examma-ray-announcements">
      ${this.html_announcements.map(a => `
        <div class="alert alert-warning alert-dismissible fade show" style="display: inline-block; max-width: 40rem;" role="alert">
          ${a}
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>`
      )}
    </div>`;
  }



}

function renderModals(ex: AssignedExam) {
  return `
    <div id="exam-saver" class="exam-saver-modal modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Answers File</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" style="text-align: center;">
            <div class="alert alert-info">${mk2html(MK_DEFAULT_SAVER_MESSAGE_CANVAS)}</div>
            <div id="exam-saver-download-status" style="margin-bottom: 5px;"></div>
            <div><a id="exam-saver-download-link" class="btn btn-primary">${FILE_DOWNLOAD} Download Answers</a></div>
            <br />
            <div style="margin-bottom: 5px;">Or, you may restore answers you previously saved to a file.<br /><b>WARNING!</b> This will overwrite ALL answers on this page.</div>
            <div>
              <button id="exam-saver-load-button" class="btn btn-danger disabled" disabled>${FILE_UPLOAD} Load Answers</button>
              <input id="exam-saver-file-input" type="file"></a>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div id="exam-welcome-restored-modal" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${ex.exam.title}</h5>
          </div>
          <div class="modal-body" style="text-align: center;">
            <div class="alert alert-info">This page was reloaded, and we've restored your answers from a local backup.</div>
            <div>
              <button class="btn btn-success" data-dismiss="modal">${FILE_CHECK} OK</button>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div id="exam-welcome-normal-modal" class="modal" data-keyboard="false" data-backdrop="static" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${ex.exam.title}</h5>
          </div>
          <div class="modal-body">
            <div class="alert alert-info">This exam is for <b>${ex.student.uniqname}</b>. If this is not you, please close this page.</div>
            <div class="alert alert-info">This page shows your exam questions and gives you a place to work. <b>However, we will not grade anything here</b>. You must <b>download</b> an "answers file" and submit that to <b>Canvas</b> BEFORE the exam ends</b>.</div>
            <div class="alert alert-warning">If something goes wrong (e.g. in case your computer crashes, you accidentally close the page, etc.), this page will attempt to restore your work when you come back. <b>Warning!</b> If you take the exam in private/incognito mode, or if you have certain privacy extensions/add-ons enabled, this won't work.</div>

            <p style="margin-left: 2em; margin-right: 2em;">
              By taking this exam and submitting an answers file, you attest to the CoE Honor Pledge:
            </p>
            <p style="margin-left: 4em; margin-right: 4em;">
              <span style="font-style: italic">I have neither given nor received unauthorized aid on this examination, nor have I concealed any violations of the Honor Code."
            </p>
            
            <div style="text-align: center;">
              <button class="btn btn-primary" data-dismiss="modal">I am <b>${ex.student.uniqname}</b> and I understand</button>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div id="exam-welcome-no-autosave-modal" class="modal" data-keyboard="false" data-backdrop="static" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${ex.exam.title}</h5>
          </div>
          <div class="modal-body" style="text-align: center;">
            <div class="alert alert-info">This exam is for <b>${ex.student.uniqname}</b>. If this is not you, please close this page.</div>
            <div class="alert alert-info">This page shows your exam questions and gives you a place to work. <b>However, we will not grade anything here</b>. You must <b>download</b> an "answers file" and submit that to <b>Canvas</b> BEFORE the exam ends</b>.</div>
            <div class="alert alert-danger">It appears your browser will not support backing up your answers to local storage (e.g. in case your computer crashes, you accidentally close the page, etc.).<br /><br />While you may still take the exam like this, we do not recommend it. Make sure you are <b>not</b> using private/incognito mode, temporarily disable privacy add-ons/extensions, or try a different web browser to get autosave to work.</div>
            <div>
              <button class="btn btn-primary" data-dismiss="modal">I am <b>${ex.student.uniqname}</b> and I understand</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div id="multiple-tabs-modal" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">WARNING</h5>
          </div>
          <div class="modal-body" style="text-align: center;">
            <div class="alert alert-danger">It appears you have your exam open in multiple tabs/windows. That's a bad idea. Close whichever one you just opened.</div>
            <div>
              <button class="btn btn-primary" data-dismiss="modal">OK</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// <script>
//       $(function() {
//         $('button.examma-ray-blank-saver').on("click", function() {
//           let blank_num = $(this).data("blank-num");
//           let checked = $("input[type=checkbox]:checked").filter(function() {
//             return $(this).data("blank-num") === blank_num;
//           }).map(function() {
//             return '"'+$(this).data("blank-submission").replace('"','\\\\"')+'"';
//           }).get().join(",\\n");
//           $(".checked-submissions-content").html(he.encode(checked));
//           $(".checked-submissions-modal").modal("show")
//         })
//       });

//     </script>

// export function run_autograder(exam: Exam) {
//   let argv = minimist(process.argv.slice(2), {
//     alias : {
//         "a": "all_questions",
//         "n": "no_reports"
//     },
//     default : {
//       "no_reports": false
//     }
//     });
      
//     let isAllQuestions: string = argv["all_questions"];
//     let isRenderReports: boolean = !argv["no_reports"];
    
//     (async () => {
    
//         if (isAllQuestions) {
//             console.log("Creating one exam with all questions with answers drawn from random students...");
//             await exam.loadRandomizedStudent("matlab_exam_w21_answerkey.csv");
//         }
//         else {
//             console.log("Loading submissions for all students...");
//             await exam.loadSubmissions("matlab_exam_w21_morning.csv");
//             await exam.loadSubmissions("matlab_exam_w21_evening.csv");
//             await exam.loadSubmissions("matlab_exam_w21_makeup.csv");
//             await exam.loadSubmissions("matlab_exam_w21_nacosw.csv");
//         }
        
//         console.log("Grading exam...");
//         exam.gradeAllStudents();
    
//         console.log("Rendering question details...");
//         exam.questions.forEach(q => renderStatsToFile(exam, q.unifiedIndex));

//         console.log("Rendering overview...");
//         renderOverview(exam);

//         if (isRenderReports) {
//             console.log("Rendering student reports...");
//             exam.renderReports();
//         }
    
    
//         console.log("Writing scores csv...");
//         exam.writeScoresCsv();
//     })();
// }

// export function run_autograder(exam: Exam) {
//   let argv = minimist(process.argv.slice(2), {
//     alias : {
//         "a": "all_questions",
//         "n": "no_reports"
//     },
//     default : {
//       "no_reports": false
//     }
//     });
      
//     let isAllQuestions: string = argv["all_questions"];
//     let isRenderReports: boolean = !argv["no_reports"];
    
//     (async () => {
    
//         if (isAllQuestions) {
//             console.log("Creating one exam with all questions with answers drawn from random students...");
//             await exam.loadRandomizedStudent("matlab_exam_w21_answerkey.csv");
//         }
//         else {
//             console.log("Loading submissions for all students...");
//             await exam.loadSubmissions("matlab_exam_w21_morning.csv");
//             await exam.loadSubmissions("matlab_exam_w21_evening.csv");
//             await exam.loadSubmissions("matlab_exam_w21_makeup.csv");
//             await exam.loadSubmissions("matlab_exam_w21_nacosw.csv");
//         }
        
//         console.log("Grading exam...");
//         exam.gradeAllStudents();
    
//         console.log("Rendering question details...");
//         exam.questions.forEach(q => renderStatsToFile(exam, q.unifiedIndex));

//         console.log("Rendering overview...");
//         renderOverview(exam);

//         if (isRenderReports) {
//             console.log("Rendering student reports...");
//             exam.renderReports();
//         }
    
    
//         console.log("Writing scores csv...");
//         exam.writeScoresCsv();
//     })();
// }
