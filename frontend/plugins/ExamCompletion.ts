import axios from "axios";
import { DateTime } from "luxon";
import { ExamCompletionSpecification } from "../../src/core";
import { ICON_BOX, ICON_BOX_CHECK, ICON_BOX_DASH, ICON_EXCLAMATION_TRIANGLE_FILL, ICON_SCALE } from "../../src/core/icons";
import { asMutable, assertNever } from "../../src/core/util";
import { Participant } from "./Participant";

export class ExamCompletion {

  public readonly participant: Participant;
  public readonly spec: ExamCompletionSpecification;

  private server_status: "ok" | "error" = "ok";

  private statusElem: JQuery;

  public readonly isComplete: boolean = false;
  private checked_with_server: boolean = false;
  private pending_refresh: boolean = false;

  public constructor(participant: Participant, statusElem: JQuery) {
    this.participant = participant;
    this.spec = participant.assigned_exam.exam.completion!;
    this.statusElem = statusElem;
    this.refresh();
    participant.onUserChange(() => this.userChanged());
  }

  private async userChanged() {
    this.checked_with_server = false;
    await this.refresh();
  }

  public async refresh() {
    if (this.pending_refresh) {
      return;
    }
    try {
      this.pending_refresh = true;
      if (!this.checked_with_server) {
        await this.checkCompletionWithServer();
      }
      await this.verify();
      this.updateStatus();
    }
    finally {
      this.pending_refresh = false;
    }
  }

  private async checkCompletionWithServer() {
    if (!this.participant.user) {
      return;
    }

    try {
      const check_completion_response = await axios({
        url: this.spec.endpoints.check + this.participant.assigned_exam.exam.exam_id,
        method: "GET",
        headers: {
          "Authorization": this.participant.user.participation_token
        }
      });
      this.server_status = "ok";
      
      if (check_completion_response.status === 200) {
        const data = check_completion_response.data;
        asMutable(this).isComplete = data.is_complete;
        this.checked_with_server = true;
        return data;
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

  private async verify() {
    if (!this.participant.user || !this.checked_with_server || this.isComplete || this.isPastDeadline()) {
      return;
    }

    let complete = this.participant.assigned_exam.assignedQuestions.every(aq => !aq.question.verifier || aq.question.verifier.verify(aq));

    if (!complete) {
      return;
    }

    try {
      const submit_completion_response = await axios({
        url: this.spec.endpoints.submit + this.participant.assigned_exam.exam.exam_id,
        method: "PUT",
        headers: {
          "Authorization": this.participant.user.participation_token
        }
      });
      this.server_status = "ok";
      
      if (submit_completion_response.status === 201) {
        const data = submit_completion_response.data;
        asMutable(this).isComplete = data.is_complete;
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
    if (!this.participant.user) {
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