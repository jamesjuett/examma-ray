import { mk2html } from "../core/render";
import { renderNumBadge } from "../core/ui_components";
import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { BLANK_SUBMISSION, INVALID_SUBMISSION, ResponseKind } from "../response/common";
import { MCSubmission } from "../response/mc";
import { assert } from "../core/util";
import { QuestionVerifier, ImmutableGradingResult } from "./QuestionVerifier";
import { CHECK_ICON, RED_X_ICON } from "../core/icons";
import { GraderSpecificationFor } from "../graders/QuestionGrader";

export type VerifierGraderSelectionStrategy<RK extends ResponseKind> = {
  strategy: "default"
} | {
  strategy: "custom",
  grader: GraderSpecificationFor<RK>
}


export type GraderVerifierSpecification<RK extends ResponseKind> = {
  readonly verifier_kind: "grader",
  readonly criteria: "full_credit",
};

export class GraderVerifier<RK extends ResponseKind> implements QuestionVerifier<RK> {

  public readonly spec: GraderVerifierSpecification<RK>;

  public readonly t_response_kinds!: RK;

  public constructor(spec: GraderVerifierSpecification<RK>) {
    this.spec = spec;
  }

  public isVerifier<T extends ResponseKind>(responseKind: T): this is GraderVerifier<T> {
    return responseKind === "multiple_choice";
  };

  public prepare() { }

  public grade(aq: AssignedQuestion<"multiple_choice">) : SimpleMCGradingResult {
    let question = aq.question;
    let submission = aq.submission;

    if (submission === INVALID_SUBMISSION) {
      return {
        wasBlankSubmission: false,
        wasInvalidSubmission: true,
        pointsEarned: 0,
        indexChosen: -1,
        indexCorrect: this.spec.correct_index
      };
    }

    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return {
        wasBlankSubmission: true,
        pointsEarned: 0,
        indexChosen: -1,
        indexCorrect: this.spec.correct_index
      };
    }

    assert(submission.length <= 1, `${question}\nGraderVerifier cannot be used for questions where more than one selection is allowed.`);

    return {
      wasBlankSubmission: false,
      pointsEarned: submission[0] === this.spec.correct_index ? question.pointsPossible : 0,
      indexChosen: submission[0],
      indexCorrect: this.spec.correct_index
    };
  }

  public pointsEarned(gr: SimpleMCGradingResult) {
    return gr.pointsEarned;
  }

  public renderReport(aq: GradedQuestion<"multiple_choice", SimpleMCGradingResult>) {

    let question = aq.question;
    let gr = aq.gradingResult;

    let chosen: number = gr.indexChosen;

    let report = `
      <form>
      ${question.response.choices.map((item, i) => `
        <div class="form-check" ${question.response.spacing ? `style="margin-bottom: ${question.response.spacing};"` : ""}><input class="form-check-input" type="radio" ${i === chosen ? "checked" : "disabled"}/>
        <label class="form-check-label examma-ray-mc-option ${i === this.spec.correct_index ? "examma-ray-correct" : "examma-ray-incorrect"}">${mk2html(item, aq.skin)}</label></div>`).join("")}
      </form>
      
      `;
    if (chosen !== -1) {
      report += `<span class="examma-ray-grading-annotation">${chosen === this.spec.correct_index ? `You selected item ${chosen + 1}, which was correct.` : `You selected item ${chosen + 1}, but the correct answer was item ${this.spec.correct_index + 1}.`}</span>`;
    }
    else {
      report += `<span class="examma-ray-grading-annotation">You did not select an answer for this question.`;
    }
    return report;
  }

  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview(gqs: readonly GradedQuestion<"multiple_choice">[]) {
    let question = gqs[0].question;
    let submissions = gqs.map(gq => gq.submission);
    let f = function (sub: MCSubmission): sub is number[] {
      return sub !== BLANK_SUBMISSION && sub !== INVALID_SUBMISSION && sub.length > 0;
    };
    let normalSubmissions = submissions.filter(f);
    let numBlank = submissions.filter(s => s === BLANK_SUBMISSION).length;
    let numInvalid = submissions.filter(s => s === INVALID_SUBMISSION).length;

    assert(normalSubmissions.every(sub => sub.length === 1), "GraderVerifier cannot be used for questions where more than one selection is allowed.");

    let selectionChoices = normalSubmissions.map(sub => sub[0]);

    let maxSelection = Math.max(...selectionChoices);
    let hist: number[] = [];
    for (let i = 0; i <= maxSelection; ++i) { // Note: <= is correct here!
      hist.push(0);
    }
    selectionChoices.forEach(c => ++hist[c]);

    let numCorrect = selectionChoices.filter(c => c === this.spec.correct_index).length;
    let percentCorrect = numCorrect / submissions.length;

    return `
      ${hist.map((count, i) => `<div class="examma-ray-mc-option">${renderNumBadge(count)} ${i === this.spec.correct_index ? CHECK_ICON : RED_X_ICON} ${mk2html(question.response.choices[i])}</div>`).join("")}
      <div class="examma-ray-mc-option">${renderNumBadge(numBlank)} ${RED_X_ICON} BLANK</div>
      ${numInvalid === 0 ? "" : `<div class="examma-ray-mc-option">${renderNumBadge(numInvalid)} ${RED_X_ICON} INVALID</div>`}
    `;
  }
}
