
import { QuestionGrader, AssignedQuestion, OriginalExamRenderer } from "../core";
import { GradedQuestion } from "../core/assigned_exams";
import { mk2html, mk2html_unwrapped, applySkin } from "../core/render";
import { renderRandomColorBadge, renderPointsWorthBadge, renderScoreBadge } from "../core/ui_components";
import { asMutable, assert, assertNever } from "../core/util";
import { ResponseKind } from "../response/common";
import { FITBDropSubmission, createFilledFITBDrop, mapSkinOverSubmission, DropSubmission, DropSubmissionItem, renderFITBDropBank } from "../response/fitb-drop";
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

export type FITBDropRubricItemPolicy = "first_match" | "best_score";
export type FITBDropRubricItem = {
  title: string;
  points: number;
  description: string;
  policy: FITBDropRubricItemPolicy;
  evaluators: FITBDropEvaluatorSpecification[]
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

  public prepare(exam_id: string, question_id: string, spec: StandardFITBDropGraderSpecification) {
    asMutable(this).spec = spec;
  }

  public grade(aq: AssignedQuestion<"fitb_drop">): FITBDropGradingResult {
    // console.log("-----------------", aq.student.uniqname, aq.question.question_id)
    const submission = aq.submission;
    if (submission.validity === "blank") {
      return {
        wasBlankSubmission: true
      }
    }
    
    return {
      wasBlankSubmission: false,
      evaluation: this.spec.rubric.map(ri => evaluateRubricItem(ri, submission.encoding))
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
    if (submission.validity === "blank" || gr.wasBlankSubmission === true) { // the === true is apparently required by the type system for discriminating the union???
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
      submission.encoding
    );


    let sampleSolution_html = question.sampleSolution
      ? createFilledFITBDrop(
        applySkin(response.content, skin),
        response.droppables,
        group_id,
        skin,
        mapSkinOverSubmission(question.sampleSolution.encoding, skin)
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

  public annotateResponseElem(gq: GradedQuestion<"fitb_drop", FITBDropGradingResult>, response_elem: JQuery) {
    // not yet implemented
  }


  public renderStats(aqs: readonly AssignedQuestion<"fitb_drop">[]) {
    if (aqs.length === 0) {
      return "No submissions for this question.";
    }
    
    let question = aqs[0].question;
    let submission_encodings = aqs.map(aq => aq.submission)
      .filter(s => s.validity === "viable")
      .map(s => s.encoding);

    
    const renderer = new OriginalExamRenderer();
    
    const question_response_html = renderer.renderQuestion(aqs[0]);

    const drop_bank_html = renderFITBDropBank(aqs[0].question.response.droppables, question.response.group_id ?? question.question_id, aqs[0].skin);
    
    // let gradedBlankSubmissions = this.getGradedBlanksSubmissions(submission_encodings);

    // let allMatched = gradedBlankSubmissions.every(subs => subs.every(s => s.grading_result.matched));

    // let sampleSolution = question.sampleSolution;
    // let solutionFilled = createFilledFITB(question.response.content, sampleSolution);
    // const gqs = aqs.filter((aq: AssignedQuestion) : aq is GradedQuestion<"fill_in_the_blank", FITBRegexGradingResult> => aq.isGraded());


    // checkbox for each rubric item
    const rubric_itmes_html = this.spec.rubric.map((ri, i) => `
      <div class="form-check">
        <input class="form-check-input rubric-item-filter" data-rubric-index="${i}" type="checkbox" id="rubric-item-filter-${i}" checked>
        <label class="form-check-label" for="rubric-item-filter-${i}">
          ${renderRandomColorBadge(`${ri.points} points`, ri.title)} ${mk2html_unwrapped(ri.title)} (${ri.points} pts)
        </label>
      </div>
    `).join("\n");

    

    const submission_cards : string = `<div class="row row-cols-2">
      ${aqs.map(aq => {
        if (aq.isGraded()) {
          assert(aq.wasGradedBy(this));
          return `<div class="col mb-4"><div class="card">
          <div class="card-body">
            <h5 class="card-title">
              ${aq.student.uniqname}
            </h5>
            <div>
              ${aq.gradingResult.wasBlankSubmission ? "" : aq.gradingResult.evaluation.map(
                (item_result, i) => `<div class="rubric-result rubric-result-${i}" style="display: none; opacity: ${item_result.pointsEarned / this.spec.rubric[i].points}">${renderRandomColorBadge(`${item_result.pointsEarned} / ${this.spec.rubric[i].points}`, this.spec.rubric[i].title)} ${this.spec.rubric[i].title}</div>`
              ).join(" ")}
            </div>
            <div style="font-size: 7pt;">${aq.submission.validity === "blank" ? "Blank Submission" : aq.question.renderResponseSolution(aq.uuid, aq.submission, aq.skin)}</div>
          </div>
        </div></div>`
        }
        else {
          return `<div class="col mb-4"><div class="card">
          <div class="card-body">
            <h5 class="card-title">
              ${aq.student.uniqname}
              <span class="badge badge-secondary">Not Graded</span>
            </h5>
            <div>${aq.submission.validity === "blank" ? "Blank Submission" : aq.question.renderResponseSolution(aq.uuid, aq.submission, aq.skin)}</div>
          </div>
        </div></div>`;
        }
      }).join("\n")}
    </div>`;

    return `
      <!DOCTYPE html>
      <html>
      <meta charset="UTF-8">
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
      <script src="https://unpkg.com/@popperjs/core@2" crossorigin="anonymous"></script>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" integrity="sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N" crossorigin="anonymous">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct" crossorigin="anonymous"></script>
      <script src="../js/grader-page-fitb-drop.js"></script>
      <body>
        <table style="width: 100%;">
          <tr>
            <td>
              <div style="height: 100vh; overflow-y: scroll; resize: horizontal; border: 1px solid gray; padding: 0.5em;">
                <div>
                  ${question_response_html}
                </div>
                <div class="examma-ray-fitb-grader-drop-bank">
                  ${drop_bank_html}
                </div>
              </div>
            </td>
            <td>
              <div style="height: 100vh; overflow-y: scroll;">
                <div>
                  ${rubric_itmes_html}
                </div>
                <div class="container-fluid">
                  ${submission_cards}
                  <div class="checked-submissions-modal modal" tabindex="-1" role="dialog">
                    <div class="modal-dialog" role="document">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title">Selected Answers</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>
                        <div class="modal-body">
                          <pre><code class="checked-submissions-content"></code></pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  public renderOverview(gqs: readonly GradedQuestion<"fitb_drop", FITBDropGradingResult>[]): string {
    return "";
  }
  
}

type SimpleDropEvaluatorSpecification = {
  readonly kind: "simple_drop_evaluator",
  readonly index: number,
  readonly evaluations_by_droppable_id: {
    readonly [index: string]: FITBDropRubricItemEvaluation | undefined
  }
};

function simpleDropEvaluation(spec: SimpleDropEvaluatorSpecification, submission: FITBDropSubmission) {

  if (submission.length === 0) {
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
    return {pointsEarned: 0, explanation: "Only 1 drop item was expected for this box (i.e. multiple items constitute an incorrect answer)."};
  }

  return spec.evaluations_by_droppable_id[box[0].id];
}


type TargetDropEvaluatorSpecification = {
  readonly kind: "target_drop_evaluator",
  readonly index: number,
  readonly include_children?: boolean,
  readonly criteria: "at_least_one" | "exactly_one" | "require_all" | "require_none" | "require_blank",
  readonly targets: readonly string[],
  readonly prohibited?: readonly string[]
  readonly evaluation: FITBDropRubricItemEvaluation
};

function child_contains(container: (string | DropSubmission)[] | undefined, item_id: string) : boolean {
  if (container === undefined) {
    return false;
  }
  return container.some(item => {
    return typeof item !== "string" && item.some(x => x.id === item_id || child_contains(x.children, item_id));
  })
}

export function targetDropEvaluation(spec: TargetDropEvaluatorSpecification, submission: FITBDropSubmission) {
  
  const box = submission.length != 0 ? submission[spec.index] : [];
  
  if (typeof box === "string") {
    return {pointsEarned: 0, explanation: "Your submission appears to be invalid or corrupted."};
  }

  const inBox = (id:string) => !!box.find(item => item.id === id || spec.include_children && child_contains(item.children, id));

  if (spec.prohibited?.some(inBox)) {
    return {pointsEarned: 0, explanation: "Your submission for this box contains items that were not allowed in a correct submission."};
  }
  
  let num_matched_targets = spec.targets.filter(inBox).length;

  const matched = spec.criteria === "at_least_one" ? num_matched_targets >= 1
    : spec.criteria === "exactly_one" ? num_matched_targets === 1
    : spec.criteria === "require_all" ? num_matched_targets === spec.targets.length
    : spec.criteria === "require_none" ? true
    : spec.criteria === "require_blank" ? box.length === 0
    : assertNever(spec.criteria);

  return matched ? spec.evaluation : FITBDropEvaluations.no_credit();
}

export type DropMatchItem = {
  id: string,
  children?: readonly DropMatchStructure[]
  readonly ignore_ordering?: boolean,
  readonly ignore_nesting?: boolean,
};

export type DropMatchStructure = readonly DropMatchItem[];

type MatchingDropEvaluatorSpecification = {
  readonly kind: "matching_drop_evaluator",
  readonly structure: Omit<DropMatchItem, "id" | "children"> & Required<Pick<DropMatchItem, "children">>,
  readonly evaluation: FITBDropRubricItemEvaluation
};

function topLevelMatch(structure_item: Omit<DropMatchItem, "id">, sub_item: FITBDropSubmission) : boolean {
  return itemMatch({...structure_item, id: "placeholder"}, {children: sub_item, id: "placeholder"});
}

export function itemMatch(structure_item: DropMatchItem, sub_item: DropSubmissionItem) : boolean {
  // console.log("!!!Matching", JSON.stringify(structure_item), "against", JSON.stringify(sub_item));
  if (structure_item.id !== sub_item.id) { return false; } // not a match
  if (!structure_item.children) { return true; } // match, no children to check

  // Recursively check children
  return structure_item.children.every(
    (child, i) => matchStructure(child, sub_item.children?.[i], structure_item.ignore_ordering, structure_item.ignore_nesting)
  );
}

export function itemMatchAnyChild(structure_item: DropMatchItem, sub_item: DropSubmissionItem) : boolean {
  // console.log("!!!Matching any child of", JSON.stringify(sub_item), "against", JSON.stringify(structure_item));
  return !!sub_item.children?.some(child => typeof child !== "string" && child.some(child_item => itemMatch(structure_item, child_item)));
}

export function matchStructure(structure: DropMatchStructure, submission: string | DropSubmission | undefined, ignore_ordering: boolean | undefined, ignore_nesting: boolean | undefined) : boolean {
  // console.log(JSON.stringify({structure, submission, ignore_ordering}, null, 2));

  // Note: do not access structure_item.ignore_ordering or structure_item.ignore_nesting here,
  // those are only relevant for the children of that item, not the item itself.
  // The ignore_ordering and ignore_nesting parameters are passed down from the parent item.

  if (typeof submission === "string") {
    return false;
  }
  
  if (structure.length === 0) {
    return true;
  }

  if (submission === undefined) {
    return false;
  }

  if (ignore_ordering) {
    // If we don't care about ordering, then each structure item
    // just needs to be matched by at least one submission item.
    return structure.every(structure_item => submission.some(
      sub_item => itemMatch(structure_item, sub_item) || ignore_nesting && itemMatchAnyChild(structure_item, sub_item)
    ));
  }
  else {
    let to_match = structure.slice();
      
    // If we care about ordering, then iterate through the
    // submission and try to match each structure item in order.
    // No need to ever "rewind" here.
    submission.forEach(sub_item => {
      if (to_match.length === 0) {
        return; // already matched everything
      }

      // console.log("original");
      if (itemMatch(to_match[0], sub_item)) {
        to_match.shift();
        return;
      }

      // console.log("children");
      if (ignore_nesting && itemMatchAnyChild(to_match[0], sub_item)) {
        to_match.shift();
        return;
      }
    });

    // If we matched everything, then the match was successful.
    return to_match.length === 0;
  }

}

export function matchingDropEvaluation(evaluator: MatchingDropEvaluatorSpecification, submission: FITBDropSubmission) {
  
  if (submission.length === 0) {
    return {pointsEarned: 0, explanation: "Your submission was blank."};
  }
  
  return topLevelMatch(evaluator.structure, submission) ? evaluator.evaluation : FITBDropEvaluations.no_credit();

}

export type FITBDropEvaluatorSpecification =
  | SimpleDropEvaluatorSpecification
  | TargetDropEvaluatorSpecification
  | MatchingDropEvaluatorSpecification;

export function fitbDropEvaluate(evaluator: FITBDropEvaluatorSpecification, submission: FITBDropSubmission) {

  return evaluator.kind === "simple_drop_evaluator" ? simpleDropEvaluation(evaluator, submission) :
    evaluator.kind === "target_drop_evaluator" ? targetDropEvaluation(evaluator, submission) :
    evaluator.kind === "matching_drop_evaluator" ? matchingDropEvaluation(evaluator, submission) :
    assertNever(evaluator);

}

export function evaluateRubricItem(ri: FITBDropRubricItem, submission: FITBDropSubmission) {
  
  if (ri.policy === "first_match") {
    for(const evaluator of ri.evaluators) {
      const evaluation = fitbDropEvaluate(evaluator, submission);
      if (evaluation) { return evaluation; }
    }
    return FITBDropEvaluations.no_credit();
  }
  else if (ri.policy === "best_score") {
    return ri.evaluators
      .map(evaluator => fitbDropEvaluate(evaluator, submission))
      .filter(ev => ev !== undefined)
      .reduce((best, cur) => cur.pointsEarned > best.pointsEarned ? cur : best, FITBDropEvaluations.no_credit());
  }
  else {
    return assertNever(ri.policy);
  }

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