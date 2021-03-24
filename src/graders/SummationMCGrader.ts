import { mk2html } from "../render";
import { Question } from "../exams";
import { BLANK_SUBMISSION } from "../response/common";
import { MCSubmission } from "../response/multiple_choice";
import { renderPointAdjustmentBadge } from "./SimpleMCGrader";
import { Grader } from "./common";



export class SummationMCGrader implements Grader<"multiple_choice"> {

  public readonly questionType = "multiple_choice";

  /**
   *
   * @param pointValues For each answer option, points to add (or subtract if negative) if that option was selected
   */
  public constructor(
    public readonly pointValues: readonly number[]
  ) { }

  public grade(question: Question<"multiple_choice">, submission: MCSubmission) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return 0;
    }

    return Math.max(0, Math.min(question.pointsPossible, submission.reduce((prev, selection) => prev + this.pointValues[selection], 0)));
  }

  public renderReport(question: Question<"multiple_choice">, submission: MCSubmission) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return "You did not select an answer for this question.";
    }

    let score = this.grade(question, submission);

    return `
      <form class="examma-ray-summation-grader">
      ${question.response.choices.map((item, i) => {
      let chosen = submission.indexOf(i) !== -1;
      return `
          <div><span ${!chosen ? 'style="visibility: hidden"' : ""}>${renderPointAdjustmentBadge(this.pointValues[i])}</span><input type="checkbox" ${chosen ? "checked" : ""} style="pointer-events: none;" />
          <label class="examma-ray-mc-option">${mk2html(item)}</label></div>`;
    }
    ).join("")}
      </form>
    `;
  }

  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview() {
    return "Overview is not implemented for this question/grader type yet.";
  }
}
