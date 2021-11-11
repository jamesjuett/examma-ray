/**
 * ## FITB Response
 * 
 * An FITB (Fill-In-The-Blank) response includes markdown-formatted content containing "blanks" and "boxes" that
 * students fill in to compose their response.
 * 
 * The [[FITBSpecification]] type alias represents the information needed to specify an FITB
 * response as part of a question.
 * 
 * Here's an example of a question with an FITB response. The content is specified as a
 * backtick-quoted multi-string literal in typescript. (Note there are also escaped backticks
 * around a markdown code block).
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
 * you'd use the escape sequence `\n`.
 * 
 * ### FITB Submissions
 * 
 * A submission for an FITB response is an array of strings that specify
 * the content submitted for each blank/box. See [[FITBSubmission]]. The submission
 * may also be [[BLANK_SUBMISSION]].
 * 
 * @module
 */

import { GraderSpecificationFor, QuestionGrader } from "../graders/QuestionGrader";
import { applySkin } from "../core/render";
import { ExamComponentSkin } from "../core/skins";
import { assert } from "../core/util";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { createFilledFITB } from "./util-fitb";
import { isStringArray } from "./util";

/**
 * Specifies an FITB response as part of a question.
 */
export type FITBSpecification = {

  /**
   * The discriminant "fill_in_the_blank" is used to distinguish FITB specifications.
   */
  kind: "fill_in_the_blank";

  /**
   * The content of the FITB response. See [[core/response/fitb#blanks-and-boxes]] for details.
   */
  content: string;

  /**
   * A sample solution for this response.
   */
  sample_solution?: Exclude<FITBSubmission, typeof BLANK_SUBMISSION>;

  /**
   * A default grader for this response.
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

export const FITB_HANDLER = {
  parse: FITB_PARSER,
  render: FITB_RENDERER,
  extract: FITB_EXTRACTOR,
  fill: FITB_FILLER
};

