import axios, { formToJSON } from "axios";
import { AssignedExam, AssignedQuestion } from "../core/assigned_exams";
import { ICON_BOX, ICON_BOX_CHECK, ICON_BOX_EXCLAMATION } from "../core/icons";
import { asMutable, assertNever } from "../core/util";
import { FullCreditVerifier, FullCreditVerifierSpecification } from "./FullCreditVerifier";
import { QuestionVerifier } from "./QuestionVerifier";

export type ExamCompletionSpecification = {
  threshold: number,
  tooltip: string,
  endpoints: {
    check: string,
    submit: string,
  },
};

export class ExamCompletion {

  public readonly assigned_exam: AssignedExam;
  public readonly spec: ExamCompletionSpecification;
  public readonly isComplete: boolean = false;

  private statusElem : JQuery;

  public constructor(assigned_exam: AssignedExam, statusElem: JQuery) {
    this.assigned_exam = assigned_exam;
    this.spec = assigned_exam.exam.completion!;
    this.statusElem = statusElem;
  }

  public async checkCompletionWithServer(credentials: string) {

    const check_completion_response = await axios({
      url: this.spec.endpoints.check + this.assigned_exam.exam.exam_id,
      method: "GET",
      headers: {
          'Authorization': credentials
      }
    });
    
    if (check_completion_response.status === 200) {
      asMutable(this).isComplete = true;
      this.updateStatus();
      return check_completion_response.data;
    }
    else {
      return undefined;
    }
  }

  public async verify(ae: AssignedExam, credentials: string) {
    let complete = ae.assignedQuestions.every(aq => !aq.question.verifier || aq.question.verifier.verify(aq));

    if (!complete) {
      return;
    }

    const submit_completion_response = await axios({
      url: this.spec.endpoints.submit + this.assigned_exam.exam.exam_id,
      method: "POST",
      headers: {
          'Authorization': credentials
      }
    });
    
    if (submit_completion_response.status === 201) {
      asMutable(this).isComplete = true;
      this.updateStatus();
      return submit_completion_response.data;
    }
    else {
      return undefined;
    }
  }

  public renderStatus() {
    return `
      <span class="btn btn-sm btn-secondary">${ICON_BOX} <span style="vertical-align: middle;"> Participation</span></span>
    `;
  }

  public updateStatus() {
    if (this.isComplete) {
      this.statusElem.html(`<span class="btn btn-sm btn-success">${ICON_BOX_CHECK} <span style="vertical-align: middle;">Participation</span></span>`);
    }
    else {
      this.statusElem.html(`<span class="btn btn-sm btn-secondary">${ICON_BOX} <span style="vertical-align: middle;"> Participation</span></span>`);
    }
  }

};

export type QuestionVerifierSpecification =
  | FullCreditVerifierSpecification;

// export type QuestionVerifier<VK extends QuestionVerifierKind = QuestionVerifierKind> =
//   VK extends "full_credit" ? FullCreditVerifier :
//   never;

// type ExtractViableVerifiers<V extends QuestionVerifier, RK> = V extends QuestionVerifier ? RK extends V["t_response_kinds"] ? V : never : never;

// export type QuestionVerifierSpecificationFor<RK extends ResponseKind> = ExtractViableVerifiers<QuestionVerifier, RK>["spec"];
// export type VerifierFor<RK extends ResponseKind> = ExtractViableVerifiers<QuestionVerifier, RK>;

export function realizeVerifier(spec: QuestionVerifierSpecification) : QuestionVerifier {
  return (
    spec.verifier_kind === "full_credit" ? new FullCreditVerifier(spec) :
    assertNever(spec.verifier_kind)
  );
}

export function renderQuestionVerifierStatus(aq: AssignedQuestion, verifier: QuestionVerifier) {
  return `
    <span class="examma-ray-verifier-status" data-question-uuid="${aq.uuid}">
      ${verifier.renderStatus(aq)}
    </span>
  `;
}