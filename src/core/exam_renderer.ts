import path from 'path';
import { AssignedSection, Exam } from '../core';
import { AssignedExam, AssignedQuestion } from './assigned_exams';
import { StudentInfo } from './exam_specification';
import { FILE_CHECK, FILE_DOWNLOAD, FILE_UPLOAD, ICON_USER } from './icons';
import { mk2html, mk2html_unwrapped } from './render';
import { maxPrecisionString, renderPointsWorthBadge, renderScoreBadge, renderUngradedBadge } from "./ui_components";

export function renderHead(extra: string) {
  return (
`<head>
  <meta charset="UTF-8">
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://unpkg.com/@popperjs/core@2" crossorigin="anonymous"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
  ${extra}
</head>`
  );
  
}

export function renderInstructions(exam: Exam) {
  return `<div class="container examma-ray-instructions">
    ${exam.html_instructions}
  </div>`
}

export function renderAnnouncements(exam: Exam) {
  return `<div class="examma-ray-announcements">
    ${exam.html_announcements.map(a => `
      <div class="alert alert-warning alert-dismissible fade show" style="display: inline-block; max-width: 40rem;" role="alert">
        ${a}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>`
    )}
  </div>`;
}

export abstract class ExamRenderer {

  public renderTimer() {
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

  public renderNav(ae: AssignedExam) {
    return `
      <ul class="nav er-exam-nav show-small-scrollbar" style="display: unset; flex-grow: 1; font-weight: 500; overflow-y: scroll">
        ${ae.assignedSections.map(s => `<li class = "nav-item">
          <a class="nav-link text-truncate" style="padding: 0.1rem" href="#section-${s.uuid}">${this.renderNavBadge(s)} ${s.displayIndex + ": " + mk2html_unwrapped(s.section.title, s.skin)}</a>
        </li>`).join("")}
      </ul>`
  }

  public abstract renderNavBadge(s: AssignedSection): string;

  protected renderSignInButton() {
    return `
      <button id="examma-ray-exam-sign-in-button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#exam-sign-in-modal" aria-expanded="false" aria-controls="exam-sign-in-modal">
      ${ICON_USER}
      <span style="vertical-align: middle">Sign In</span>
      </button>
    `;
  }

  public renderSaverButton(ae: AssignedExam) {
    return `
      <div class="examma-ray-exam-saver-status border-top">
        <div>
          ${mk2html_unwrapped(ae.exam.mk_questions_message)}
        </div>
        <br />
        <div><button class="examma-ray-exam-answers-file-button btn btn-primary" data-toggle="modal" data-target="#exam-saver" aria-expanded="false" aria-controls="exam-saver">Answers File</button></div>
        <div class="examma-ray-exam-saver-status-note">${mk2html_unwrapped(ae.exam.mk_download_message)}</div>
      </div>`
  }

  public renderGradingSummary(ae: AssignedExam) {
    return `<div class="container examma-ray-grading-summary">
      <div class="text-center mb-3 border-bottom">
        <h2>Grading Information</h2>
      </div>
      ${ae.curve ? `
        <div>
          ${ae.curve.report_html}
        </div>
      ` : ""}
    </div>`;
  }

  public abstract renderScripts(frontendPath: string): string;

  public abstract renderBody(ae: AssignedExam): string;

  public renderSections(ae: AssignedExam) {
    return ae.assignedSections.map(as => this.renderSection(as)).join("<br />")
  }

  public renderAll(ae: AssignedExam, frontendPath: string) {
    return `
      <!DOCTYPE html>
      <html>
      ${renderHead(this.renderScripts(frontendPath))}
      <body>
        ${this.renderBody(ae)}
        ${this.renderModals(ae)}
      </body>
      </html>
    `;
  }





  public renderHeader(ae: AssignedExam, student: StudentInfo) {
    return `
      <div class="examma-ray-header">
        <div class="text-center mb-3 border-bottom">
          <h2>${ae.exam.title}</h2>
          ${this.renderStudentHeader(student)}
        </div>
        <div>
          ${renderInstructions(ae.exam)}
          ${renderAnnouncements(ae.exam)}
        </div>
      </div>
    `;
  }

  protected abstract renderStudentHeader(student: StudentInfo): string;
  
  protected abstract renderSectionHeader(as: AssignedSection): string;

  public renderSection(as: AssignedSection) {
    return `
      <div id="section-${as.uuid}" class="examma-ray-section ${as.html_reference ? "" : "examma-ray-section-no-reference"}" data-section-uuid="${as.uuid}" data-section-display-index="${as.displayIndex}">
        <hr />
        <table class="examma-ray-section-contents">
          <tr>
            <td class="examma-ray-questions-container">
              ${this.renderSectionHeader(as)}
              <div class="examma-ray-section-description">${as.html_description}</div>
              ${as.assignedQuestions.map(aq => this.renderQuestion(aq)).join("<br />")}
            </td>
            ${!as.html_reference ? "" :
            `<td class="examma-ray-section-reference-column" style="width: ${as.section.reference_width}%;">
              <div class="examma-ray-section-reference-container">
                <div class="examma-ray-section-reference">
                  <div class = "examma-ray-section-reference-width-slider-container">
                    <div class = "examma-ray-section-reference-width-value">${as.section.reference_width}%</div>
                    <input class="examma-ray-section-reference-width-slider" type="range" min="10" max="100" step="10" value="${as.section.reference_width}">
                  </div>
                  <h6>Reference Material (Section ${as.displayIndex})</h6>
                  ${as.html_reference}
                </div>
              </div>
            </td>
            `}
          </tr>
        </table>
      </div>
    `;
  }
  
  protected abstract renderQuestionHeader(aq: AssignedQuestion): string;
  protected abstract renderQuestionContent(aq: AssignedQuestion): string;

  public renderQuestion(aq: AssignedQuestion) {
    return `
      <div id="question-${aq.uuid}" data-question-uuid="${aq.uuid}" data-question-display-index="${aq.displayIndex}" class="examma-ray-question card-group">
        <div id="question-anchor-${aq.uuid}" class="examma-ray-question-anchor"></div>
        <div class="card">
          <div class="card-header">
            ${this.renderQuestionHeader(aq)}
          </div>
          <div class="card-body">
            <div class="examma-ray-question-description">
              ${aq.html_description}
            </div>
            ${this.renderQuestionContent(aq)}
            <div class="examma-ray-question-postscript">
              ${aq.html_postscript}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  protected renderModals(ae: AssignedExam) {
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
            <div class="modal-body">
              <div class="alert alert-info">${mk2html(ae.exam.mk_saver_message)}</div>
              <div style="text-align: center;">
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
      </div>
  
  
      <div id="exam-welcome-restored-modal" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${ae.exam.title}</h5>
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
  
  
      <div id="exam-welcome-restored-error-modal" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${ae.exam.title}</h5>
            </div>
            <div class="modal-body" style="text-align: center;">
              <div class="alert alert-danger">
                An error was encountered while attempting to restore your answers from a local backup.
                If you are in the process of creating and previewing an exam, this may have occurred due
                to a change to a question's type. If so, clear your browser's local storage before continuing.
                <br />
                If you're taking an exam, this should never happen. But, if it does, contact your instructor,
                course staff, or proctor as soon as possible.
              </div>
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
              <h5 class="modal-title">${ae.exam.title}</h5>
            </div>
            <div class="modal-body">
              <div class="alert alert-info">This exam is for <b>${ae.student.uniqname}</b>. If this is not you, please close this page.</div>
              <div class="alert alert-info">This page shows your exam questions and gives you a place to work. <b>However, we will not grade anything here</b>. You must <b>download</b> an "answers file" and submit that to <b>Canvas</b> BEFORE the exam ends</b>.</div>
              <div class="alert alert-warning">If something goes wrong (e.g. in case your computer crashes, you accidentally close the page, etc.), this page will attempt to restore your work when you come back. <b>Warning!</b> If you take the exam in private/incognito mode, or if you have certain privacy extensions/add-ons enabled, this won't work.</div>
  
              <p style="margin-left: 2em; margin-right: 2em;">
                By taking this exam and submitting an answers file, you attest to the CoE Honor Pledge:
              </p>
              <p style="margin-left: 4em; margin-right: 4em;">
                <span style="font-style: italic">I have neither given nor received unauthorized aid on this examination, nor have I concealed any violations of the Honor Code."
              </p>
              
              <div style="text-align: center;">
                <button class="btn btn-primary" data-dismiss="modal">I am <b>${ae.student.uniqname}</b> and I understand</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
  
      <div id="exam-welcome-no-autosave-modal" class="modal" data-keyboard="false" data-backdrop="static" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${ae.exam.title}</h5>
            </div>
            <div class="modal-body" style="text-align: center;">
              <div class="alert alert-info">This exam is for <b>${ae.student.uniqname}</b>. If this is not you, please close this page.</div>
              <div class="alert alert-info">This page shows your exam questions and gives you a place to work. <b>However, we will not grade anything here</b>. You must <b>download</b> an "answers file" and submit that to <b>Canvas</b> BEFORE the exam ends</b>.</div>
              <div class="alert alert-danger">It appears your browser will not support backing up your answers to local storage (e.g. in case your computer crashes, you accidentally close the page, etc.).<br /><br />While you may still take the exam like this, we do not recommend it. Make sure you are <b>not</b> using private/incognito mode, temporarily disable privacy add-ons/extensions, or try a different web browser to get autosave to work.</div>
              <div>
                <button class="btn btn-primary" data-dismiss="modal">I am <b>${ae.student.uniqname}</b> and I understand</button>
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
              <div class="alert alert-danger">It appears you have this page open in multiple tabs/windows. That's a bad idea. Close whichever one you just opened.</div>
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

abstract class TakenExamRenderer extends ExamRenderer {


  public override renderScripts(frontendPath: string): string {
    return `<script src="https://accounts.google.com/gsi/client" async></script>`;
  }

  protected override renderModals(ae: AssignedExam) {
    if (!ae.exam.credentials_strategy) {
      return super.renderModals(ae);
    }

    return super.renderModals(ae) + `
      <div id="exam-sign-in-modal" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-sm" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Sign In</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div id="g_id_onload"
              data-client_id="${ae.exam.credentials_strategy.client_id}"
              data-context="signin"
              data-ux_mode="popup"
              data-callback="on_google_sign_in"
              data-auto_select="true"
              data-itp_support="true"
              data-close_on_tap_outside="false"
              >
            </div>
        
            <div class="g_id_signin"
              data-type="standard"
              data-shape="rectangular"
              data-theme="outline"
              data-text="signin_with"
              data-size="large"
              data-logo_alignment="left">
            </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

export class OriginalExamRenderer extends TakenExamRenderer {

  public override renderScripts(frontendPath: string): string {
    return super.renderScripts(frontendPath) + `
      <script src="${path.join(frontendPath, "frontend.js")}"></script>
    `;
  }

  public renderBody(ae: AssignedExam) {
    return `<div id="examma-ray-exam" class="container-fluid" data-uniqname="${ae.student.uniqname}" data-name="${ae.student.name}" data-exam-id="${ae.exam.exam_id}" data-exam-uuid="${ae.uuid}" data-clientside-content="${ae.exam.allow_clientside_content ? "yes" : "no"}">
      <div class="row">
        <div class="bg-light examma-ray-left-panel">
          ${ae.exam.credentials_strategy || ae.exam.verifier ?
            `<div class="text-center pt-1 pb-1 border-bottom">
              ${this.renderSignInButton()}
            </div>` :
            ""
          }
          ${this.renderTimer()}
          <h3 class="text-center pb-1 border-bottom">
            ${renderPointsWorthBadge(ae.pointsPossible, "badge-secondary")}
          </h3>
          ${this.renderNav(ae)}
          ${this.renderSaverButton(ae)}
        </div>
        <div class="examma-ray-main-panel">
          ${this.renderHeader(ae, ae.student)}
          ${this.renderSections(ae)}
          <div class="container examma-ray-bottom-message">
            <div class="alert alert-success" style="margin: 2em; margin-top: 4em;">
              ${mk2html_unwrapped(ae.exam.mk_bottom_message)}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  public override renderNav(ae: AssignedExam): string {
    return `<ul class="nav er-exam-nav show-small-scrollbar" style="display: unset; flex-grow: 1; font-weight: 500; overflow-y: scroll">
        ${ae.assignedSections.map(s => `
          <li class="nav-item">
            <a class="nav-link text-truncate" style="padding: 0.1rem" href="#section-${s.uuid}">${this.renderNavBadge(s)} ${s.displayIndex + ": " + mk2html_unwrapped(s.section.title, s.skin)}</a>
          </li>
          ${s.assignedQuestions.map(q => `
            <li id="starred-question-${q.uuid}" class="nav-item examma-ray-starred-nav" data-question-uuid="${q.uuid}" style="display: none">
              ${renderPointsWorthBadge(q.question.pointsPossible, "btn-secondary", true)}
              <a class="nav-link text-truncate" style="padding: 0.1rem; display: inline" href="#question-anchor-${q.uuid}">
                ${q.question.title ? `${q.displayIndex}: ${mk2html(q.question.title, q.skin)}` : `Question ${q.displayIndex}`}
              </a>
            </li>
          `).join("")}
        `).join("")}
      </ul>`
  }

  public renderNavBadge(s: AssignedSection) {
    return renderPointsWorthBadge(s.pointsPossible, "badge-secondary", true);
  }

  protected renderStudentHeader(student: StudentInfo) {
    return `<h6>${student.name} (${student.uniqname})</h6>`;
  }
  
  protected renderSectionHeader(as: AssignedSection) {
    return `
      <div class="examma-ray-section-heading">
        <div class="badge badge-primary">
          ${as.displayIndex}: ${mk2html_unwrapped(as.section.title, as.skin)} ${renderPointsWorthBadge(as.pointsPossible, "badge-light")}
        </div>
      </div>
    `;
  }

  protected renderQuestionHeader(aq: AssignedQuestion) {
    return `<b>${aq.displayIndex}${aq.question.title ? " " + mk2html_unwrapped(aq.question.title, aq.skin) : ""}</b> ${renderPointsWorthBadge(aq.question.pointsPossible)}`;
  }
  
  protected renderQuestionContent(aq: AssignedQuestion) {
    return aq.question.renderResponse(aq.uuid, aq.skin);
  }
  
}



export class SampleSolutionExamRenderer extends ExamRenderer {

  public renderScripts(frontendPath: string): string {
    return `<script src="${path.join(frontendPath, "frontend-solution.js")}"></script>`
  }

  public renderBody(ae: AssignedExam) {
    return `<div id="examma-ray-exam" class="container-fluid" data-exam-id="${ae.exam.exam_id}" data-exam-uuid="${ae.uuid}">
      <div class="row">
        <div class="bg-light examma-ray-left-panel">
          <div class="text-center pb-1 border-bottom">
            <h5>${renderPointsWorthBadge(ae.pointsPossible, "badge-success")}</h5>
            <span style="font-size: large; font-weight: bold; color: red;">Sample Solution</span>
          </div>
          ${this.renderNav(ae)}
        </div>
        <div class="examma-ray-main-panel">
          ${this.renderHeader(ae, ae.student)}
          ${this.renderSections(ae)}
        </div>
      </div>
    </div>`;
  }

  public renderNavBadge(s: AssignedSection) {
    return renderPointsWorthBadge(s.pointsPossible, "badge-success", true);
  }

  protected renderStudentHeader(student: StudentInfo) {
    return `<h6 style="color: red; font-weight: bold;">Sample Solution</h6>`;
  }
  
  protected renderSectionHeader(as: AssignedSection) {
    return `
      <div class="examma-ray-section-heading">
        <div class="badge badge-primary">
          ${as.displayIndex}: ${mk2html_unwrapped(as.section.title, as.skin)} ${renderPointsWorthBadge(as.pointsPossible, "badge-success")}
        </div>
        <span style="display: inline-block; vertical-align: middle; font-size: large; font-weight: bold; color: red;">Sample Solution</span>
      </div>
    `;
  }

  protected renderQuestionHeader(aq: AssignedQuestion) {
    return `<b>${aq.displayIndex}${aq.question.title ? " " + mk2html_unwrapped(aq.question.title, aq.skin) : ""}</b> ${renderPointsWorthBadge(aq.question.pointsPossible, "badge-success")}`;
  }
  
  protected renderQuestionContent(aq: AssignedQuestion) {
    if (aq.question.sampleSolution) {
      return aq.question.renderResponseSolution(aq.uuid, aq.question.sampleSolution, aq.skin);
    }
    else {
      return `
        <div class="examma-ray-no-sample-solution-message">No sample solution has been specified for this question.</div>
      `;
    }
  }
  
}

export class SubmittedExamRenderer extends ExamRenderer {

  public renderScripts(frontendPath: string): string {
    return `<script src="${path.join(frontendPath, "frontend-solution.js")}"></script>`
  }

  public renderBody(ae: AssignedExam) {
    return `<div id="examma-ray-exam" class="container-fluid" data-exam-id="${ae.exam.exam_id}" data-exam-uuid="${ae.uuid}">
      <div class="row">
        <div class="bg-light examma-ray-left-panel">
          <div class="text-center pb-1 border-bottom">
          <span style="font-size: large; font-weight: bold;">${ae.student.uniqname}</span>
          <br />
          <span style="font-size: large; font-weight: bold;">Exam Submission</span>
          <h5 style="margin-bottom: 0;">${renderPointsWorthBadge(ae.pointsPossible)}</h5>
          </div>
          ${this.renderNav(ae)}
        </div>
        <div class="examma-ray-main-panel">
          ${this.renderHeader(ae, ae.student)}
          ${this.renderSections(ae)}
        </div>
      </div>
    </div>`;
  }

  public renderNavBadge(s: AssignedSection) {
    return renderPointsWorthBadge(s.pointsPossible, "badge-secondary", true);
  }

  protected renderStudentHeader(student: StudentInfo) {
    return `
      <h6>${student.name} (${student.uniqname})</h6>
      <h6>Exam Submission</h6>
    `;
  }
  
  protected renderSectionHeader(as: AssignedSection) {
    return `
      <div class="examma-ray-section-heading">
        <div class="badge badge-primary">
          ${as.displayIndex}: ${mk2html_unwrapped(as.section.title, as.skin)} ${renderPointsWorthBadge(as.pointsPossible)}
        </div>
        <span style="display: inline-block; vertical-align: middle; font-size: large; font-weight: bold;">Submitted Answers</span>
      </div>
    `;
  }

  protected renderQuestionHeader(aq: AssignedQuestion) {
    return `<b>${aq.displayIndex}${aq.question.title ? " " + mk2html_unwrapped(aq.question.title, aq.skin) : ""}</b> ${renderPointsWorthBadge(aq.question.pointsPossible)}`;
  }
  
  protected renderQuestionContent(aq: AssignedQuestion) {
    return aq.question.renderResponseSolution(aq.uuid, aq.submission, aq.skin);
  }
  
}

export class GradedExamRenderer extends ExamRenderer {

  public renderScripts(frontendPath: string): string {
    return `<script src="${path.join(frontendPath, "frontend-graded.js")}"></script>`
  }

  public renderBody(ae: AssignedExam) {
    return `<div id="examma-ray-exam" class="container-fluid" data-uniqname="${ae.student.uniqname}" data-name="${ae.student.name}" data-exam-id="${ae.exam.exam_id}" data-exam-uuid="${ae.uuid}">
      <div class="row">
        <div class="bg-light examma-ray-left-panel">
          <h3 class="text-center pb-1 border-bottom">
            ${this.renderGrade(ae)}
          </h3>
          ${this.renderNav(ae)}
        </div>
        <div class="examma-ray-main-panel">
          ${this.renderGradingSummary(ae)}
          ${this.renderHeader(ae, ae.student)}
          ${this.renderSections(ae)}
        </div>
      </div>
    </div>`;
  }

  public renderNavBadge(s: AssignedSection) {
    return s.isGraded() ? renderScoreBadge(s.pointsEarned, s.pointsPossible) :
    renderUngradedBadge(s.pointsPossible);
  }

  protected renderStudentHeader(student: StudentInfo) {
    return `<h6>${student.name} (${student.uniqname})</h6>`;
  }
  
  public renderGrade(ae: AssignedExam) {
    return ae.isGraded()
      ? maxPrecisionString(ae.curve?.adjustedScore ?? ae.pointsEarned, 2) + "/" + ae.pointsPossible
      : "?/" + ae.pointsPossible;
  }
  
  protected renderSectionHeader(as: AssignedSection) {
    let badge = as.isGraded()
      ? renderScoreBadge(as.pointsEarned, as.pointsPossible)
      : renderUngradedBadge(as.pointsPossible);

    return `
      <div class="examma-ray-section-heading">
        <div class="badge badge-primary">${badge} ${as.displayIndex}: ${mk2html_unwrapped(as.section.title, as.skin)}</div>
      </div>
    `;
  }

  protected renderQuestionHeader(aq: AssignedQuestion) {
    return `<b>${aq.displayIndex}${aq.question.title ? " " + mk2html_unwrapped(aq.question.title, aq.skin) : ""}</b> ${aq.isGraded()
      ? renderScoreBadge(aq.pointsEarned, aq.question.pointsPossible)
      : renderUngradedBadge(aq.question.pointsPossible)
    }`;
  }

  protected renderQuestionContent(aq: AssignedQuestion) {
    let graded_html: string;
    let exception_html = "";
    
    if (aq.isGraded()) {
      graded_html = aq.gradedBy.renderReport(aq);
      exception_html = this.renderExceptionIfPresent(aq);
    }
    else {
      graded_html = `
      <div class="alert alert-danger" role="alert">
        NOT GRADED
      </div>`; 
    }

    let regrades = `
      <div style="text-align: right">
        <input type="checkbox" id="regrade-${aq.uuid}-checkbox" class="examma-ray-regrade-checkbox" data-toggle="collapse" data-target="#regrade-${aq.uuid}" role="button" aria-expanded="false" aria-controls="regrade-${aq.uuid}"></input>
        <label for="regrade-${aq.uuid}-checkbox">Mark for Regrade</label>
      </div>
      <div class="collapse examma-ray-question-regrade" id="regrade-${aq.uuid}">
        <p>Please describe your regrade request for this question in the box below. After
        marking <b>all</b> questions for which you would like to request a regrade,
        click "Submit Regrade Request" at the bottom of the page.</p>
        <textarea class="examma-ray-regrade-entry"></textarea>
      </div>
    `;

    return `
      <div class="examma-ray-question-exception">
        ${exception_html}
      </div>
      <div class="examma-ray-grading-report">
        ${graded_html}
      </div>
      ${aq.exam.enable_regrades ? regrades : ""}
    `;
  }

  private renderExceptionIfPresent(aq: AssignedQuestion) {
    if (!aq.exception) {
      return "";
    }

    return `<div class="alert alert-warning">
      <p><strong>An exception was applied when grading this question.</strong></p>
      <p>Your score on this question was adjusted from <strong>${aq.pointsEarnedWithoutExceptions}</strong> to <strong>${aq.pointsEarned}</strong>.</p>
      ${mk2html(aq.exception.explanation)}
    </div>`;
  }
}

export class DocRenderer extends TakenExamRenderer {

  public override renderScripts(frontendPath: string): string {
    return super.renderScripts(frontendPath) + `
      <script src="${path.join(frontendPath, "frontend-doc.js")}"></script>
    `;
  }

  public renderBody(ae: AssignedExam) {
    return `<div id="examma-ray-exam" class="container-fluid" data-uniqname="${ae.student.uniqname}" data-name="${ae.student.name}" data-exam-id="${ae.exam.exam_id}" data-exam-uuid="${ae.uuid}" data-clientside-content="${ae.exam.allow_clientside_content ? "yes" : "no"}">
      <div class="row">
        <div class="bg-light examma-ray-left-panel">
          <div class="text-center pb-1 pl-4 pr-4 border-bottom">
            <b>${ae.exam.title}</b>
          </div>
          ${ae.exam.credentials_strategy || ae.exam.verifier ?
            `<div class="text-center pt-1 pb-1 border-bottom">
              ${this.renderSignInButton()}
            </div>` :
            ""
          }
          ${this.renderNav(ae)}
          ${this.renderSaverButton(ae)}
        </div>
        <div class="examma-ray-main-panel">
          ${this.renderHeader(ae, ae.student)}
          ${this.renderSections(ae)}
          <div class="container examma-ray-bottom-message">
            <div class="alert alert-success" style="margin: 2em; margin-top: 4em;">
              ${mk2html_unwrapped(ae.exam.mk_bottom_message)}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  public override renderNav(ae: AssignedExam): string {
    return `<ul class="nav er-exam-nav show-small-scrollbar" style="display: unset; flex-grow: 1; font-weight: 500; overflow-y: scroll">
        ${ae.assignedSections.map(s => `
          <li class="nav-item">
            <a class="nav-link text-truncate" style="padding: 0.1rem" href="#section-${s.uuid}">${s.displayIndex + ": " + mk2html_unwrapped(s.section.title, s.skin)}</a>
          </li>
          ${s.assignedQuestions.map(q => `
            <li id="starred-question-${q.uuid}" class="nav-item examma-ray-starred-nav" data-question-uuid="${q.uuid}" style="display: none">
              <a class="nav-link text-truncate" style="padding: 0.1rem; display: inline" href="#question-anchor-${q.uuid}">
              ${q.question.title ? `${q.displayIndex}: ${mk2html(q.question.title, q.skin)}` : `Question ${q.displayIndex}`}
              </a>
            </li>
          `).join("")}
        `).join("")}
      </ul>`
  }

  public renderNavBadge(s: AssignedSection) {
    return renderPointsWorthBadge(s.pointsPossible, "badge-secondary", true);
  }

  protected renderStudentHeader(student: StudentInfo) {
    return "";
  }
  
  protected renderSectionHeader(as: AssignedSection) {
    return `
      <div class="examma-ray-section-heading">
        <div class="badge badge-primary">
          ${as.displayIndex}: ${mk2html_unwrapped(as.section.title, as.skin)}
        </div>
      </div>
    `;
  }

  protected renderQuestionHeader(aq: AssignedQuestion) {
    return `<b>${aq.displayIndex}${aq.question.title ? " " + mk2html_unwrapped(aq.question.title, aq.skin) : ""}</b>`;
  }
  
  protected renderQuestionContent(aq: AssignedQuestion) {
    return aq.question.renderResponse(aq.uuid, aq.skin);
  }
  
}