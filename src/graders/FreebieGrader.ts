import { validate } from "uuid";
import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { ResponseKind } from "../response/common";
import { validate_submission } from "../response/handlers";
import { QuestionGrader, ImmutableGradingResult } from "./QuestionGrader";

export type FreebieGradingResult = ImmutableGradingResult;

export type FreebieGraderSpecification = {
  readonly grader_kind: "freebie",

  /**
   * Whether or not blank submissions earn points. If this option is
   * not specified, it is interpreted as false.
   */
  readonly allow_blanks?: boolean

  /**
   * An optional message that will be shown to students.
   */
  readonly message?: string
};

/**
 * A grader that gives points to all submissions. Whether or not blank
 * submissions earn points can be configured.
 * @template QT May be any response type
 */
export class FreebieGrader implements QuestionGrader<ResponseKind> {
  
  public readonly spec: FreebieGraderSpecification;

  public readonly t_response_kinds!: ResponseKind;

  public constructor(spec: FreebieGraderSpecification) {
    this.spec = spec;
  }
  
  public scale(new_points_possible: number) {
    return this;
  }


  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return true;
  };

  public prepare() { }

  public grade(aq: AssignedQuestion) : FreebieGradingResult {
    return {
      wasBlankSubmission: aq.submission.validity === "blank",
      pointsEarned: (this.spec.allow_blanks || aq.submission.validity) !== "blank" ? aq.question.pointsPossible : 0
    };
  }

  public pointsEarned(gr: FreebieGradingResult) {
    return gr.pointsEarned;
  }

  public renderReport(aq: GradedQuestion<ResponseKind, FreebieGradingResult>) {
    
    const message = !this.spec.allow_blanks && aq.gradingResult.wasBlankSubmission
      ? `You did not select an answer for this question.`
      : `You earned ${aq.question.pointsPossible}/${aq.question.pointsPossible} points for answering this question.`;

    return `
      <p class="examma-ray-grading-annotation">
        ${message}
      </p>
      ${this.spec.message ? `<p class="examma-ray-grading-annotation">${this.spec.message}</p>` : ""}
      <p>${aq.question.renderResponseSolution(aq.uuid, aq.submission, aq.skin)}</p>
    `;
  }

  public annotateResponseElem(gq: GradedQuestion<ResponseKind, FreebieGradingResult>, response_elem: JQuery) {
    // not yet implemented
  }

  public renderStats(aqs: readonly AssignedQuestion[]) {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview(gqs: readonly GradedQuestion<"multiple_choice">[]) {
    let submissions = gqs.map(gq => gq.submission);
    if (this.spec.allow_blanks) {
      return `Assigned full points to all ${submissions.length} submissions.`;
    }
    else {
      let numBlank = submissions.filter(sub => sub.validity === "blank").length;
      let numNonBlank = submissions.length - numBlank;
      return `Assigned full points to ${numNonBlank} submissions.<br />Assigned 0 points to ${numBlank} blank submissions.`;
    }
  }
}
