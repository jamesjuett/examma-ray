import axios, { AxiosError, formToJSON } from "axios";
import { AssignedExam, AssignedQuestion } from "../core/assigned_exams";
import { ICON_BOX, ICON_BOX_CHECK, ICON_BOX_DASH, ICON_BOX_EXCLAMATION, ICON_CLOCK, ICON_EXCLAMATION_TRIANGLE_FILL, ICON_SCALE, ICON_USER } from "../core/icons";
import { asMutable, assert, assertNever } from "../core/util";
import { FullCreditVerifier, FullCreditVerifierSpecification } from "./FullCreditVerifier";
import { QuestionVerifier } from "./QuestionVerifier";
import { DateTime } from "luxon";
import { jwtDecode } from "jwt-decode";

export type ExamCompletionSpecification = {
  threshold: number,
  tooltip: string,
  endpoints: {
    check: string,
    submit: string,
    auth: string,
  },
  local_deadline?: {
    when: DateTime,
    grace_minutes?: number
  }
};

type User = {
  participation_token: string,
  email: string,
  is_complete?: boolean,
};

function decodeUser(participation_token: string) : User {
  const decoded = jwtDecode(participation_token);
  assert(decoded.sub);
  return {
    participation_token: participation_token,
    email: decoded.sub
  };
}

const PARTICIPATION_TOKEN_KEY = "examma-ray-participation-token";

export class ExamCompletion {

  public readonly assigned_exam: AssignedExam;
  public readonly spec: ExamCompletionSpecification;

  private server_status: "ok" | "error" = "ok";

  private statusElem: JQuery;
  private user?: User;

  public constructor(assigned_exam: AssignedExam, statusElem: JQuery) {
    this.assigned_exam = assigned_exam;
    this.spec = assigned_exam.exam.completion!;
    this.statusElem = statusElem;

    const participation_token = localStorage.getItem(PARTICIPATION_TOKEN_KEY);
    if (participation_token) {
      this.setUser(participation_token);
    }
    this.updateStatus();
  }

  private async setUser(participation_token: string) {
    this.user = decodeUser(participation_token);
    $("#examma-ray-exam-sign-in-button > span").html(this.user.email.replace("@umich.edu", ""));
    $("#exam-sign-in-modal").modal("hide");
    await this.checkCompletionWithServer();
    await this.verify();
  }

  private removeUser() {
    delete this.user;
    $("#examma-ray-exam-sign-in-button > span").html(`${ICON_SCALE(ICON_USER)} <span style="vertical-align: middle">Sign In</span>`);
  }

  public async signIn(google_id_token: string) {

    localStorage.removeItem(PARTICIPATION_TOKEN_KEY);
    this.removeUser();

    try {
      const auth_response = await axios({
        url: this.spec.endpoints.auth,
        method: "POST",
        headers: {
          "Authorization": google_id_token
        }
      });
      
      if (auth_response.status === 201) {
        const participation_token = auth_response.data.participation_token;
        if (participation_token && participation_token !== "") {
          localStorage.setItem(PARTICIPATION_TOKEN_KEY, participation_token);
          await this.setUser(participation_token);
        }
      }
    }
    catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 403) {
          localStorage.removeItem(PARTICIPATION_TOKEN_KEY);
          this.removeUser();
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

  public async checkCompletionWithServer() {
    if (!this.user) {
      return;
    }

    try {
      const check_completion_response = await axios({
        url: this.spec.endpoints.check + this.assigned_exam.exam.exam_id,
        method: "GET",
        headers: {
          "Authorization": this.user.participation_token
        }
      });
      this.server_status = "ok";
      
      if (check_completion_response.status === 200) {
        const data = check_completion_response.data;
        this.user.is_complete = data.is_complete;
        return data;
      }
      else {
        return undefined;
      }
    }
    catch (e: unknown) {
      this.server_status = "error";
      if (!axios.isAxiosError(e)) {
        throw e;
      }
    }
    finally {
      this.updateStatus();
    }
  }

  private isPastDeadline() {
    if (!this.spec.local_deadline) { return false; } // no deadline

    return this.spec.local_deadline.when.diffNow().as("minutes") < -(this.spec.local_deadline.grace_minutes ?? 0);
  }

  public async verify() {
    if (!this.user || this.user.is_complete || this.isPastDeadline()) {
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
        method: "PUT",
        headers: {
          "Authorization": this.user.participation_token
        }
      });
      this.server_status = "ok";
      
      if (submit_completion_response.status === 201) {
        const data = submit_completion_response.data;
        this.user.is_complete = data.is_complete;
        return data;
      }
      else {
        return undefined;
      }
    }
    catch (e: unknown) {
      this.server_status = "error";
      if (!axios.isAxiosError(e)) {
        throw e;
      }
    }
    finally {
      this.updateStatus();
    }

  }

  public updateStatus() {
    let status_html: string;
    if (!this.user) {
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
      if (this.user.is_complete) {
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
      ? `<span style="font-size: 9pt; vertical-align: middle;">Due ${this.spec.local_deadline.when.toLocaleString({
        ...DateTime.DATETIME_FULL,
        weekday: "short"
      })}</span><br />`
      : "";

    this.statusElem.html(`
      ${deadline_html}
      ${status_html}
    `);
  }

};