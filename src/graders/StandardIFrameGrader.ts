import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { BLANK_SUBMISSION, INVALID_SUBMISSION, ResponseKind } from "../response/common";
import { ImmutableGradingResult, QuestionGrader } from "./QuestionGrader";
import { FITBDropRubricItemEvaluation } from "./StandardFITBDropGrader";


export type StandardIFrameGradingResult = ImmutableGradingResult & {
  evaluation: StandardIFrameRubricItemEvaluation[]
}


export type StandardIFrameRubricItemEvaluation = {
  pointsEarned: number,
  explanation: string,
}


export type StandardIFrameGraderRubricItem = {
  points: number,
  description: string,
  property: string,
  value: any,
};

export type StandardIFrameGraderSpecification = {
  readonly grader_kind: "standard_iframe",
  readonly rubric: StandardIFrameGraderRubricItem[],
};

export class StandardIFrameGrader implements QuestionGrader<"iframe", StandardIFrameGradingResult> {

  public readonly spec: StandardIFrameGraderSpecification;

  public readonly t_response_kinds!: "iframe";

  public constructor(spec: StandardIFrameGraderSpecification) {
    this.spec = spec;
  }

  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return responseKind === "iframe";
  };

  public prepare() { }

  public grade(aq: AssignedQuestion<"iframe">) : StandardIFrameGradingResult {
    const submission = aq.submission;
    if (submission === INVALID_SUBMISSION) {
      return {
        wasBlankSubmission: false,
        wasInvalidSubmission: true,
        pointsEarned: 0,
        evaluation: []
      }
    }
    if (submission === BLANK_SUBMISSION) {
      return {
        wasBlankSubmission: true,
        pointsEarned: 0,
        evaluation: []
      }
    }
    
    const evaluations = this.spec.rubric.map(ri => evaluateRubricItem(ri, submission));
    const points = evaluations.reduce((p, ev) => p + ev.pointsEarned, 0);

    return {
      wasBlankSubmission: false,
      evaluation: this.spec.rubric.map(ri => evaluateRubricItem(ri, submission)),
      pointsEarned: points,
    };
  }

  public pointsEarned(gr: StandardIFrameGradingResult) {
    return gr.pointsEarned;
  }

  public renderReport(aq: GradedQuestion<"iframe", StandardIFrameGradingResult>) {

    return "Reports are not implemented for this question/grader type yet.";
  }

  public annotateResponseElem(aq: GradedQuestion<"iframe", StandardIFrameGradingResult>, response_elem: JQuery) {
    // not yet implemented
  }

  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview(gqs: readonly GradedQuestion<"iframe">[]) {
    return "Overviews are not implemented for this question/grader type yet.";
  }
}


function evaluateRubricItem(item: StandardIFrameGraderRubricItem, submission: {}) : FITBDropRubricItemEvaluation{

  return {
    pointsEarned: submission[item.property] === item.value ? item.points : 0,
    explanation: item.description
  }

}
