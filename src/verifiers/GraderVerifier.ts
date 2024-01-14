import { mk2html } from "../core/render";
import { renderNumBadge } from "../core/ui_components";
import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { BLANK_SUBMISSION, INVALID_SUBMISSION, ResponseKind } from "../response/common";
import { MCSubmission } from "../response/mc";
import { assert, assertNever } from "../core/util";
import { QuestionVerifier, ImmutableGradingResult } from "./QuestionVerifier";
import { CHECK_ICON, ICON_BOX, ICON_BOX_EXCLAMATION, RED_X_ICON } from "../core/icons";
import { GraderFor, GraderSpecificationFor, QuestionGrader, realizeGrader } from "../graders/QuestionGrader";
import { Question } from "../core/exam_components";
import { SubmissionType } from "../response/responses";

type GraderSelectionStrategy<RK extends ResponseKind> =
  | "default"
  | {
    strategy: "custom",
    spec: GraderSpecificationFor<RK>
  }
;

export type GraderVerifierSpecification<RK extends ResponseKind> = {
  readonly verifier_kind: "grader",
  readonly criteria: "full_credit",
  readonly grader: GraderSelectionStrategy<RK>;
};

export class GraderVerifier<RK extends ResponseKind> implements QuestionVerifier<RK> {

  public readonly spec: GraderVerifierSpecification<RK>;

  public readonly t_response_kinds!: RK;

  private _grader?: QuestionGrader<RK>;

  public constructor(spec: GraderVerifierSpecification<RK>) {
    this.spec = spec;
    if (spec.grader !== "default") {
      this._grader = <QuestionGrader<RK>>realizeGrader(spec.grader.spec);
    }
  }

  public isVerifier<T extends ResponseKind>(question: Question<T>) : this is QuestionVerifier<T> {
    return !!(this.spec.grader !== "default"
      ? this._grader!.isGrader(question.response.kind)
      : question.defaultGrader?.isGrader(question.response.kind));
  };

  private getGrader(question: Question<RK>) : QuestionGrader<RK>{
    return this.spec.grader !== "default"
      ? this._grader!
      : <QuestionGrader<RK>>question.defaultGrader!;
  }

  public verify(aq: AssignedQuestion<RK>) : boolean {
    const gr = this.getGrader(aq.question).grade(aq);
    if (!gr) {
      return false;
    }
    const points = this.getGrader(aq.question).pointsEarned(gr);

    if (this.spec.criteria === "full_credit") {
      return points >= aq.question.pointsPossible;
    }
    else {
      assertNever(this.spec.criteria);
    }
  }
  
  public annotateResponseElem(aq: AssignedQuestion<RK>, response_elem: JQuery) {
    // nothing to do here
  }

}
