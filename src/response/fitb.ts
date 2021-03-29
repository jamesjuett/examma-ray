import { encode } from "he";
import { applySkin, mk2html } from "../render";
import { QuestionSkin } from "../skins";
import { assert, assertFalse } from "../util";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isStringArray } from "./util";

export type FITBSpecification = {
  kind: "fitb";
  content: string;
};

export type FITBSubmission = readonly string[] | typeof BLANK_SUBMISSION;


function FITB_PARSER(rawSubmission: string | null | undefined) : FITBSubmission | typeof MALFORMED_SUBMISSION {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  let parsed = JSON.parse(rawSubmission);
  if (isStringArray(parsed)) {
    return parsed.length > 0 ? parsed : BLANK_SUBMISSION;
  }
  else {
    return MALFORMED_SUBMISSION;
  }
}

function FITB_RENDERER(response: FITBSpecification, question_id: string, skin?: QuestionSkin) {
  return createFilledFITB(applySkin(response.content, skin));
}

function FITB_EXTRACTOR(responseElem: JQuery) {
  let filledResponses = responseElem.find("input, textarea").map(function() {
    return <string>$(this).val();
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

export const CODE_FITB_HANDLER = {
  parse: FITB_PARSER,
  render: FITB_RENDERER,
  extract: FITB_EXTRACTOR,
  fill: FITB_FILLER
};



/**
 * Matches anything that looks like e.g. ___BLANK___ or _____Blank_____.
 */
const BLANK_PATTERN = /_+ *(BLANK|Blank|blank) *_+/g;

/**
 * Matches anything that looks like e.g. [[BOX\n\n\n\n\n]] or [[Box\n\n]].
 * Those are real newlines, and at least 2 are required.
 */
const BOX_PATTERN = /\[\[ *(BOX|Box|box) *\n *\n+ *\]\]/g;

function count_char(str: string, c: string) {
  let count = 0;
  for(let i = 0; i < str.length; ++i) {
    if (str[i] === c) { ++count; }
  }
  return count;
}

export function createFilledFITB(content: string, submission?: FITBSubmission) {

  // count the number of underscores in each blank pattern + 5 for the word "blank"
  let blankLengths = content.match(BLANK_PATTERN)?.map(m => 5 + count_char(m, "_")) ?? [];

  // count the number of newlines in each box pattern (will be number of lines in textarea)
  let boxLines = content.match(BOX_PATTERN)?.map(m => count_char(m, "\n")) ?? [];
  let boxWidths = content.match(BOX_PATTERN)?.map(m => count_char(m, "_")) ?? [];
  
  // Replace blanks/boxes with an arbitrary string that won't mess with
  // the way the markdown is rendered
  let blank_id = "laefiahslkefhalskdfjlksn";
  let box_id = "ewonfeoawihlawenfawhflaw";
  content = content.replace(BLANK_PATTERN, blank_id);
  content = content.replace(BOX_PATTERN, box_id);

  // Render markdown
  content = mk2html(content);

  // Include this in the html below so we can replace it in a moment
  // with the appropriate submission values
  let submission_placeholder = "awvblrefafhawonawflawlek";

  // Replace each of the "blank ids" in the rendered html with
  // a corresponding input element of the right size based on the
  // number of underscores that were originally in the "__BLANK__"
  blankLengths.forEach((length) => {
    let autoAttrs = `autocomplete="off" autocorrect="off"`
    content = content.replace(blank_id, `<input type="text" value="${submission_placeholder}" size="${length}" maxlength="${length}" ${autoAttrs} class="examma-ray-fitb-blank-input nohighlight"></input>`)
  });

  // Replace each of the "box ids" in the rendered html with
  // a corresponding textarea element with the right # of lines based on the
  // number of newlines that were originally in the "[[BOX\n\n\n]]"
  boxLines.forEach((lines, i) => {
    let boxWidth = boxWidths[i];
    let rcAttrs = `rows="${lines}" ${boxWidth !== 0 ? `cols="${boxWidth}"` : ""}`;
    let autoAttrs = `autocapitalize="none" autocomplete="off" autocorrect="off"`
    let style = `style="resize: none; overflow: hidden; ${boxWidth === 0 ? "width: 100%;" : ""}"`
    content = content.replace(box_id, `<textarea ${rcAttrs} ${autoAttrs} class="examma-ray-fitb-box-input nohighlight" ${style}>${submission_placeholder}</textarea>`)
  });

  // Replace placeholders with submission values
  if (submission && submission !== BLANK_SUBMISSION) {
    submission.forEach(
      sub => content = content.replace(submission_placeholder, encode(sub))
    );
  }

  // Replace any remaining placeholders that weren't filled (or all of them if there was no submission)
  content = content.replace(new RegExp(submission_placeholder, "g"), "");

  return content;
}