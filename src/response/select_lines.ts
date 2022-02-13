import { GraderSpecificationFor, QuestionGrader } from "../graders/QuestionGrader";
import { applySkin, highlightCode } from "../core/render";
import { ExamComponentSkin } from "../core/skins";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isNumericArray } from "./util";
import { ResponseHandler, ViableSubmission } from "./responses";

/**
 * One of the "lines" of code that may be toggled on/off in a select lines response.
 * If `forced` is specified as true, the item will appear as selected and can not
 * be toggled off (it will always be included in the solution).
 */
export type SLItem = {
  kind: "item",
  text: string,
  forced?: boolean
};

export type SLGroup = {
  kind: "group",
  title?: string, // TODO make sure this can be skinned as well once it's implemented
  items: SLItem[]
};


/**
 * ## Select Lines Response Element Specification
 * 
 * A select lines response gives students a sequence of lines of code and asks them to choose the ones
 * that are correct and should become part of a final solution. The relative ordering of the lines
 * is fixed, but each may be turned on/off. Lines may be "forced", meaning they cannot be turned off
 * and are always included in the final solution. A "line" may in fact contain several lines if its
 * specified content contains newline characters.
 * 
 * The response is rendered as a sequence of lines with checkboxes. Clicking a line toggles whether
 * it is selected or not. Students may also preview their final solution, composed of only the
 * selected lines.
 * 
 * Here's an example of a question with a select lines response.
 * 
 * ![image](media://response-sample-select-lines.png)
 * 
 * ![image](media://response-sample-select-lines-selected-only.png)
 * 
 * ```typescript
 * export const Question_Sample_Select_Lines : QuestionSpecification = {
 *   question_id: "sample_select_lines",
 *   tags: [],
 *   points: 9,
 *   mk_description:
 * `
 * Compose a poem by selecting from the lines below.
 * Click all lines that should be included. You are not able to change the
 * relative ordering of the lines. You may use the buttons to toggle between
 * viewing all choices or just the ones you have selected to preview your
 * chosen code. When finished, the **selected lines should form a working
 * function** that performs a **deep copy** where appropriate and **avoids
 * undefined behavior or memory leaks**. Some lines contain **mistakes**
 * or are **unnecessary** for the function - these lines should not be selected.
 * `,
 *   response: {
 *     kind: "select_lines",
 *     code_language: "cpp",
 *     header: "A profound poem:",
 *     choices: [
 *       {
 *         kind: "item",
 *         text: "Roses are red",
 *         forced: false
 *       },
 *       {
 *         kind: "item",
 *         text: "Roses are pink",
 *         forced: true
 *       },
 *       {
 *         kind: "item",
 *         text: "Violets are blue",
 *         forced: false
 *       },
 *       {
 *         kind: "item",
 *         text: "Violets are purple",
 *         forced: false
 *       },
 *       {
 *         kind: "item",
 *         text: "This question is easy",
 *         forced: false
 *       },
 *       {
 *         kind: "item",
 *         text: "This question is tough",
 *         forced: false
 *       },
 *       {
 *         kind: "item",
 *         text: "But you already knew",
 *         forced: false
 *       },
 *       {
 *         kind: "item",
 *         text: "Nothing rhymes with purple",
 *         forced: false
 *       },
 *     ],
 *     footer: "The end",
 *     sample_solution: [1, 2, 4, 6]
 *   }
 * }
 * ```
 * 
 * ### Select Lines Submissions
 * 
 * A submission for a select lines response is an array of numbers corresponding to the indices
 * of selected lines. See [[`SLSubmission`]] for details.
 * 
 */
export type SLSpecification = {
  
  /**
   * The discriminant "select_lines" is used to distinguish select lines specifications.
   */
  kind: "select_lines",

  /**
   * The language to use for syntax highlighting. Specify the alias for any 
   * [highlightjs supported language](https://highlightjs.readthedocs.io/en/latest/supported-languages.html).
   */
  code_language: string,

  /**
   * The "lines" of code to present as choices for the student.
   */
  choices: (SLGroup | SLItem)[],

  /**
   * Code shown above the set of lines students select from.
   */
  header?: string,

  /**
   * Code shown below the set of lines students select from
   */
  footer?: string,

  /**
   * A sample solution for this response.
   */
  sample_solution?: ViableSubmission<SLSubmission>,

  /**
   * A default grader for this response.
   */
  default_grader?: GraderSpecificationFor<"select_lines">
};

/**
 * A submission for a select lines response is an array of numbers corresponding to the indices
 * of selected lines. Note that any "forced" items will always be included in a submission.
 * The submission may also be [[BLANK_SUBMISSION]] if no items were selected.
 */
export type SLSubmission = readonly number[] | typeof BLANK_SUBMISSION;

function SL_PARSER(rawSubmission: string | null | undefined) : SLSubmission | typeof MALFORMED_SUBMISSION {
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

function SL_RENDERER(response: SLSpecification, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  let item_index = 0;
  return `
    <div style="text-align: right; margin-bottom: 5px;">
      <div class="btn-group btn-group-toggle" data-toggle="buttons">
        <label class="btn btn-outline-primary btn-sm active">
          <input class="examma-ray-sl-show-choices-button" type="radio" name="options" autocomplete="off" checked> All Choices
        </label>
        <label class="btn btn-outline-primary btn-sm">
          <input class="examma-ray-sl-show-preview-button" type="radio" name="options" autocomplete="off"> Selected Only
        </label>
      </div>
    </div>
    <div class="examma-ray-sl-header">
      ${response.header ? `<pre><code>${highlightCode(applySkin(response.header, skin), response.code_language)}</code></pre>` : ""}
    </div>
    <div class="examma-ray-sl-choices sl-view-choices">
      ${response.choices.map(
        group => group.kind === "item"
          ? renderSLItem(group, question_uuid, item_index++, response.code_language, skin)
          : group.items.map(item => renderSLItem(item, question_uuid, item_index++, response.code_language, skin)).join("\n")
      ).join("\n")}
    </div>
    <div class="examma-ray-sl-footer">
      ${response.footer ? `<pre><code>${highlightCode(applySkin(response.footer, skin), response.code_language)}</code></pre>` : ""}
    </div>
  `;
}

function renderSLItem(item: SLItem, question_id: string, item_index: number, code_language: string, skin: ExamComponentSkin | undefined) {
  return `
    <div class="examma-ray-sl-line">
      <input type="checkbox" id="${question_id}-sl-choice-${item_index}" value="${item_index}" class="sl-select-input"${item.forced ? " checked=\"checked\" disabled=\"disabled\"" : ""}></input> 
      <label for="${question_id}-sl-choice-${item_index}" class="sl-select-label">
        <pre><code>${highlightCode(applySkin(item.text, skin), code_language)}</code></pre>
      </label><br />
    </div>`;
}

function SL_SOLUTION_RENDERER(response: SLSpecification, solution: ViableSubmission<SLSubmission>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  let item_index = 0;
  return `
    <div style="text-align: right; margin-bottom: 5px;">
      <div class="btn-group btn-group-toggle" data-toggle="buttons">
        <label class="btn btn-outline-primary btn-sm active">
          <input class="examma-ray-sl-show-choices-button" type="radio" name="options" autocomplete="off" checked> All Choices
        </label>
        <label class="btn btn-outline-primary btn-sm">
          <input class="examma-ray-sl-show-preview-button" type="radio" name="options" autocomplete="off"> Selected Only
        </label>
      </div>
    </div>
    <div class="examma-ray-sl-header">
      ${response.header ? `<pre><code>${highlightCode(applySkin(response.header, skin), response.code_language)}</code></pre>` : ""}
    </div>
    <div class="examma-ray-sl-choices sl-view-choices">
      ${response.choices.map(
        group => group.kind === "item"
          ? renderSolutionSLItem(group, solution, question_uuid, item_index++, response.code_language, skin)
          : group.items.map(item => renderSolutionSLItem(item, solution, question_uuid, item_index++, response.code_language, skin)).join("\n")
      ).join("\n")}
    </div>
    <div class="examma-ray-sl-footer">
      ${response.footer ? `<pre><code>${highlightCode(applySkin(response.footer, skin), response.code_language)}</code></pre>` : ""}
    </div>
  `;
}

function renderSolutionSLItem(item: SLItem, solution: ViableSubmission<SLSubmission>, question_id: string, item_index: number, code_language: string, skin: ExamComponentSkin | undefined) {
  const in_solution = solution.indexOf(item_index) !== -1;
  return `
    <div class="examma-ray-sl-line">
      <input type="checkbox" id="${question_id}-sl-choice-${item_index}" value="${item_index}" class="sl-select-input" style="pointer-events: none;" ${item.forced ? "checked disabled" : in_solution ? "checked" : "disabled"}></input> 
      <label for="${question_id}-sl-choice-${item_index}" class="sl-select-label">
        <pre><code>${highlightCode(applySkin(item.text, skin), code_language)}</code></pre>
      </label><br />
    </div>`;
}


function SL_ACTIVATE(responseElem: JQuery) {

  // Note that this activation occurs for either a regular exam or for
  // a displayed sample solution (you might want to toggle views in
  // either case).

  responseElem.data("sl-view", "choices");
  responseElem.find(".examma-ray-sl-show-choices-button").on("click",
    () => {
      responseElem.find(".examma-ray-sl-choices")
        .addClass("sl-view-choices")
        .removeClass("sl-view-preview");
      responseElem.data("sl-view", "choices");
      responseElem.find(".examma-ray-sl-line").slideDown();
    }
  );
  responseElem.find(".examma-ray-sl-show-preview-button").on("click",
    () => {
      responseElem.data("sl-view", "preview");
      responseElem.find(".examma-ray-sl-line").has("input:not(:checked)").slideUp(400, () => {
        responseElem.find(".examma-ray-sl-choices")
          .addClass("sl-view-preview")
          .removeClass("sl-view-choices");
      });
    }
  );
}

function SL_EXTRACTOR(responseElem: JQuery) {
  let chosen = responseElem.find(".examma-ray-sl-choices input:checked").map(function() {
    return parseInt(<string>$(this).val());
  }).get();
  return chosen.length > 0 ? chosen : BLANK_SUBMISSION;
}

function SL_FILLER(responseElem: JQuery, submission: SLSubmission) {
  
  let inputs = responseElem.find(".examma-ray-sl-choices input");

  // blank out all selections, except those that are disabled
  // which would be the "forced" items in the list of SL choices
  inputs.filter(":not(:disabled)").prop("checked", false);

  if (submission !== BLANK_SUBMISSION) {
    let inputElems = inputs.get();
    submission.forEach(n => $(inputElems[n]).prop("checked", true));
  }

  // Initially revert to showing everything
  responseElem.find(".examma-ray-sl-line").show();
  
  // If we're in preview mode, hide anything that isn't checked
  if (responseElem.data("sl-view") === "preview") {
    responseElem.find(".examma-ray-sl-line").has("input:not(:checked)").hide();
  }
}

export const SL_HANDLER : ResponseHandler<"select_lines"> = {
  parse: SL_PARSER,
  render: SL_RENDERER,
  render_sample_solution: SL_SOLUTION_RENDERER,
  activate: SL_ACTIVATE,
  extract: SL_EXTRACTOR,
  fill: SL_FILLER
};