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

  private annotations_active : boolean = false;

  public constructor(spec: FullCreditVerifierSpecification) {
    this.spec = spec;
  }

  public verify(aq: AssignedQuestion) {
    return aq.isGraded() && hasFullCredit(aq);
  }

  public renderStatus(aq: AssignedQuestion) {
    return `
      <span class="badge badge-secondary">${ICON_BOX} <span class="examma-ray-verifier-status-display-index" style="vertical-align: middle;">${aq.displayIndex}</span> <span class="examma-ray-verifier-status-message" style="vertical-align: middle;">Not Started</span></span>
    `;
  }

  public updateStatus(aq: AssignedQuestion, elems: JQuery) {
    if (!aq.isGraded()) {
      elems.html(`<span class="badge badge-secondary">${ICON_BOX_EXCLAMATION} <span class="examma-ray-verifier-status-display-index" style="vertical-align: middle;">${aq.displayIndex}</span> <span class="examma-ray-verifier-status-message" style="vertical-align: middle;">Unverified</span></span>`);
    }
    else if (aq.gradingResult.wasBlankSubmission) {
      elems.html(`<span class="badge badge-secondary">${ICON_BOX} <span class="examma-ray-verifier-status-display-index" style="vertical-align: middle;">${aq.displayIndex}</span> <span class="examma-ray-verifier-status-message" style="vertical-align: middle;">Not Started</span></span>`);
    }
    else if (hasFullCredit(aq)) {
      elems.html(`<span class="badge badge-success">${ICON_BOX_CHECK} <span class="examma-ray-verifier-status-display-index" style="vertical-align: middle;">${aq.displayIndex}</span> <span class="examma-ray-verifier-status-message" style="vertical-align: middle;">Complete</span></span>`);
    }
    else {
      elems.html(`<span class="badge badge-warning">${ICON_BOX} <span class="examma-ray-verifier-status-display-index" style="vertical-align: middle;">${aq.displayIndex}</span> <span class="examma-ray-verifier-status-message" style="vertical-align: middle;">In Progress</span></span>`);
    }
  }

  public activate(aq: AssignedQuestion, elem: JQuery) {
    elem.on("click", () => { this.annotations_active = !this.annotations_active; });
  }

}
function hasFullCredit(aq: GradedQuestion<ResponseKind, GradingResult>) {
  return aq.pointsEarned >= aq.question.pointsPossible - EPS;
}

