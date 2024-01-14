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

  public renderStatusBadge(aq: AssignedQuestion) {
    return `
      <span class="examma-ray-verifier-status-badge badge badge-secondary" style="float: right; ">${ICON_BOX} <span style="vertical-align: middle;">Not Started</span></span>
    `;
  }

  public updateStatusBadge(aq: AssignedQuestion, elem: JQuery) {
    if (!aq.isGraded()) {
      elem.html(`${ICON_BOX_EXCLAMATION} <span style="vertical-align: middle;">Unverified</span>`).removeClass(BADGE_CLASSES).addClass("badge badge-secondary");
    }
    else if (aq.gradingResult.wasBlankSubmission) {
      elem.html(`${ICON_BOX} <span style="vertical-align: middle;">Not Started</span>`).removeClass(BADGE_CLASSES).addClass("badge badge-secondary");
    }
    else if (hasFullCredit(aq)) {
      elem.html(`${ICON_BOX_CHECK} <span style="vertical-align: middle;">Complete</span>`).removeClass(BADGE_CLASSES).addClass("badge badge-success");
    }
    else {
      elem.html(`${ICON_BOX} <span style="vertical-align: middle;">In Progress</span>`).removeClass(BADGE_CLASSES).addClass("badge badge-warning");
    }
  }

}
function hasFullCredit(aq: GradedQuestion<ResponseKind, GradingResult>) {
  return aq.pointsEarned >= aq.question.pointsPossible - EPS;
}

