import { mk2html } from "../render";
import { renderNumBadge } from "../common";
import { Question } from "../exams";
import { BLANK_SUBMISSION } from "../response/common";
import { MCSubmission } from "../response/multiple_choice";
import { SubmissionType } from "../response/responses";
import { assert } from "../util";
import { Grader } from "./common";
import { CHECK_ICON, RED_X_ICON } from "../icons";



export class SimpleMCGrader implements Grader<"multiple_choice"> {

  public readonly questionType = "multiple_choice";

  /**
   *
   * @param correctIndex 0-based index of correct answer.
   */
  public constructor(
    public readonly correctIndex: number
  ) { }

  public grade(question: Question<"multiple_choice">, submission: MCSubmission) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return 0;
    }

    assert(submission.length <= 1, `${question}\nSimpleMCGrader cannot be used for questions where more than one selection is allowed.`);

    return submission[0] === this.correctIndex ? question.pointsPossible : 0;
  }

  public renderReport(question: Question<"multiple_choice">, submission: MCSubmission) {
    // if (submission === BLANK_SUBMISSION || submission.length === 0) {
    //   return "You did not select an answer for this question.";
    // }
    assert(submission === BLANK_SUBMISSION || submission.length <= 1, "SimpleMCGrader cannot be used for questions where more than one selection is allowed.");

    let score = this.grade(question, submission);
    let chosen: number = submission === BLANK_SUBMISSION || submission.length === 0 ? -1 : submission[0];

    let report = `
      <form>
      ${question.response.choices.map((item, i) => `
        <div><input type="radio" ${i === chosen ? "checked" : "disabled"}/>
        <label class="examma-ray-mc-option ${i === this.correctIndex ? "examma-ray-correct" : "examma-ray-incorrect"}">${mk2html(item)}</label></div>`).join("")}
      </form>
      
      `;
    if (chosen !== -1) {
      report += `<span class="examma-ray-grading-annotation">${chosen === this.correctIndex ? `You selected item ${chosen + 1}, which was correct.` : `You selected item ${chosen + 1}, but the correct answer was item ${this.correctIndex + 1}.`}</span>`;
    }
    else {
      report += `<span class="examma-ray-grading-annotation">You did not select an answer for this question.`;
    }
    return report;
  }

  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview(question: Question<"multiple_choice">, submissions: readonly SubmissionType<"multiple_choice">[]) {
    let f = function (sub: MCSubmission): sub is number[] {
      return sub !== BLANK_SUBMISSION && sub.length > 0;
    };
    let nonBlankSubmissions = submissions.filter(f);
    let numBlank = submissions.length - nonBlankSubmissions.length;

    assert(nonBlankSubmissions.every(sub => sub.length === 1), "SimpleMCGrader cannot be used for questions where more than one selection is allowed.");

    let selectionChoices = nonBlankSubmissions.map(sub => sub[0]);

    let maxSelection = Math.max(...selectionChoices);
    let hist: number[] = [];
    for (let i = 0; i <= maxSelection; ++i) { // Note: <= is correct here!
      hist.push(0);
    }
    selectionChoices.forEach(c => ++hist[c]);

    let numCorrect = selectionChoices.filter(c => c === this.correctIndex).length;
    let percentCorrect = numCorrect / submissions.length;

    return `
      ${hist.map((count, i) => `<div class="examma-ray-mc-option">${renderNumBadge(count)} ${i === this.correctIndex ? CHECK_ICON : RED_X_ICON} ${mk2html(question.response.choices[i])}</div>`).join("")}
      <div class="examma-ray-mc-option">${renderNumBadge(numBlank)} ${RED_X_ICON} BLANK</div>
    `;
  }
}
export function renderPointAdjustmentBadge(pointAdjustment: number) {
  return `<span class="badge ${pointAdjustment === 0 ? "badge-secondary" :
      pointAdjustment < 0 ? "badge-danger" :
        "badge-success"} examma-ray-point-adjustment-badge">${pointAdjustment > 0 ? "+" + pointAdjustment : pointAdjustment === 0 ? "n/a" : pointAdjustment}</span>`;
}