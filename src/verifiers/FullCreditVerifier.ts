import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { ICON_BOX, ICON_BOX_CHECK, ICON_BOX_EXCLAMATION } from "../core/icons";
import { assertNever } from "../core/util";
import { GradingResult, QuestionGrader, realizeGrader } from "../graders/QuestionGrader";
import { ResponseKind } from "../response/common";
import { QuestionVerifier } from "./QuestionVerifier";

export type FullCreditVerifierSpecification = {
  readonly verifier_kind: "full_credit",
};

const BADGE_CLASSES = [
  "badge-secondary",
  "badge-success",
  "badge-warning",
];

const EPS = 0.00001;

export class FullCreditVerifier implements QuestionVerifier<ResponseKind> {

  public readonly spec: FullCreditVerifierSpecification;

  public readonly t_response_kinds!: ResponseKind;

  public constructor(spec: FullCreditVerifierSpecification) {
    this.spec = spec;
  }

  public verify(aq: AssignedQuestion) {
    return aq.isGraded() && hasFullCredit(aq);
  }

  public renderStatus(aq: AssignedQuestion) {
    return `
      <span class="badge badge-secondary">${ICON_BOX} <span style="vertical-align: middle;">${aq.displayIndex} Not Started</span></span>
    `;
  }

  public updateStatus(aq: AssignedQuestion, elem: JQuery) {
    if (!aq.isGraded()) {
      elem.html(`<span class="badge badge-secondary">${ICON_BOX_EXCLAMATION} <span style="vertical-align: middle;">${aq.displayIndex} Unverified</span></span>`);
    }
    else if (aq.gradingResult.wasBlankSubmission) {
      elem.html(`<span class="badge badge-secondary">${ICON_BOX} <span style="vertical-align: middle;">${aq.displayIndex} Not Started</span></span>`);
    }
    else if (hasFullCredit(aq)) {
      elem.html(`<span class="badge badge-success">${ICON_BOX_CHECK} <span style="vertical-align: middle;">${aq.displayIndex} Complete</span></span>`);
    }
    else {
      elem.html(`<span class="badge badge-warning">${ICON_BOX} <span style="vertical-align: middle;">${aq.displayIndex} In Progress</span></span>`);
    }
  }

}
function hasFullCredit(aq: GradedQuestion<ResponseKind, GradingResult>) {
  return aq.pointsEarned >= aq.question.pointsPossible - EPS;
}

