import { asMutable, assert, Mutable } from './util';
import { parse_submission, SubmissionType } from './response/responses';
import { ResponseKind } from './response/common';
import { mk2html, mk2html_unwrapped } from './render';
import { maxPrecisionString, renderPointsWorthBadge, renderScoreBadge, renderUngradedBadge } from "./ui_components";
import { Exception, GraderMap } from '../ExamGrader';
import { QuestionGrader, GradingResult } from './QuestionGrader';
import { isValidID, StudentInfo } from './specification';
import { ExamComponentSkin } from './skins';
import { ExamManifest } from './submissions';
import { sum } from 'simple-statistics';
import { AppliedCurve, ExamCurve } from './ExamCurve';
import { Exam, Question, Section } from './exam_components';


export enum RenderMode {
  ORIGINAL = "ORIGINAL",
  GRADED = "GRADED",
}



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
    public readonly skin: ExamComponentSkin,
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
    public readonly skin: ExamComponentSkin,
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
            <td class="examma-ray-section-reference-column" style="width: ${this.section.reference_width}%;">
              <div class="examma-ray-section-reference-container">
                <div class="examma-ray-section-reference">
                  <div class = "examma-ray-section-reference-width-slider-container">
                    <div class = "examma-ray-section-reference-width-value">${this.section.reference_width}%</div>
                    <input class="examma-ray-section-reference-width-slider" type="range" min="10" max="100" step="10" value="${this.section.reference_width}">
                  </div>
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
    assert(isValidID(student.uniqname), `Invalid student uniqname: ${student.uniqname}`);
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
          ${mk2html_unwrapped(this.exam.mk_questions_message)}
        </div>
        <br />
        <div><button class="examma-ray-exam-answers-file-button btn btn-primary" data-toggle="modal" data-target="#exam-saver" aria-expanded="false" aria-controls="exam-saver">Answers File</button></div>
        <div class="examma-ray-exam-saver-status-note">${mk2html_unwrapped(this.exam.mk_download_message)}</div>
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
          This is not an official timer. Please submit your answers file before the deadline.
        </div>
      `;
    }
    else {
      return "";
    }
  }

  public renderGradingSummary() {
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
              ${mk2html_unwrapped(this.exam.mk_bottom_message)}
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
        ${this.exam.renderModals(this.student)}
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
