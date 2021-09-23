import { FILE_DOWNLOAD, FILE_UPLOAD, FILE_CHECK } from "./icons";
import { QuestionGrader } from "./QuestionGrader";
import { mk2html } from "./render";
import { ResponseKind, BLANK_SUBMISSION } from "./response/common";
import { ResponseSpecification, SubmissionType, render_response } from "./response/responses";
import { QuestionSkin } from "./skins";
import { DEFAULT_SKIN_GENERATOR, ExamSpecification, isValidID, QuestionChooser, QuestionSpecification, SectionChooser, SectionSpecification, SkinGenerator, StudentInfo } from "./specification";
import { asMutable, assert } from "./util";

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

  private static instances = new WeakMap<QuestionSpecification, Question>();

  public static create<QT extends ResponseKind>(spec: QuestionSpecification<QT>) : Question<QT> {
    if (this.instances.has(spec)) {
      return <Question<QT>>this.instances.get(spec)!;
    }
    else {
      let newInstance = new Question(spec);
      this.instances.set(spec, newInstance);
      return newInstance;
    }
  }

  private constructor (spec: QuestionSpecification<QT>) {
    this.spec = spec;
    assert(isValidID(spec.id), `Invalid question ID: ${spec.id}`);
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
    return `<div class="examma-ray-question-response examma-ray-question-response-${this.kind}" data-response-kind="${this.kind}">${render_response(this.response, this.question_id, uuid, skin)}</div>`;
  }

  public renderDescription(skin: QuestionSkin) {
    return this.descriptionCache[skin.id] ??= mk2html(this.mk_description, skin);
  }

  public isKind<RK extends QT>(kind: RK) : this is Question<RK> {
    return this.kind === kind;
  }
};





const DEFAULT_REFERENCE_WIDTH = 40;

function realizeQuestion(s: QuestionSpecification | Question | QuestionChooser) {
  return (typeof s === "function" || s instanceof Question) ? s : Question.create(s);
}

export class Section {

  public readonly spec: SectionSpecification;
  public readonly section_id: string;
  public readonly title: string;
  public readonly mk_description: string;
  public readonly mk_reference?: string;
  public readonly questions: readonly (Question | QuestionChooser)[];
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

  private static instances = new WeakMap<SectionSpecification, Section>();

  public static create(spec: SectionSpecification) {
    if (this.instances.has(spec)) {
      return this.instances.get(spec)!;
    }
    else {
      let newInstance = new Section(spec);
      this.instances.set(spec, newInstance);
      return newInstance;
    }
  }

  private constructor (spec: SectionSpecification) {
    this.spec = spec;
    assert(isValidID(spec.id), `Invalid section ID: ${spec.id}`);
    this.section_id = spec.id;
    this.title = spec.title;
    this.mk_description = spec.mk_description;
    this.mk_reference = spec.mk_reference;
    this.questions = spec.questions.map(q => realizeQuestion(q));
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







export const MK_DEFAULT_SAVER_MESSAGE_CANVAS = 
`Click the button below to save a copy of your answers as a \`.json\`
file. You may save as many times as you like. You can also restore answers
from a previously saved file.

**Important!** You MUST submit your \`.json\` answers file to **Canvas**
BEFORE exam time is up. This webpage does not save your answers anywhere other than your local computer.
It is up to you to download your answer file and turn it in on **Canvas**.

**Note:** If you download multiple times, make sure to submit the most recent one. (The name of the file you submit to Canvas does not matter.)`;

export const MK_DEFAULT_QUESTIONS_MESSAGE = "";

export const MK_DEFAULT_DOWNLOAD_MESSAGE = "Download an answers file to submit separately.";

export const MK_DEFAULT_BOTTOM_MESSAGE_CANVAS = 
`You've reached the bottom of the exam! If you're done, make sure to
click the **"Answers File"** button, download a **\`.json\`
answers file**, and submit to **Canvas** before the end of the exam!`;

export const MK_DEFAULT_BOTTOM_MESSAGE = 
`You've reached the bottom of the exam! If you're done, make sure to
click the **"Answers File"** button, download a **\`.json\`
answers file**, and submit it before the end of the exam!`;


export const MK_DEFAULT_REGRADE_MESSAGE = 
`Please note that you should only submit a regrade request
if you belive a grading **mistake** was made. Do not submit
regrade requests based on a disagreement with the rubric or
point values/weighting for rubric items.`;



function realizeSection(s: SectionSpecification | Section | SectionChooser) {
  return (typeof s === "function" || s instanceof Section) ? s : Section.create(s);
}

export class Exam {

  public readonly exam_id: string;
  public readonly title: string;

  public readonly html_instructions: string;
  public readonly html_announcements: readonly string[];
  public readonly mk_questions_message: string;
  public readonly mk_download_message: string;
  public readonly mk_bottom_message: string;

  public readonly sections: readonly (Section | SectionChooser)[];

  public readonly enable_regrades: boolean;

  private static instances = new WeakMap<ExamSpecification, Exam>();

  public static create(spec: ExamSpecification) {
    if (this.instances.has(spec)) {
      return this.instances.get(spec)!;
    }
    else {
      let newInstance = new Exam(spec);
      this.instances.set(spec, newInstance);
      return newInstance;
    }
  }

  private constructor(spec: ExamSpecification) {
    assert(isValidID(spec.id), `Invalid exam ID: ${spec.id}`);
    this.exam_id = spec.id;
    this.title = spec.title;
    this.html_instructions = mk2html(spec.mk_intructions);
    this.html_announcements = spec.mk_announcements?.map(a => mk2html(a)) ?? [];
    this.mk_questions_message = spec.mk_questions_message ?? MK_DEFAULT_QUESTIONS_MESSAGE;
    this.mk_download_message = spec.mk_download_message ?? MK_DEFAULT_DOWNLOAD_MESSAGE;
    this.mk_bottom_message = spec.mk_bottom_message ?? MK_DEFAULT_BOTTOM_MESSAGE;
    this.sections = spec.sections.map(s => realizeSection(s));
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

  public renderModals(student: StudentInfo) {
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
              <h5 class="modal-title">${this.title}</h5>
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
              <h5 class="modal-title">${this.title}</h5>
            </div>
            <div class="modal-body">
              <div class="alert alert-info">This exam is for <b>${student.uniqname}</b>. If this is not you, please close this page.</div>
              <div class="alert alert-info">This page shows your exam questions and gives you a place to work. <b>However, we will not grade anything here</b>. You must <b>download</b> an "answers file" and submit that to <b>Canvas</b> BEFORE the exam ends</b>.</div>
              <div class="alert alert-warning">If something goes wrong (e.g. in case your computer crashes, you accidentally close the page, etc.), this page will attempt to restore your work when you come back. <b>Warning!</b> If you take the exam in private/incognito mode, or if you have certain privacy extensions/add-ons enabled, this won't work.</div>
  
              <p style="margin-left: 2em; margin-right: 2em;">
                By taking this exam and submitting an answers file, you attest to the CoE Honor Pledge:
              </p>
              <p style="margin-left: 4em; margin-right: 4em;">
                <span style="font-style: italic">I have neither given nor received unauthorized aid on this examination, nor have I concealed any violations of the Honor Code."
              </p>
              
              <div style="text-align: center;">
                <button class="btn btn-primary" data-dismiss="modal">I am <b>${student.uniqname}</b> and I understand</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
  
      <div id="exam-welcome-no-autosave-modal" class="modal" data-keyboard="false" data-backdrop="static" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${this.title}</h5>
            </div>
            <div class="modal-body" style="text-align: center;">
              <div class="alert alert-info">This exam is for <b>${student.uniqname}</b>. If this is not you, please close this page.</div>
              <div class="alert alert-info">This page shows your exam questions and gives you a place to work. <b>However, we will not grade anything here</b>. You must <b>download</b> an "answers file" and submit that to <b>Canvas</b> BEFORE the exam ends</b>.</div>
              <div class="alert alert-danger">It appears your browser will not support backing up your answers to local storage (e.g. in case your computer crashes, you accidentally close the page, etc.).<br /><br />While you may still take the exam like this, we do not recommend it. Make sure you are <b>not</b> using private/incognito mode, temporarily disable privacy add-ons/extensions, or try a different web browser to get autosave to work.</div>
              <div>
                <button class="btn btn-primary" data-dismiss="modal">I am <b>${student.uniqname}</b> and I understand</button>
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

}








