
import 'colors';
import { RandomSeed, create as createRNG } from 'random-seed';
import { FILE_CHECK, FILE_DOWNLOAD, FILE_UPLOAD } from './icons';
import { asMutable, assert, Mutable } from './util';
import { parse_submission, ResponseSpecification, render_response, SubmissionType } from './response/responses';
import { ResponseKind } from './response/common';
import { mk2html } from './render';
import { renderPointsWorthBadge, renderScoreBadge, renderUngradedBadge } from "./ui_components";
import { Exception, GraderMap } from './ExamGrader';
import { Grader, isGrader } from './graders/common';
import { QuestionSpecification, SkinGenerator, SectionSpecification, QuestionChooser, SectionChooser, ExamSpecification } from './specification';
import { QuestionSkin } from './skins';
import { writeFileSync } from 'fs';


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
  public readonly id: string;
  public readonly tags: readonly string[];
  public readonly mk_description: string;
  public readonly pointsPossible : number;
  public readonly kind: QT;
  public readonly response : ResponseSpecification<QT>;
  public readonly skins?: SkinGenerator;

  public constructor (spec: QuestionSpecification<QT>) {
    this.spec = spec;
    this.id = spec.id;
    this.tags = spec.tags ?? [];
    this.mk_description = spec.mk_description;
    this.pointsPossible = spec.points;
    this.kind = <QT>spec.response.kind;
    this.response = spec.response;
    this.skins = spec.skins;
  }

  public renderResponse(skin?: QuestionSkin) {
    return `<div class="examma-ray-question-response" data-response-kind="${this.kind}">${render_response(this.response, this.id, skin)}</div>`;
  }

  public renderDescription(skin?: QuestionSkin) {
    return mk2html(this.mk_description, skin);
  }

};

export class AssignedQuestion<QT extends ResponseKind = ResponseKind> {

  public readonly pointsEarned?: number;
  public readonly nonExceptionPoints?: number;
  public readonly gradedBy?: Grader<QT>
  public readonly exception?: Exception;

  public readonly submission: SubmissionType<QT>;

  public readonly displayIndex;

  private readonly html_description: string;

  public constructor(
    public readonly exam: Exam,
    public readonly student: StudentInfo,
    public readonly question: Question<QT>,
    public readonly skin: QuestionSkin | undefined,
    public readonly sectionIndex : number,
    public readonly partIndex : number,
    public readonly rawSubmission: string,
  ) {
    this.displayIndex = (sectionIndex+1) + "." + (partIndex+1);
    this.submission = parse_submission(question.kind, rawSubmission);

    this.html_description = question.renderDescription(this.skin);
  }

  public grade(grader: Grader<QT>) {
    console.log("here");
    this.setPointsEarned(grader.grade(
      this.question,
      this.submission
    ));
    (<Mutable<this>>this).gradedBy = grader;
  }

  private setPointsEarned(points: number) {
    (<Mutable<this>>this).pointsEarned = Math.min(this.question.pointsPossible, Math.max(points, 0));
  }

  public addException(exception: Exception) {
    (<Mutable<this>>this).exception = exception;
    (<Mutable<this>>this).nonExceptionPoints = this.pointsEarned;
    this.setPointsEarned(exception.adjustedScore);
  }

  public render(mode: RenderMode) {

    let question_header_html = `<b>${this.displayIndex}</b>`;
    if (mode === RenderMode.ORIGINAL) {
      question_header_html += ` ${renderPointsWorthBadge(this.question.pointsPossible)}`;
      return `
        <div id="question-${this.question.id}" data-question-id="${this.question.id}" data-question-display-index="${this.displayIndex}" class="examma-ray-question card-group">
          <div class="card">
            <div class="card-header">
              ${question_header_html}
            </div>
            <div class="card-body">
              <div class="examma-ray-question-description">
                ${this.html_description}
              </div>
              ${this.question.renderResponse(this.skin)}
            </div>
          </div>
        </div>
      `;
    }
    else {
      question_header_html += ` ${this.isGraded() ? renderScoreBadge(this.pointsEarned, this.question.pointsPossible): renderUngradedBadge(this.question.pointsPossible)}`;
    
      let graded_html: string;
      let exception_html = "";
      
      if (this.isGraded()) {
        graded_html = this.gradedBy.renderReport(this.question, this.submission, this.skin);
        exception_html = this.renderExceptionIfPresent();
      }
      else {
        graded_html = `
        <div class="alert alert-danger" role="alert">
          NOT GRADED
        </div>`; 
      }

      return renderQuestion(this.question.id, this.displayIndex, this.html_description, question_header_html, exception_html, graded_html);
    }
  }

  private renderExceptionIfPresent() {
    if (!this.exception) {
      return "";
    }

    return `<div class="alert alert-warning">
      <p><strong>An exception was applied when grading this question.</strong></p>
      <p>Your score on this question was adjusted from <strong>${this.nonExceptionPoints}</strong> to <strong>${this.pointsEarned}</strong>.</p>
      ${mk2html(this.exception.explanation)}
    </div>`;
  }

  public isGraded() : this is GradedQuestion<QT> {
    return !!this.gradedBy;
  }
  
}

interface GradedQuestion<QT extends ResponseKind> extends AssignedQuestion<QT> {
  readonly pointsEarned: number;
  readonly gradedBy: Grader<QT>
}




// TODO rework this function ew
export function renderQuestion(id: string, displayIndex: string, description: string, header: string, exception: string, gradingReport: string) {
  return `
  <div id="question-${id}" data-question-id="${id}" data-question-display-index="${displayIndex}" class="examma-ray-question card-group">
    <div class="card">
      <div class="card-header">
        ${header}
      </div>
      <div class="card-body">
        <div class="examma-ray-question-description">
          ${description}
        </div>
        <div class="examma-ray-question-exception">
          ${exception}
        </div>
        <div class="examma-ray-grading-report">
          ${gradingReport}
        </div>
      </div>
    </div>
  </div>`;
}




export class Section {

  // public readonly raw_description: string;
  // public readonly description: string;
  // public readonly section: Section;
  public readonly spec: SectionSpecification;
  public readonly id: string;
  public readonly title: string;
  public readonly mk_description: string;
  public readonly mk_reference?: string;
  public readonly questions: (QuestionSpecification | Question | QuestionChooser)[];
  public readonly skins?: SkinGenerator;

  public constructor (spec: SectionSpecification) {
    this.spec = spec;
    this.id = spec.id;
    this.title = spec.title;
    this.mk_description = spec.mk_description;
    this.mk_reference = spec.mk_reference;
    this.questions = Array.isArray(spec.content) ? spec.content : [spec.content];
    this.skins = spec.skins;

    // let json = JSON.parse(readFileSync(`sections/${sectionIndex}.json`, 'utf8'));
    // let question = (<any[]>json["questions"]).find(q => parseInt(q.index) === partIndex) ?? json["questions"][partIndex-1];
    // assert(question, `Missing question ${partIndex} in section ${sectionIndex}.json`);
    // this.data = question["data"];
    // // this.raw_description = question["questionDescription"] ?? "";


    // this.section = {
    //   index: this.sectionIndex,
    //   title: <string>json["title"],
    //   raw_description: <string>json["sectionDescription"],
    //   description: mk2html(<string>json["sectionDescription"]),
    //   raw_referenceMaterial: <string>json["referenceMaterial"],
    //   referenceMaterial: mk2html(<string>json["referenceMaterial"]),
    // }
  }

  public renderDescription(skin?: QuestionSkin) {
    return mk2html(this.mk_description, skin);
  }

  public renderReference(skin?: QuestionSkin) {
    return this.mk_reference && mk2html(this.mk_reference, skin);
  }

  public buildRandomizedSection(
    exam: Exam, student: StudentInfo, sectionIndex: number,
    rand: Randomizer = new Randomizer(student.uniqname + "_" + exam.id + "_" + this.id))
  {
    let sSkin = this.skins?.generate(exam, student, new Randomizer(student.uniqname + "_" + exam.id + "_" + this.id));
    return new AssignedSection(
      this,
      sectionIndex,
      sSkin,
      this.questions.flatMap(chooser => 
        typeof chooser === "function" ? chooser(exam, student, rand) :
        chooser instanceof Question ? [chooser] :
        new Question(chooser)
      ).map((q, partIndex) => {
        
        let qSkin = q.skins?.generate(exam, student, new Randomizer(student.uniqname + "_" + exam.id + "_" + q.id));
        qSkin ??= sSkin;
        return new AssignedQuestion(exam, student, q, qSkin, sectionIndex, partIndex, "")
      })
    );
  }
    

}


const NO_REFERNECE_MATERIAL = "This section has no reference material."

export class AssignedSection {

  public readonly displayIndex: string;

  public readonly pointsPossible: number;
  public readonly pointsEarned?: number;
  public readonly isFullyGraded: boolean = false;
  
  private readonly html_description: string;
  private readonly html_reference?: string;

  public constructor(
    public readonly section: Section, 
    public readonly sectionIndex : number,
    public readonly skin: QuestionSkin | undefined,
    public readonly assignedQuestions: readonly AssignedQuestion[])
  {
    this.displayIndex = "" + (sectionIndex+1);
    this.pointsPossible = assignedQuestions.reduce((p, q) => p + q.question.pointsPossible, 0);

    this.html_description = section.renderDescription(this.skin);
    this.html_reference = section.renderReference(this.skin);
  }

  public gradeAllQuestions(ex: AssignedExam, graders: GraderMap) {
    this.assignedQuestions.forEach(aq => {
      let grader = graders[aq.question.id];
      if (grader) {
        console.log(`Grading ${aq.question.id}`);
        assert(isGrader(grader, aq.question.kind), `Grader for type "${grader.questionType}" cannot be used for question ${aq.displayIndex}, which has type "${aq.question.kind}".`);
        aq.grade(grader);
      }
      else {
        console.log(`No grader found for ${aq.question.id}`);
      }
    });
    asMutable(this).pointsEarned = <number>this.assignedQuestions.reduce((prev, aq) => prev + aq.pointsEarned!, 0);
    asMutable(this).isFullyGraded =this.assignedQuestions.every(aq => aq.isGraded());
  }

  private renderHeader(mode: RenderMode) {
    let badge = mode === RenderMode.ORIGINAL
      ? renderPointsWorthBadge(this.pointsPossible, "badge-light")
      : this.isFullyGraded
        ? renderScoreBadge(this.pointsEarned!, this.pointsPossible)
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
      <div id="section-${this.section.id}" class="examma-ray-section" data-section-id="${this.section.id}" data-section-display-index="${this.displayIndex}">
        <hr />
        <table class="examma-ray-section-contents">
          <tr>
            <td>
              ${this.renderHeader(mode)}
              <div class="examma-ray-section-description">${this.html_description}</div>
              ${this.assignedQuestions.map(aq => aq.render(mode)).join("<br />")}
            </td>
            <td style="width: 35%;">
              <div class="examma-ray-section-reference">
                <h6>Reference Material (Section ${this.displayIndex})</h6>
                ${this.html_reference ?? NO_REFERNECE_MATERIAL}
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }
}

export class AssignedExam {

  public readonly pointsPossible: number;
  public readonly pointsEarned?: number;
  public readonly isFullyGraded: boolean = false;

  public constructor(
    public readonly exam: Exam,
    public readonly student: StudentInfo,
    public readonly assignedSections: readonly AssignedSection[]
  ) {
    this.pointsPossible = assignedSections.reduce((p, s) => p + s.pointsPossible, 0);

    let sectionIds = assignedSections.map(s => s.section.id);
    assert(new Set(sectionIds).size === sectionIds.length, `This exam contains a duplicate section. Section IDs are:\n  ${sectionIds.sort().join("\n  ")}`);
    let questionIds = assignedSections.flatMap(s => s.assignedQuestions.map(q => q.question.id));
    assert(new Set(sectionIds).size === sectionIds.length, `This exam contains a duplicate question. Question IDs are:\n  ${sectionIds.sort().join("\n  ")}`);
  }

  public gradeAll(graders: GraderMap) {
    console.log(`Grading exam for: ${this.student.uniqname}...`);
    this.assignedSections.forEach(s => s.gradeAllQuestions(this, graders));
    asMutable(this).pointsEarned = <number>this.assignedSections.reduce((prev, s) => prev + s.pointsEarned!, 0);
    asMutable(this).isFullyGraded = this.assignedSections.every(s => s.isFullyGraded);
  }

  public renderGrade() {
    return this.isFullyGraded ?
      +(this.pointsEarned!.toFixed(2)) + "/" + this.pointsPossible :
      "?/" + this.pointsPossible;
  }

  public renderNav(mode: RenderMode) {
    return `
      <ul class = "nav" style="display: unset; font-weight: 500">
        ${this.assignedSections.map(s => {
          let scoreBadge = 
            mode === RenderMode.ORIGINAL ? renderPointsWorthBadge(s.pointsPossible, "btn-secondary") :
            s.isFullyGraded ? renderScoreBadge(s.pointsEarned!, s.pointsPossible) :
            renderUngradedBadge(s.pointsPossible);
          return `<li class = "nav-item"><a class="nav-link text-truncate" style="padding: 0.1rem" href="#section-${s.section.id}">${scoreBadge} ${s.displayIndex + ": " + s.section.title}</a></li>`
        }).join("")}
      </ul>`
  }

  public renderSaverButton() {
    return `
      <div class="examma-ray-exam-saver-status">
        <div><button id="exam-saver-button" class="btn btn-primary" data-toggle="modal" data-target="#exam-saver" aria-expanded="false" aria-controls="exam-saver">Answers File</button></div>
        <div id="examma-ray-exam-saver-status-note" style="margin: 5px; visibility: hidden;"></div>
      </div>`
  }

  public renderBody(mode: RenderMode) {
    return `<div id="examma-ray-exam" class="container-fluid" data-uniqname="${this.student.uniqname}" data-name="${this.student.name}" data-exam-id="${this.exam.id}">
      <div class="row">
        <div class="bg-light" style="position: fixed; width: 200px; top: 0; left: 0; bottom: 0; padding-left: 5px; z-index: 10; overflow-y: auto; border-right: solid 1px #dedede; font-size: 85%">
          <h3 class="text-center pb-1 border-bottom">
            ${mode === RenderMode.ORIGINAL ? renderPointsWorthBadge(this.pointsPossible, "btn-secondary") : this.renderGrade()}
          </h3>
          ${this.renderNav(mode)}
          ${mode === RenderMode.ORIGINAL ? this.renderSaverButton() : ""}
        </div>
        <div style="margin-left: 210px; width: calc(100% - 220px);">
          ${this.exam.renderHeader(this.student)}
          ${this.assignedSections.map(section => section.render(mode)).join("<br />")}

        </div>
      </div>
    </div>`;
  }

  public renderAll(mode: RenderMode) {
    return `
      <!DOCTYPE html>
      <html>
      <meta charset="UTF-8">
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
      <script src="https://unpkg.com/@popperjs/core@2" crossorigin="anonymous"></script>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
      <script src="${mode === RenderMode.ORIGINAL ? this.exam.frontendJsPath : this.exam.frontendGradedJsPath}"></script>
      
      <body>
        ${this.renderBody(mode)}
        ${renderModals(this)}
      </body>
      </html>
    `;
  }

  public createManifest() {
    return {
      exam_id: this.exam.id,
      student: this.student,
      timestamp: Date.now(),
      trusted: false,
      saverId: 0,
      sections: this.assignedSections.map(s => ({
        id: s.section.id,
        display_index: s.displayIndex,
        questions: s.assignedQuestions.map(q => ({
          id: q.question.id,
          display_index: q.displayIndex,
          kind: q.question.kind,
          response: ""
        }))
      }))
    };
  }
}

export class Randomizer {

  private rng: RandomSeed;

  public constructor(seed: string) {
    this.rng = createRNG(seed);
  }

  public float() {
    return this.rng.random;
  }

  public range(n: number) {
    return this.rng.range(n);
  };

  public choose<T>(choices: readonly T[]) {
    assert(choices.length > 0, "No choices available.");
    return choices[this.rng.range(choices.length)];
  };
  
  public chooseN<T>(choices: readonly T[], n: number) {
    assert(choices.length >= n, "Number to randomly choose is larger than number of choices.");
    return choices
      .slice()
      .map(c => ({i: this.rng.random(), c: c}))
      .sort((a, b) => a.i - b.i)
      .map(x => x.c)
      .slice(0,n);
  }

}

export const DEFAULT_SAVER_MESSAGE_CANVAS = `
  Click the button below to save a copy of your answers as a \`.json\`
  file. You may save as many times as you like. You can also restore answers
  from a previously saved file.
  
  **Important!** You MUST submit your answers \`.json\` file to **Canvas**
  BEFORE exam time is up. This webpage does not save your answers anywhere other than your local computer.
  It is up to you to download your answer file and turn it in on **Canvas**.`;



export class Exam {

  public readonly id: string;
  public readonly title: string;

  public readonly html_instructions: string;
  public readonly html_announcements: readonly string[];

  public readonly frontendJsPath: string;
  public readonly frontendGradedJsPath: string;

  public readonly sections: readonly (SectionSpecification | Section | SectionChooser)[];

  public constructor(spec: ExamSpecification) {
    this.id = spec.id;
    this.title = spec.title;
    this.html_instructions = mk2html(spec.mk_intructions);
    this.html_announcements = spec.mk_announcements?.map(a => mk2html(a)) ?? [];
    this.frontendJsPath = spec.frontend_js_path;
    this.frontendGradedJsPath = spec.frontend_graded_js_path;
    this.sections = spec.sections;
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
    return `<div class="examma-ray-instructions">
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
            <div class="alert alert-info">${mk2html(DEFAULT_SAVER_MESSAGE_CANVAS)}</div>
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
          <div class="modal-body" style="text-align: center;">
          <div class="alert alert-info">This exam is for <b>${ex.student.uniqname}</b>. If this is not you, please close this page.</div>
          <div class="alert alert-info">This page shows your exam questions and gives you a place to work. <b>However, we will not grade anything here</b>. You must <b>download</b> an "answers file" and submit that to <b>Canvas</b> BEFORE the exam ends</b>.</div>
          <div class="alert alert-warning">If something goes wrong (e.g. in case your computer crashes, you accidentally close the page, etc.), this page will attempt to restore your work when you come back. <b>Warning!</b> If you take the exam in private/incognito mode, of if you have certain privacy extensions/add-ons enabled, this likely won't work.</div>
          <div>
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
