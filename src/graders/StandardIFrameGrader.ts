import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { ResponseKind } from "../response/common";
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
  readonly points_possible: number,
};

export class StandardIFrameGrader implements QuestionGrader<"iframe", StandardIFrameGradingResult> {

  public readonly spec: StandardIFrameGraderSpecification;

  public readonly t_response_kinds!: "iframe";

  public constructor(spec: StandardIFrameGraderSpecification) {
    this.spec = spec;
  }
  
  public scale(new_points_possible: number) {
    const scaling_factor = new_points_possible / this.spec.points_possible;
    return new StandardIFrameGrader({
      ...this.spec,
      rubric: this.spec.rubric.map(ri => ({
        ...ri,
        points: ri.points * scaling_factor
      }))
    });
  }

  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return responseKind === "iframe";
  };

  public prepare() { }

  public grade(aq: AssignedQuestion<"iframe">) : StandardIFrameGradingResult {
    const submission = aq.submission;
    // if (submission.validity === "invalid") {
    //   return {
    //     wasBlankSubmission: false,
    //     wasInvalidSubmission: true,
    //     pointsEarned: 0,
    //     evaluation: []
    //   }
    // }
    if (submission.validity === "blank") {
      return {
        wasBlankSubmission: true,
        pointsEarned: 0,
        evaluation: []
      }
    }
    
    const evaluations = this.spec.rubric.map(ri => evaluateRubricItem(ri, submission.encoding));
    const points = evaluations.reduce((p, ev) => p + ev.pointsEarned, 0);

    return {
      wasBlankSubmission: false,
      evaluation: this.spec.rubric.map(ri => evaluateRubricItem(ri, submission.encoding)),
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


function evaluateRubricItem(item: StandardIFrameGraderRubricItem, submission: {[index: string]: any}) : FITBDropRubricItemEvaluation{

  return {
    pointsEarned: submission[item.property] === item.value ? item.points : 0,
    explanation: item.description
  }

}
