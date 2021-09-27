import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { ResponseKind, BLANK_SUBMISSION } from "../response/common";
import { QuestionGrader, ImmutableGradingResult } from "./QuestionGrader";

export type FreebieGradingResult = ImmutableGradingResult;

/**
 * A grader that gives points to all submissions. Whether or not blank
 * submissions earn points can be configured.
 * @template QT May be any response type
 */
export class FreebieGrader implements QuestionGrader<ResponseKind> {

  /**
   * @param pointValue How many points are awarded to submissions.
   * @param blankAllowed Whether or not blank submissions earn points.
   */
  public constructor(
    public readonly pointValue: number,
    public readonly blankAllowed = false
  ) { }

  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return true;
  };

  public prepare() { }

  public grade(aq: AssignedQuestion) : FreebieGradingResult {
    return {
      wasBlankSubmission: aq.submission === BLANK_SUBMISSION,
      pointsEarned: this.blankAllowed || aq.submission !== BLANK_SUBMISSION ? this.pointValue : 0
    };
  }

  public pointsEarned(gr: FreebieGradingResult) {
    return gr.pointsEarned;
  }

  public renderReport(aq: GradedQuestion<ResponseKind, FreebieGradingResult>) {
    if (!this.blankAllowed && aq.gradingResult.wasBlankSubmission) {
      return "You did not select an answer for this question.";
    }
    else {
      return `<span class="examma-ray-grading-annotation">You earned ${this.pointValue}/${aq.question.pointsPossible} points for answering this question.</span>`;
    }
  }

  public renderStats(aqs: readonly AssignedQuestion[]) {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview(gqs: readonly GradedQuestion<"multiple_choice">[]) {
    let submissions = gqs.map(gq => gq.submission);
    if (this.blankAllowed) {
      return `Assigned ${this.pointValue} freebie points to all ${submissions.length} submissions.`;
    }
    else {
      let numBlank = submissions.filter(sub => sub === BLANK_SUBMISSION).length;
      let numNonBlank = submissions.length - numBlank;
      return `Assigned ${this.pointValue} freebie points to ${numNonBlank} submissions.<br />Assigned 0 points to ${numBlank} blank submissions.`;
    }
  }
}
