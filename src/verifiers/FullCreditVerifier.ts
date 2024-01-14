import { AssignedQuestion } from "../core/assigned_exams";
import { ICON_BOX, ICON_BOX_EXCLAMATION } from "../core/icons";
import { assertNever } from "../core/util";
import { QuestionGrader, realizeGrader } from "../graders/QuestionGrader";
import { ResponseKind } from "../response/common";
import { QuestionVerifier } from "./QuestionVerifier";

export type FullCreditVerifierSpecification = {
  readonly verifier_kind: "full_credit",
};

export class FullCreditVerifier implements QuestionVerifier<ResponseKind> {

  public readonly spec: FullCreditVerifierSpecification;

  public readonly t_response_kinds!: ResponseKind;

  public constructor(spec: FullCreditVerifierSpecification) {
    this.spec = spec;
  }

  public verify(aq: AssignedQuestion) {
    return aq.isGraded() && aq.pointsEarned >= aq.question.pointsPossible;
  }

  public renderStatusBadge(aq: AssignedQuestion) {
    return `
      <span class="badge badge-light">${ICON_BOX}Not Started</span>
    `;
  }

  public updateStatusBadge(aq: AssignedQuestion, elem: JQuery) {
    if (!aq.isGraded()) {
      elem.html(`${ICON_BOX_EXCLAMATION} Unverified`).removeClass().addClass("badge badge-secondary");
    }
    else if (aq.gradingResult.wasBlankSubmission) {
      elem.html(`${ICON_BOX}Not Started</span>`).removeClass().addClass("badge badge-light");
    }
    else if (aq.pointsEarned >= aq.question.pointsPossible) {
      elem.html(`${ICON_BOX}Complete</span>`).removeClass().addClass("badge badge-success");
    }
    else {
      elem.html(`${ICON_BOX}In Progress</span>`).removeClass().addClass("badge badge-warning");
    }
  }

}
