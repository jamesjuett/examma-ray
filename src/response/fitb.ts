import deepEqual from "deep-equal";
import { applySkin } from "../core/render";
import { ExamComponentSkin } from "../core/skins";
import { assert } from "../core/util";
import { GraderSpecificationFor } from "../graders/QuestionGrader";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { ResponseHandler, ResponseSpecificationDiff, ViableSubmission } from "./responses";
import { isStringArray } from "./util";
import { createFilledFITB, numBlanksAndBoxes as numFITBBlanksAndBoxes } from "./util-fitb";

/**
 * ## Fill-In-The-Blank (FITB) Response Element Specification
 * 
 * An FITB response includes markdown-formatted content containing "blanks" and "boxes" that
 * students fill in to compose their response.
 * 
 * The [[`FITBSpecification`]] type alias represents the information needed to specify an FITB
 * response as part of a question.
 * 
 * Here's an example of a question with an FITB response. The content is specified as a
 * backtick-quoted multi-string literal in typescript. (Note there are also escaped backticks
 * around a markdown code block).
 * 
 * ![image](media://response-sample-fitb-replacer.png)
 * 
 * ```typescript
 * export const Practice_Questions_Iterators_And_Functors_Replacer: QuestionSpecification = {
 *   question_id: "practice_iterators_and_functors_replacer_fitb",
 *   tags: [],
 *   points: 8,
 *   mk_description:
 * `
 * Complete the implementation of \`Replacer\` below by filling in the boxes.
 * 
 * If you believe a blank/box should be **empty**, write \`BLANK\`.
 * `,
 *   response: {
 *     kind: "fill_in_the_blank",
 *     content:
 * `
 * \`\`\`cpp
 * template <typename T>; // Note: T must support ==
 * class Replacer {
 * private:
 *   const T &target;
 *   const T &replacement;
 * 
 * public:
 *   Replacer(_________________________________BLANK_________________________________)
 *    : _________________________________BLANK_________________________________ { }
 *   
 *   // Function call operator
 *   _______BLANK_______ operator()(_______________BLANK_______________ item) const {
 *     [[BOX___________________________________________________________
 *     
 *     
 *     ]]
 *   }
 * };
 * \`\`\`
 * `,
 *     sample_solution: [
 *       "const T &target_in, const T &replacement_in",
 *       "target(target_in), replacement(replacement_in)",
 *       "void",
 *       "T &",
 *       "if (item == target) {\n  item = replacement;\n}"
 *     ]
 *   }
 * };
 * ```
 * 
 * ### Blanks and Boxes
 * 
 * To specify a blank, use a pattern like `____BLANK____`. Blanks are rendered as an HTML
 * text input. The number of underscores controls the `size` and `maxlength` of that text
 * input - students may not enter more content than will "fit" in the box. A blank may occur
 * in the middle of a line or on its own.
 * 
 * To specify a box, use a pattern like `[[____BOX____\n\n\n]]`. Boxes are rendered as an HTML
 * textarea input. The number of underscores controls the width of the textarea, and the number
 * of newlines controls the height. There must be at least one newline (otherwise use a blank).
 * If there are no underscores, the box will take up the full available width. A box may occur
 * in the middle of a line or on its own. Those are real newlines, though if you're writing in code
 * you'd use the escape sequence `\n`. Or, if you use backtick-quoted multi-line string literals,
 * those can just contain natural newlines.
 * 
 * ### Markdown Formatting
 * 
 * The content specification for an FITB response element may contain markdown formatting. In
 * particular, blank/box placeholders may be included inside code boxes.
 * 
 * ### FITB Submissions
 * 
 * A submission for an FITB response is an array of strings that specify
 * the content submitted for each blank/box. See [[FITBSubmission]] for details.
 * 
 */
export type FITBSpecification = {

  /**
   * The discriminant `"fill_in_the_blank"` is used to distinguish FITB specifications.
   */
  kind: "fill_in_the_blank";

  /**
   * The content specification of the FITB response. May include markdown and placeholders for blanks/boxes.
   */
  content: string;

  /**
   * A sample solution, which may not be blank or invalid.
   */
  sample_solution?: ViableSubmission<FITBSubmission>;

  /**
   * A default grader, used to evaluate submissions for this response.
   */
  default_grader?: GraderSpecificationFor<"fill_in_the_blank">;
};

/**
 * A submission for an FITB response is an array of strings that specify
 * the content submitted for each blank. The submission may also be the
 * symbol [[BLANK_SUBMISSION]].
 */
export type FITBSubmission = readonly string[] | typeof BLANK_SUBMISSION;


function FITB_PARSER(rawSubmission: string | null | undefined) : FITBSubmission | typeof MALFORMED_SUBMISSION {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  try {
    let parsed = JSON.parse(rawSubmission);
    if (isStringArray(parsed)) {
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

function FITB_RENDERER(response: FITBSpecification, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  return createFilledFITB(applySkin(response.content, skin));
}

function FITB_SOLUTION_RENDERER(response: FITBSpecification, solution: FITBSubmission, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  if (solution !== BLANK_SUBMISSION) {
    solution = solution.map(s => applySkin(s, skin))
  }
  return createFilledFITB(applySkin(response.content, skin), solution);
}

function FITB_EXTRACTOR(responseElem: JQuery) {
  let filledResponses = responseElem.find("input, textarea").map(function() {
    let v = "" + ($(this).val() ?? "");
    return v.trim() === "" ? "" : v;
  }).get();
  return filledResponses.every(br => br === "") ? BLANK_SUBMISSION : filledResponses;
}

function FITB_FILLER(elem: JQuery, submission: FITBSubmission) {
  let inputs = elem.find("input, textarea");

  if (submission !== BLANK_SUBMISSION) {
    assert(inputs.length === submission.length)
    let inputElems = inputs.get();
    submission.forEach((filledText, i) => $(inputElems[i]).val(filledText));
  }
  else {
    // if it's a blank submission, blank out all the blanks/boxes
    inputs.val("");
  }
}


function FITB_DIFF(r1: FITBSpecification, r2: FITBSpecification) : ResponseSpecificationDiff {
  if (r1.kind !== r2.kind) {
    return { incompatible: true };
  }

  return {
    structure:
      numFITBBlanksAndBoxes(r1.content) !== numFITBBlanksAndBoxes(r2.content),
    content:
      r1.content !== r2.content,
    default_grader:
      !deepEqual(r1.default_grader, r2.default_grader, {strict: true}),
    sample_solution:
      !deepEqual(r1.sample_solution, r2.sample_solution, {strict: true})
  };
}

export const FITB_HANDLER : ResponseHandler<"fill_in_the_blank"> = {
  parse: FITB_PARSER,
  render: FITB_RENDERER,
  render_solution: FITB_SOLUTION_RENDERER,
  extract: FITB_EXTRACTOR,
  fill: FITB_FILLER,
  diff: FITB_DIFF,
};

