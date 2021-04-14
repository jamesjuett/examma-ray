import { mk2html } from "../render";
import { AssignedQuestion, GradedQuestion, Question } from "../exams";
import { BLANK_SUBMISSION } from "../response/common";
import { MCSubmission } from "../response/multiple_choice";
import { renderPointAdjustmentBadge } from "./SimpleMCGrader";
import { Grader, GradingResult, ImmutableGradingResult } from "./common";
import { QuestionSkin } from "../skins";
import { assert } from "../util";


export type SummationMCGradingResult = ImmutableGradingResult & {
  readonly selections: readonly {
    optionIndex: number,
    pointsEarned: number
  }[]
};

export class SummationMCGrader implements Grader<"multiple_choice"> {

  public readonly questionType = "multiple_choice";

  /**
   *
   * @param pointValues For each answer option, points to add (or subtract if negative) if that option was selected
   */
  public constructor(
    public readonly pointValues: readonly number[]
  ) { }

  public grade(aq: AssignedQuestion<"multiple_choice">) : SummationMCGradingResult {
    let question = aq.question;
    let orig_submission = aq.submission;
    if (orig_submission === BLANK_SUBMISSION || orig_submission.length === 0) {
      return {
        wasBlankSubmission: true,
        pointsEarned: 0,
        selections: []
      }
    }

    let submission = orig_submission;
    let selections = submission.map(selection => ({
      optionIndex: selection,
      pointsEarned: this.pointValues[selection]
    }));

    return {
      wasBlankSubmission: false,
      pointsEarned: Math.max(0, Math.min(question.pointsPossible, selections.reduce((p, r) => p + r.pointsEarned, 0))),
      selections: selections
    }
  }

  public pointsEarned(aq: GradedQuestion<"multiple_choice", SummationMCGradingResult>) {
    return aq.gradingResult.pointsEarned;
  }

  public renderReport(aq: GradedQuestion<"multiple_choice", SummationMCGradingResult>) {
    let question = aq.question;
    let skin = aq.skin;
    let orig_submission = aq.submission;
    let gr = aq.gradingResult;
    if (gr.wasBlankSubmission) {
      return "You did not select an answer for this question.";
    }

    assert(orig_submission !== BLANK_SUBMISSION);
    
    let selections = gr.selections;
    let choices = question.response.choices;
    assert(selections.length === choices.length);

    return `
      <form class="examma-ray-summation-grader">
      ${question.response.choices.map((item, i) => {
        let chosen = selections.map(s => s.optionIndex).indexOf(i) !== -1;
        return `
          <div><span ${!chosen ? 'style="visibility: hidden"' : ""}>${renderPointAdjustmentBadge(this.pointValues[i])}</span><input type="checkbox" ${chosen ? "checked" : ""} style="pointer-events: none;" />
          <label class="examma-ray-mc-option">${mk2html(item, skin)}</label></div>
        `;
      }).join("")}
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
