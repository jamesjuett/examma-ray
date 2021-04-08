import { mk2html } from "../render";
import { AssignedQuestion, Question } from "../exams";
import { BLANK_SUBMISSION } from "../response/common";
import { MCSubmission } from "../response/multiple_choice";
import { renderPointAdjustmentBadge } from "./SimpleMCGrader";
import { Grader } from "./common";
import { QuestionSkin } from "../skins";



export class SummationMCGrader implements Grader<"multiple_choice"> {

  public readonly questionType = "multiple_choice";

  /**
   *
   * @param pointValues For each answer option, points to add (or subtract if negative) if that option was selected
   */
  public constructor(
    public readonly pointValues: readonly number[]
  ) { }

  public grade(aq: AssignedQuestion<"multiple_choice">) {
    let question = aq.question;
    let submission = aq.submission;
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return 0;
    }

    return Math.max(0, Math.min(question.pointsPossible, submission.reduce((prev, selection) => prev + this.pointValues[selection], 0)));
  }

  public renderReport(aq: AssignedQuestion<"multiple_choice">) {
    let question = aq.question;
    let skin = aq.skin;
    let orig_submission = aq.submission;
    let submission: readonly number[];
    if (orig_submission === BLANK_SUBMISSION || orig_submission.length === 0) {
      return "You did not select an answer for this question.";
    }
    else {
      submission = orig_submission;
    }

    return `
      <form class="examma-ray-summation-grader">
      ${question.response.choices.map((item, i) => {
      let chosen = submission.indexOf(i) !== -1;
      return `
          <div><span ${!chosen ? 'style="visibility: hidden"' : ""}>${renderPointAdjustmentBadge(this.pointValues[i])}</span><input type="checkbox" ${chosen ? "checked" : ""} style="pointer-events: none;" />
          <label class="examma-ray-mc-option">${mk2html(item, skin)}</label></div>`;
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
