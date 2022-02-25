
import { QuestionGrader, AssignedQuestion } from "../core";
import { GradedQuestion } from "../core/assigned_exams";
import { mk2html, mk2html_unwrapped, applySkin } from "../core/render";
import { renderScoreBadge } from "../core/ui_components";
import { assertNever } from "../core/util";
import { GradingAssignmentSpecification } from "../grading_interface/common";
import { ResponseKind, BLANK_SUBMISSION } from "../response/common";
import { FITBDropSubmission, createFilledFITBDrop, mapSkinOverSubmission, DropSubmission } from "../response/fitb-drop";
import { GradingResult } from "./QuestionGrader";

const ICON_INFO = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
</svg>`;


type FITBDropGradingResult = GradingResult & ({
  wasBlankSubmission: false,
  evaluation: readonly FITBDropRubricItemEvaluation[]
} | {
  wasBlankSubmission: true
});

export type FITBDropRubricItemEvaluation = {
  pointsEarned: number;
  explanation: string;
}

export type FITBDropRubricItem = {
  title: string;
  points: number;
  description: string;
  evaluator: FITBDropEvaluatorSpecification
};

export type StandardFITBDropGraderSpecification = {
  readonly grader_kind: "standard_fitb_drop",
  readonly rubric: readonly FITBDropRubricItem[]
};

export class StandardFITBDropGrader implements QuestionGrader<"fitb_drop"> {

  public readonly spec: StandardFITBDropGraderSpecification;

  public readonly t_response_kinds!: "fitb_drop";

  public constructor(spec: StandardFITBDropGraderSpecification) {
    this.spec = spec;
  }
  
  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T, GradingResult> {
    return responseKind === "fitb_drop";
  }

  public prepare(exam_id: string, question_id: string, manual_grading: GradingAssignmentSpecification<"fitb_drop", GradingResult>[]): void {
    // do nothing
  }

  public grade(aq: AssignedQuestion<"fitb_drop">): FITBDropGradingResult {
    const submission = aq.submission;
    if (submission === BLANK_SUBMISSION) {
      return {
        wasBlankSubmission: true
      }
    }
    
    return {
      wasBlankSubmission: false,
      evaluation: this.spec.rubric.map(ri => evaluateRubricItem(ri, submission))
    };
  }

  public pointsEarned(gr: FITBDropGradingResult): number {
    return gr.wasBlankSubmission === true // the === true is apparently required by the type system for discriminating the union???
      ? 0
      : gr.evaluation.reduce((prev, cur) => prev + cur.pointsEarned, 0);
  }

  public renderReport(gq: GradedQuestion<"fitb_drop", FITBDropGradingResult>): string {
    let question = gq.question;
    let gr = gq.gradingResult;
    let skin = gq.skin;
    const submission = gq.submission;
    // let pts = this.pointsEarned(gr);
    if (submission === BLANK_SUBMISSION || gr.wasBlankSubmission === true) { // the === true is apparently required by the type system for discriminating the union???
      return "Your submission for this question was blank.";
    }

    let response = question.response;
    let group_id = response.group_id ?? question.question_id;

    let itemResults = gr.evaluation;
    let rubricItemsHtml = `<table style="position: sticky; top: 0;">${itemResults.map((itemResult, i) => {
      let rubricItem = this.spec.rubric[i];

      let explanation: string = mk2html(itemResult.explanation, skin);

      let elem_id = `question-${gq.uuid}-item-${i}`;

      return `
        <tr><td><div id="${elem_id}" class="card rubric-item-card">
          <div class="card-header">
            <a class="nav-link" style="font-weight: 500;" data-toggle="collapse" data-target="#${elem_id}-details" role="button" aria-expanded="false" aria-controls="${elem_id}-details">${renderScoreBadge(itemResult.pointsEarned, rubricItem.points)} ${ICON_INFO} ${mk2html_unwrapped(rubricItem.title, skin)}</a>
          </div>
          <div class="collapse" id="${elem_id}-details">
            <div class="card-body">
              ${mk2html(rubricItem.description, skin)}
              <p>
                ${explanation}
              </p>
            </div>
          </div>
        </div></td></tr>`;
    }).join("")}</table>`;


    let studentSubmission_html = createFilledFITBDrop(
      applySkin(response.content, skin),
      response.droppables,
      group_id,
      skin,
      submission
    );


    let sampleSolution_html = question.sampleSolution
      ? createFilledFITBDrop(
        applySkin(response.content, skin),
        response.droppables,
        group_id,
        skin,
        mapSkinOverSubmission(question.sampleSolution, skin)
      )
      : "";

    return `
      <table>
        <tr style="text-align: center;">
          <th>Rubric</th>
          <th>Your Submission</th>
          ${question.sampleSolution ? `<th>Sample Solution</th>` : ""}
        </tr>
        <tr>
          <td>
            ${rubricItemsHtml}
          </td>
          <td style="padding: 1em;">
            ${studentSubmission_html}
          </td>
          ${sampleSolution_html ? `
          <td style="padding: 1em;">
            ${sampleSolution_html}
          </td>` : ""}
        </tr>
      </table>
    `;
  }

  public renderStats(aqs: readonly AssignedQuestion<"fitb_drop">[]): string {
    return "";
  }

  public renderOverview(gqs: readonly GradedQuestion<"fitb_drop", FITBDropGradingResult>[]): string {
    return "";
  }
  
}

type SimpleDropEvaluatorSpecification = {
  readonly kind: "simple_drop_evaluator",
  readonly index: number,
  readonly evaluations: {
    [index: string]: FITBDropRubricItemEvaluation
  }
};

function simpleDropEvaluation(spec: SimpleDropEvaluatorSpecification, submission: FITBDropSubmission) {

  if (submission === BLANK_SUBMISSION) {
    return {pointsEarned: 0, explanation: "Your submission was blank."};
  }

  const box = submission[spec.index];
  
  if (typeof box === "string") {
    return {pointsEarned: 0, explanation: "Your submission appears to be invalid or corrupted."};
  }

  if (box.length === 0) {
    return {pointsEarned: 0, explanation: "Your submission for this box was blank."};
  }

  if (box.length > 1) {
    return {pointsEarned: 0, explanation: "Only 1 drop item was expected for this blank (i.e. multiple items constitute an incorrect answer)."};
  }

  return spec.evaluations[box[0].id] ?? FITBDropEvaluations.no_credit();
}


type TargetDropEvaluatorSpecification = {
  readonly kind: "target_drop_evaluator",
  readonly index: number,
  readonly evaluations: readonly [{
    readonly criteria: "at_least_one" | "exactly_one" | "require_all" | "require_none",
    readonly targets: readonly string[],
    readonly prohibited?: readonly string[]
    readonly evaluation: FITBDropRubricItemEvaluation
  }],
  readonly global_prohibited?: readonly string[]
};

export function targetDropEvaluation(spec: TargetDropEvaluatorSpecification, submission: FITBDropSubmission) {

  if (submission === BLANK_SUBMISSION) {
    return {pointsEarned: 0, explanation: "Your submission was blank."};
  }

  const box = submission[spec.index];
  
  if (typeof box === "string") {
    return {pointsEarned: 0, explanation: "Your submission appears to be invalid or corrupted."};
  }

  if (box.length === 0) {
    return {pointsEarned: 0, explanation: "Your submission for this box was blank."};
  }

  const inBox = (id:string) => !!box.find(item => item.id === id);

  if (spec.global_prohibited?.some(inBox)) {
    return FITBDropEvaluations.no_credit();
  }


  let match = spec.evaluations.find(evaluation => {
    
    if (evaluation.prohibited?.some(inBox)) {
      return false;
    }
    
    let num_matched_targets = evaluation.targets.filter(inBox).length;

    return evaluation.criteria === "at_least_one" ? num_matched_targets > 1
      : evaluation.criteria === "exactly_one" ? num_matched_targets === 1
      : evaluation.criteria === "require_all" ? num_matched_targets === evaluation.targets.length
      : evaluation.criteria === "require_none" ? true
      : assertNever(evaluation.criteria);
  });

  return match?.evaluation ?? FITBDropEvaluations.no_credit();
}

export type FITBDropEvaluatorSpecification =
  | SimpleDropEvaluatorSpecification
  | TargetDropEvaluatorSpecification;

function evaluateRubricItem(ri: FITBDropRubricItem, submission: FITBDropSubmission) {
  return ri.evaluator.kind === "simple_drop_evaluator" ? simpleDropEvaluation(ri.evaluator, submission) :
    ri.evaluator.kind === "target_drop_evaluator" ? targetDropEvaluation(ri.evaluator, submission) :
    assertNever(ri.evaluator);
}



export const FITBDropEvaluations = {
  full_credit: (points: number) => {
    return {
      pointsEarned: points,
      explanation: "Your submission earned **full credit** on this rubric item."
    };
  },
  partial_credit: (points: number) => {
    return {
      pointsEarned: points,
      explanation: "Your submission earned **partial credit** on this rubric item."
    };
  },
  no_credit: () => {
    return {
      pointsEarned: 0,
      explanation: "Your submission did not meet this rubric item."
    };
  }
};