import { AssignedQuestion, GradedQuestion, Question } from "../exams";
import { ResponseKind, BLANK_SUBMISSION } from "../response/common";
import { SubmissionType } from "../response/responses";
import { QuestionSkin } from "../skins";
import { Grader, GradingResult, ImmutableGradingResult } from "./common";

export type FreebieGradingResult = ImmutableGradingResult;

/**
 * A grader that gives points to all submissions. Whether or not blank
 * submissions earn points can be configured.
 * @template QT May be any response type
 */
export class FreebieGrader<QT extends ResponseKind> implements Grader<ResponseKind> {

  /**
   * @param pointValue How many points are awarded to submissions.
   * @param questionType The type of response this grader will be used with.
   * @param blankAllowed Whether or not blank submissions earn points.
   */
  public constructor(
    public readonly pointValue: number,
    public readonly questionType: QT,
    public readonly blankAllowed = false
  ) { }

  public grade(aq: AssignedQuestion<QT>) : FreebieGradingResult {
    return {
      wasBlankSubmission: aq.submission === BLANK_SUBMISSION,
      pointsEarned: this.blankAllowed || aq.submission !== BLANK_SUBMISSION ? this.pointValue : 0
    };
  }

  public pointsEarned(aq: GradedQuestion<QT, FreebieGradingResult>) {
    return aq.gradingResult.pointsEarned;
  }

  public renderReport(aq: GradedQuestion<QT, FreebieGradingResult>) {
    if (!this.blankAllowed && aq.gradingResult.wasBlankSubmission) {
      return "You did not select an answer for this question.";
    }
    else {
      return `<span class="examma-ray-grading-annotation">You earned ${this.pointValue}/${aq.question.pointsPossible} points for answering this question.</span>`;
    }
  }

  public renderStats(aqs: readonly AssignedQuestion<QT>[]) {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview(aqs: readonly AssignedQuestion<QT>[]) {
    let submissions = aqs.map(aq => aq.submission);
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
