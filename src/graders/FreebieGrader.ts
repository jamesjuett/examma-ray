import { AssignedQuestion, Question } from "../exams";
import { ResponseKind, BLANK_SUBMISSION } from "../response/common";
import { SubmissionType } from "../response/responses";
import { QuestionSkin } from "../skins";
import { Grader } from "./common";



export class FreebieGrader<QT extends ResponseKind> implements Grader<QT> {

  /**
   *
   * @param pointValue How many points are awarded for answering the question.
   */
  public constructor(
    public readonly pointValue: number,
    public readonly questionType: QT,
    public readonly blankAllowed = false
  ) { }

  public grade(aq: AssignedQuestion<QT>) {
    let submission = aq.submission;
    return this.blankAllowed || submission !== BLANK_SUBMISSION ? this.pointValue : 0;
  }

  public renderReport(aq: AssignedQuestion<QT>) {
    let submission = aq.submission;
    if (!this.blankAllowed && submission === BLANK_SUBMISSION) {
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
