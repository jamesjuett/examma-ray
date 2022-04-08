import { mk2html } from "../core/render";
import { AssignedQuestion, GradedQuestion, wereGradedBy } from "../core/assigned_exams";
import { BLANK_SUBMISSION, INVALID_SUBMISSION, ResponseKind } from "../response/common";
import { QuestionGrader, ImmutableGradingResult } from "./QuestionGrader";
import { assert, assertFalse } from "../core/util";
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

export type SummationMCGraderSpecification = {
  readonly grader_kind: "summation_multiple_choice",
  
  /**
   * For each answer option, define whether the grader is looking
   * for the option to be selected or not (true/false) and the number of points to add 
   * (or subtract if negative) in that case
   */
  readonly rubric: readonly {selected: boolean, points: number, ignore_selection?: boolean}[];
}

export class SummationMCGrader implements QuestionGrader<"multiple_choice"> {
  
  public readonly spec: SummationMCGraderSpecification;

  public readonly t_response_kinds!: "multiple_choice";

  public constructor(spec: SummationMCGraderSpecification) {
    this.spec = spec;
  }

  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return responseKind === "multiple_choice";
  };

  public prepare() { }

  public grade(aq: AssignedQuestion<"multiple_choice">) : SummationMCGradingResult {
    let question = aq.question;
    assert(this.spec.rubric.length === question.response.choices.length, "Summation MC grader submissions must have the same number of response choices as the grader configuration.")
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
    //   pointsEarned: this.spec.pointValues[selection]
    // }));
    let selections = this.spec.rubric.map((pv,i) => {
      let isSelected = submission.indexOf(i) !== -1;
      return {
        selected: isSelected,
        pointsForThisItem: isSelected === pv.selected || pv.ignore_selection ? pv.points : 0
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
        const ri = this.spec.rubric[i];
        const res = selections[i];

        const match = res.selected === ri.selected || ri.ignore_selection;

        // If the # of points is positive, a match is good.
        // If the # of points is negative

        return `
          <div class="form-check" style="padding-left: 5rem;${question.response.spacing ? ` margin-bottom: ${question.response.spacing};` : ""}">
            <span>${renderPointAdjustmentBadge(res.selected, ri)}</span>
            <input class="form-check-input" type="checkbox" ${selections[i].selected ? "checked" : ""} style="pointer-events: none;" />
            <label class="form-check-label examma-ray-mc-option">${mk2html(item, skin)}</label>
          </div>
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

    let hist: number[] = this.spec.rubric.map((pv, i) => results.filter(r => !r.wasInvalidSubmission && r.selections[i].selected).length);
    let numInvalid = results.filter(r => r.wasInvalidSubmission).length;

    return `
      ${hist.map((count, i) =>
      `<div class="examma-ray-mc-option">
        ${renderPercentChosenProgressBar(count, gqs.length)} ${renderPointAdjustmentBadge(this.spec.rubric[i].selected, this.spec.rubric[i])} (if ${this.spec.rubric[i].selected ? "" : "not "}selected): ${mk2html(question.response.choices[i])}
      </div>`).join("")}
      ${numInvalid === 0 ? "" : `<div>${renderNumBadge(numInvalid)} ${RED_X_ICON} invalid submissions</div>`}
    `;
  }
}

function renderPointAdjustmentBadge(selected: boolean, rubric_item: { selected: boolean, points: number, ignore_selected?: boolean }) {

  if (rubric_item.ignore_selected) {
    return `<span class="badge badge-success examma-ray-point-adjustment-badge">+${rubric_item.points}</span>`;
  }

  const match = selected === rubric_item.selected;
  return match && rubric_item.points > 0 ? `<span class="badge badge-success examma-ray-point-adjustment-badge">+${rubric_item.points}</span>` : // matched and earned points
         match && rubric_item.points < 0 ? `<span class="badge badge-danger examma-ray-point-adjustment-badge">${rubric_item.points}</span>` : // matched a penalty and lost points
         !match && rubric_item.points > 0 ? `<span class="badge badge-danger examma-ray-point-adjustment-badge">0</span>` : // missed out on earning points
         !match && rubric_item.points < 0 ? `<span class="badge badge-success examma-ray-point-adjustment-badge">ok</span>` : // dodged a penalty
         rubric_item.points === 0 ? `<span class="badge badge-secondary examma-ray-point-adjustment-badge">n/a</span>` : // matched a 0 point item
         assertFalse();
}
