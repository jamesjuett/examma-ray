import { encode } from "he";
import { QuestionGrader } from "../QuestionGrader";
import { applySkin, mk2html } from "../render";
import { ExamComponentSkin } from "../skins";
import { assert } from "../util";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isStringArray } from "./util";

export type FITBSpecification = {
  kind: "fitb";
  content: string;
  sample_solution?: Exclude<FITBSubmission, typeof BLANK_SUBMISSION>;
  default_grader?: QuestionGrader<"fitb", any>;
};

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



/**
 * Matches anything that looks like e.g. ___BLANK___ or _____Blank_____.
 */
const BLANK_PATTERN = /_+ *(BLANK|Blank|blank) *_+/g;

/**
 * Matches anything that looks like e.g. [[BOX\n\n\n\n\n__________]] or [[Box\n\n]].
 * Those are real newlines, and at least 1 is required.
 */
const BOX_PATTERN = /\[\[[ _]*(BOX|Box|box)[ _]*( *\n)+ *\]\]/g;

function count_char(str: string, c: string) {
  let count = 0;
  for(let i = 0; i < str.length; ++i) {
    if (str[i] === c) { ++count; }
  }
  return count;
}

export function createFilledFITB(
  content: string, submission?: FITBSubmission,
  blankRenderer = DEFAULT_BLANK_RENDERER,
  boxRenderer = DEFAULT_BOX_RENDERER,
  encoder: (s:string)=>string = encode) {

  // count the number of underscores in each blank pattern
  let blankLengths = content.match(BLANK_PATTERN)?.map(m => count_char(m, "_")) ?? [];

  // count the number of newlines in each box pattern (will be number of lines in textarea)
  let boxLines = content.match(BOX_PATTERN)?.map(m => 1+count_char(m, "\n")) ?? [];
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
    content = content.replace(blank_id, blankRenderer(submission_placeholder, length))
  });

  // Replace each of the "box ids" in the rendered html with
  // a corresponding textarea element with the right # of lines based on the
  // number of newlines that were originally in the "[[BOX\n\n\n]]"
  boxLines.forEach((lines, i) => {
    content = content.replace(box_id, boxRenderer(submission_placeholder, lines, boxWidths[i]));
  });

  // Replace placeholders with submission values
  if (submission && submission !== BLANK_SUBMISSION) {
    submission.forEach(
      sub => content = content.replace(submission_placeholder, encoder(sub))
    );
  }

  // Replace any remaining placeholders that weren't filled (or all of them if there was no submission)
  content = content.replace(new RegExp(submission_placeholder, "g"), "");

  return content;
}

function DEFAULT_BLANK_RENDERER(submission_placeholder: string, length: number) {
  let autoAttrs = `autocomplete="off" autocorrect="off" spellcheck="false"`;
  return `<input type="text" value="${submission_placeholder}" size="${length}" maxlength="${length}" ${autoAttrs} class="examma-ray-fitb-blank-input nohighlight"></input>`;
}

function DEFAULT_BOX_RENDERER(submission_placeholder: string, lines: number, width: number) {
  let rcAttrs = `rows="${lines}"${width !== 0 ? ` cols="${width}"` : ""}`;
  let autoAttrs = `autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false"`;
  let style = `style="resize: none; overflow: auto;${width === 0 ? " width: 100%;" : ""}"`;
  return `<textarea ${rcAttrs} ${autoAttrs} class="examma-ray-fitb-box-input nohighlight" ${style}>${submission_placeholder}</textarea>`;
}