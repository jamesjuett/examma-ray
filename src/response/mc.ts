import deepEqual from "deep-equal";
import { mk2html } from "../core/render";
import { ExamComponentSkin } from "../core/skins";
import { GraderSpecificationFor } from "../graders/QuestionGrader";
import { BLANK_SUBMISSION, INVALID_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { ResponseHandler, ResponseSpecificationDiff, ViableSubmission } from "./responses";
import { isNumericArray } from "./util";

/**
 * ## Multiple Choice Response Element Specification 
 * 
 * An Multiple Choice response provides several options that students select from. It may
 * be configured to allow only one choice (rendered as radio buttons) or multiple choice
 * (rendered as checkboxes).
 * 
 * The [[MCSpecification]] type alias represents the information needed to specify an MC
 * response as part of a question.
 * 
 * Here's an example of a question with an MC response.
 * 
 * ![image](media://response-sample-mc.png)
 * 
 * ```typescript
 * export const Question_Sample_MC : QuestionSpecification = {
 *   question_id: "sample_mc",
 *   points: 2,
 *   mk_description:
 * `
 * This is a sample question. Which of the following is NOT a heirloom variety of tomato plant?
 * `,
 *   response: {
 *     kind: "multiple_choice",
 *     choices: [
 *       "Green Zebra",
 *       "Better Boy",
 *       "Black Krim",
 *       "Mr. Stripey",
 *       "Brandywine"
 *     ],
 *     multiple: false,
 *     default_grader: new SimpleMCGrader(1)
 *   }
 * }
 * ```
 * 
 * ### Single or Multiple Response
 * 
 * If the `multiple` property is set to `false`, choices are rendered as radio buttons and
 * students may only select a single choice. If the property is set to `true`, choices are
 * rendered as checkboxes and students may select any number of choices.
 * 
 * A multiple-selection MC question may specify a limit for the number of checkboxes
 * that may be selected via the `limit` property. (This property is ignored if multiple
 * selections are not allowed.)
 * 
 * ### MC Submissions
 * 
 * Essentially, a submission for an MC response is an array of numbers corresponding to the indices
 * of selected choices. See [[`MCSubmission`]] for details.
 */
export type MCSpecification = {

  /**
   * The discriminant `"multiple_choice"` is used to distinguish FITB specifications.
   */
  kind: "multiple_choice";

  /**
   * Whether or not the question allows multiple selection.
   */
  multiple: boolean;

  /**
   * For multiple-selection questions, an optional limit on selected choices.
   */
  limit?: number;

  /**
   * Choices for selection. May include markdown.
   */
  choices: string[];

  /**
   * Optional margin added below each option. Uses css size specifcations e.g. "10px", "1em", etc.
   */
  spacing?: string;

  /**
   * A sample solution, which may not be blank or invalid.
   */
  sample_solution?: ViableSubmission<MCSubmission>;

  /**
   * A default grader, used to evaluate submissions for this response.
   */
  default_grader?: GraderSpecificationFor<"multiple_choice">
};


/**
 * Essentially, a submission for an MC response is an array of numbers corresponding to the indices
 * of selected choices. For a single response question, this array will be a single element.
 * For multiple response questions, the array may contain one or more elements.
 * 
 * A submission may also be [[`BLANK_SUBMISSION`]] if nothing was selected.
 * 
 * A submission may also be [[`INVALID_SUBMISSION`]] if the array of selected choices contains more
 * elements than a specified `limit`. (This should not regularly happen, but is possible if e.g. a
 * student were to nefariously edit their answers `.json` file before turning it in. Upon loading,
 * their submission would be checked and replaced by [[`INVALID_SUBMISSION`]]).
 */
export type MCSubmission = readonly number[] | typeof INVALID_SUBMISSION | typeof BLANK_SUBMISSION;

function MC_PARSER(rawSubmission: string | null | undefined) : MCSubmission | typeof MALFORMED_SUBMISSION {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  try {
    let parsed = JSON.parse(rawSubmission);
    if (isNumericArray(parsed)) {
      return parsed.length > 0 ? parsed : BLANK_SUBMISSION;
    }
    else {
      return MALFORMED_SUBMISSION;
    }
  }
  catch(e) {
    if (e instanceof SyntaxError) {
      return MALFORMED_SUBMISSION;
    }
    else {
      throw e;
    }
  }
}

function MC_VALIDATOR(response: MCSpecification, submission: MCSubmission) {
  if (submission === BLANK_SUBMISSION || submission === INVALID_SUBMISSION) {
    return submission;
  }

  if (!response.multiple || response.limit === undefined) {
    return submission;
  }

  return submission.length <= response.limit ? submission : INVALID_SUBMISSION;
}

function MC_RENDERER(response: MCSpecification, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  return `
    <form>
    ${(response.multiple && response.limit !== undefined) ? `<div data-examma-ray-mc-limit="${response.limit}">You have selected <span class="examma-ray-mc-num-selected">0</span> out of ${response.limit} allowed.</div>`: ""}
    ${response.choices.map((item,i) => `
      <div class="form-check" style="${response.spacing ? ` margin-bottom: ${response.spacing};` : ""}">
        <input id="${question_uuid}_choice_${i}" class="form-check-input" type="${response.multiple ? "checkbox" : "radio"}" name="${question_uuid}_choice" value="${i}"/>
        <label for="${question_uuid}_choice_${i}" class="form-check-label examma-ray-mc-option">${mk2html(item, skin)}</label>
      </div>`
    ).join("")}
    </form>
  `;
}

function MC_SOLUTION_RENDERER(response: MCSpecification, orig_solution: MCSubmission, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  
  const was_invalid = orig_solution === INVALID_SUBMISSION;

  if (orig_solution === BLANK_SUBMISSION || orig_solution === INVALID_SUBMISSION) {
    orig_solution = [];
  }

  const solution = orig_solution; // Allow type inference within the map() below

  return `
    ${was_invalid
      ? "<p>This solution was invalid (i.e. was outside the space of allowed answer choices - this should not normally happen).</p>"
      : solution.length === 0
        ? "<p>All options left unselected.</p>"
        : ""
    }
    <form>
    ${(response.multiple && response.limit !== undefined) ? `<div><span class="examma-ray-mc-num-selected">${solution.length}</span> out of ${response.limit} allowed choices are selected.</div>`: ""}
    ${response.choices.map((item,i) => `
      <div class="form-check" style="${response.spacing ? ` margin-bottom: ${response.spacing};` : ""}">
        <input id="${question_uuid}_choice_${i}" class="form-check-input" type="${response.multiple ? "checkbox" : "radio"}" name="${question_uuid}_choice" value="${i}" style="pointer-events: none" ${solution.indexOf(i) !== -1 ? "checked" : "disabled"}/>
        <label class="form-check-label examma-ray-mc-option">${mk2html(item, skin)}</label>
      </div>`
    ).join("")}
    </form>
  `;
}

function getCheckboxLimit(responseElem: JQuery) : number | undefined {
  let limitElem = responseElem.find("*[data-examma-ray-mc-limit]");
  return limitElem.length > 0 ? parseInt(limitElem.data("examma-ray-mc-limit")) : undefined;
}

function MC_ACTIVATE(responseElem: JQuery, is_sample_solution: boolean) {

  if (is_sample_solution) {
    // If this is a sample solution, no need for checkbox limit code
    // (they can't check stuff in a sample solution anyway)
    return;
  }

  // frontend code to enforce checkbox limit. note that this won't absolutely prevent
  // someone from messing with the front end to check extra boxes, but the limit is
  // enforced elsewhere (e.g. extracting, parsing)
  const limit = getCheckboxLimit(responseElem);
  if (limit !== undefined) {
    responseElem.find("input:checkbox").on("change", () => {
      const numSelected = responseElem.find("input:checkbox:checked").length;
      // checkbox just changed, unchecked ones that are enabled if and only if we aren't at the limit
      responseElem.find("input:checkbox").not(":checked").prop("disabled", numSelected >= limit);
      responseElem.find(".examma-ray-mc-num-selected").html(""+numSelected);
    });
  }
}

function MC_EXTRACTOR(responseElem: JQuery) : MCSubmission {
  let responses = responseElem.find("input:checked").map(function() {
    return parseInt(<string>$(this).val());
  }).get();

  if (responses.length === 0) {
    return BLANK_SUBMISSION;
  }

  // Enforce checkbox limit if any
  let limit = getCheckboxLimit(responseElem);
  if (limit !== undefined) {
    responses = responses.slice(0, limit);
  }

  return responses;
}

function MC_FILLER(responseElem: JQuery, submission: MCSubmission) {
  // blank out all selections
  let inputs = responseElem.find("input");
  inputs.prop("checked", false);

  if (submission !== BLANK_SUBMISSION && submission !== INVALID_SUBMISSION) {

    // Enforce checkbox limit if any
    let limit = getCheckboxLimit(responseElem);
    if (limit !== undefined) {
      submission = submission.slice(0, limit);
    }

    let inputElems = inputs.get();
    submission.forEach(n => $(inputElems[n]).prop("checked", true));
  }
}

function MC_DIFF(r1: MCSpecification, r2: MCSpecification) : ResponseSpecificationDiff {
  if (r1.kind !== r2.kind) {
    return { incompatible: true };
  }

  return {
    structure:
      r1.multiple !== r2.multiple ||
      r1.limit !== r2.limit ||
      r1.choices.length !== r2.choices.length,
    content:
      r1.choices.length !== r2.choices.length || !r1.choices.every((e, i) => e === r2.choices[i]),
    default_grader:
      !deepEqual(r1.default_grader, r2.default_grader, {strict: true}),
    sample_solution:
      !deepEqual(r1.sample_solution, r2.sample_solution, {strict: true}),
    format:
      r1.spacing !== r2.spacing,
  };
}

export const MC_HANDLER : ResponseHandler<"multiple_choice"> = {
  parse: MC_PARSER,
  validate: MC_VALIDATOR,
  render: MC_RENDERER,
  render_solution: MC_SOLUTION_RENDERER,
  activate: MC_ACTIVATE,
  extract: MC_EXTRACTOR,
  fill: MC_FILLER,
  diff: MC_DIFF
};