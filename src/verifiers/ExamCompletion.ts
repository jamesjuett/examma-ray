import axios, { AxiosError, formToJSON } from "axios";
import { AssignedExam, AssignedQuestion } from "../core/assigned_exams";
import { ICON_BOX, ICON_BOX_CHECK, ICON_BOX_DASH, ICON_BOX_EXCLAMATION, ICON_CLOCK, ICON_EXCLAMATION_TRIANGLE_FILL, ICON_SCALE } from "../core/icons";
import { asMutable, assertNever } from "../core/util";
import { FullCreditVerifier, FullCreditVerifierSpecification } from "./FullCreditVerifier";
import { QuestionVerifier } from "./QuestionVerifier";
import { DateTime } from "luxon";

export type ExamCompletionSpecification = {
  threshold: number,
  tooltip: string,
  endpoints: {
    check: string,
    submit: string,
  },
  local_deadline?: DateTime
};

export class ExamCompletion {

  public readonly assigned_exam: AssignedExam;
  public readonly spec: ExamCompletionSpecification;
  public readonly isComplete: boolean = false;

  private server_status: "no_credentials" | "ok" | "error" = "no_credentials";

  private statusElem: JQuery;
  private credentials?: string;

  public constructor(assigned_exam: AssignedExam, statusElem: JQuery) {
    this.assigned_exam = assigned_exam;
    this.spec = assigned_exam.exam.completion!;
    this.statusElem = statusElem;
    this.updateStatus();
  }

  public setCredentials(credentials: string) {
    this.credentials = credentials;
    this.updateStatus();
    this.checkCompletionWithServer(); // async
  }

  public async checkCompletionWithServer() {
    if (!this.credentials) {
      this.updateStatus(); 
      return;
    }

    try {
      const check_completion_response = await axios({
        url: this.spec.endpoints.check + this.assigned_exam.exam.exam_id,
        method: "GET",
        headers: {
            'Authorization': this.credentials
        }
      });
      this.server_status = "ok";
      
      if (check_completion_response.status === 200) {
        asMutable(this).isComplete = true;
        return check_completion_response.data;
      }
      else {
        return undefined;
      }
    }
    catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 404) {
          this.server_status = "ok";
        }
        else {
          this.server_status = "error";
        }
      }
      else {
        this.server_status = "error";
        throw e;
      }
    }
    finally {
      this.updateStatus();
    }

    this.updateStatus();
  }

  private isPastDeadline() {
    return !!(this.spec.local_deadline && this.spec.local_deadline.diffNow().as("milliseconds") < 0);
  }

  public async verify() {
    if (!this.credentials || this.isComplete || this.isPastDeadline()) { 
      this.updateStatus();
      return;
    }

    let complete = this.assigned_exam.assignedQuestions.every(aq => !aq.question.verifier || aq.question.verifier.verify(aq));

    if (!complete) {
      this.updateStatus();
      return;
    }

    try {
      const submit_completion_response = await axios({
        url: this.spec.endpoints.submit + this.assigned_exam.exam.exam_id,
        method: "POST",
        headers: {
            'Authorization': this.credentials
        }
      });
      this.server_status = "ok";
      
      if (submit_completion_response.status === 201) {
        asMutable(this).isComplete = true;
        return submit_completion_response.data;
      }
      else {
        return undefined;
      }
    }
    catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 404) {
          this.server_status = "ok";
        }
        else {
          this.server_status = "error";
        }
      }
      else {
        this.server_status = "error";
        throw e;
      }
    }
    finally {
      this.updateStatus();
    }

  }

  public updateStatus() {
    let status_html: string;
    if (this.server_status === "no_credentials") {
      status_html = `
        <span style="font-size: 16pt;">
          <span style="color: red;">${ICON_SCALE(ICON_EXCLAMATION_TRIANGLE_FILL)}</span> <span class="badge badge-secondary" style="vertical-align: middle;"> Sign in to verify</span>
        </span>
      `;
    }
    else if (this.server_status === "error") {
      status_html = `
        <span style="font-size: 16pt;">
          <span style="color: red;">${ICON_SCALE(ICON_EXCLAMATION_TRIANGLE_FILL)}</span> <span class="badge badge-danger" style="vertical-align: middle;"> Server Error :(</span>
        </span>
      `;
    }
    else if (this.server_status === "ok") {
      if (this.isComplete) {
        status_html = `
          <span style="font-size: 16pt;">
            <span>${ICON_SCALE(ICON_BOX_CHECK)}</span> <span class="badge badge-success" style="vertical-align: middle;"> Completion Verified</span>
          </span>
        `;
      }
      else if (this.isPastDeadline()) {
        status_html = `
          <span style="font-size: 16pt;">
            <span>${ICON_SCALE(ICON_BOX_DASH)}</span> <span class="badge badge-danger" style="vertical-align: middle;"> Past Deadline</span>
          </span>
        `;
      }
      else {
        status_html = `
          <span style="font-size: 16pt;">
            <span>${ICON_SCALE(ICON_BOX)}</span> <span class="badge badge-warning" style="vertical-align: middle;"> Not Complete</span>
          </span>
        `;
      }
    }
    else {
      assertNever(this.server_status);
    }

    const deadline_html = this.spec.local_deadline
      ? `<span style="font-size: 9pt; vertical-align: middle;">Due ${this.spec.local_deadline.toLocaleString({
        ...DateTime.DATETIME_FULL,
        weekday: "short"
      })}</span>`
      : "";

    this.statusElem.html(`
      <b>Participation</b><br />
      ${deadline_html}
      <br />
      ${status_html}
    `);
  }

};