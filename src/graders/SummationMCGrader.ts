import { mk2html } from "../core/render";
import { AssignedQuestion, GradedQuestion, wereGradedBy } from "../core/assigned_exams";
import { BLANK_SUBMISSION, INVALID_SUBMISSION, ResponseKind } from "../response/common";
import { QuestionGrader, ImmutableGradingResult } from "./QuestionGrader";
import { assert } from "../core/util";
import { renderNumBadge, renderPercentChosenProgressBar } from "../core/ui_components";
import { RED_X_ICON } from "../core/icons";


export type SummationMCGradingResult = ImmutableGradingResult & {
  readonly selections: readonly {
    selected: boolean,
    pointsForThisItem: number
  }[]
} | ImmutableGradingResult & {
  readonly wasInvalidSubmission: true,
};

export class SummationMCGrader implements QuestionGrader<"multiple_choice"> {

  public readonly questionType = "multiple_choice";

  /**
   *
   * @param pointValues For each answer option, define whether the grader is looking
   * for the option to be selected or not (true/false) and the number of points to add 
   * (or subtract if negative) in that case
   */
  public constructor(
    public readonly pointValues: readonly {selected: boolean, points: number}[]
  ) { }

  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return responseKind === "multiple_choice";
  };

  public prepare() { }

  public grade(aq: AssignedQuestion<"multiple_choice">) : SummationMCGradingResult {
    let question = aq.question;
    assert(this.pointValues.length === question.response.choices.length, "Summation MC grader submissions must have the same number of response choices as the grader configuration.")
    let orig_submission = aq.submission;

    if (orig_submission === INVALID_SUBMISSION) {
      return {
        wasBlankSubmission: false,
        wasInvalidSubmission: true,
        pointsEarned: 0
      };
    }

    if (orig_submission === BLANK_SUBMISSION) {
      orig_submission = [];
    }
    
    
    let submission = orig_submission;
    // let selections = submission.map(selection => ({
    //   optionIndex: selection,
    //   pointsEarned: this.pointValues[selection]
    // }));
    let selections = this.pointValues.map((pv,i) => {
      let isSelected = submission.indexOf(i) !== -1;
      return {
        selected: isSelected,
        pointsForThisItem: isSelected === pv.selected ? pv.points : 0
      };
    });

    return {
      wasBlankSubmission: submission.length === 0,
      pointsEarned: Math.max(0, Math.min(question.pointsPossible, selections.reduce((p, r) => p + r.pointsForThisItem, 0))),
      selections: selections
    };
  }

  public pointsEarned(gr: SummationMCGradingResult) {
    return gr.pointsEarned;
  }

  public renderReport(gq: GradedQuestion<"multiple_choice", SummationMCGradingResult>) {
    let question = gq.question;
    let skin = gq.skin;
    let gr = gq.gradingResult;
    
    if (gr.wasInvalidSubmission) {
      return "Your submission for this question was invalid.";
    }

    const selections = gr.selections;
    let choices = question.response.choices;
    assert(selections.length === choices.length);

    return `
      <form class="examma-ray-summation-grader">
      ${choices.map((item, i) => {
        return `
          <div><span>${renderPointAdjustmentBadge(selections[i].pointsForThisItem)}</span><input type="checkbox" ${selections[i].selected ? "checked" : ""} style="pointer-events: none;" />
          <label class="examma-ray-mc-option">${mk2html(item, skin)}</label></div>
        `;
      }).join("")}
      </form>
    `;
  }

  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  
  public renderOverview(gqs: readonly GradedQuestion<"multiple_choice">[]) : string {
    let question = gqs[0].question;
    assert(wereGradedBy(gqs, this));
    let results = gqs.map(gq => gq.gradingResult);

    let hist: number[] = this.pointValues.map((pv, i) => results.filter(r => !r.wasInvalidSubmission && r.selections[i].selected).length);
    let numInvalid = results.filter(r => r.wasInvalidSubmission).length;

    return `
      ${hist.map((count, i) =>
      `<div class="examma-ray-mc-option">
        ${renderPercentChosenProgressBar(count, gqs.length)} ${renderPointAdjustmentBadge(this.pointValues[i].points)} (if ${this.pointValues[i].selected ? "" : "not "}selected): ${mk2html(question.response.choices[i])}
      </div>`).join("")}
      ${numInvalid === 0 ? "" : `<div>${renderNumBadge(numInvalid)} ${RED_X_ICON} invalid submissions</div>`}
    `;
  }
}

function renderPointAdjustmentBadge(pointAdjustment: number) {
  return `<span class="badge ${pointAdjustment === 0 ? "badge-secondary" :
      pointAdjustment < 0 ? "badge-danger" :
        "badge-success"} examma-ray-point-adjustment-badge">${pointAdjustment > 0 ? "+" + pointAdjustment : pointAdjustment === 0 ? "n/a" : pointAdjustment}</span>`;
}
