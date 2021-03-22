import { encode } from "he";
import { mk2html } from "../render";
import { assert, assertFalse } from "../util";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isStringArray } from "./util";

export type FITBResponse = {
  kind: "fitb";
  text: string;
};

export type FITBSubmission = readonly string[] | typeof BLANK_SUBMISSION;


export function FITB_PARSER(rawSubmission: string | null | undefined) : FITBSubmission | typeof MALFORMED_SUBMISSION {
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

export function FITB_RENDERER(response: FITBResponse) {
  return createFilledFITB(response.text);
}

export function FITB_EXTRACTOR(responseElem: JQuery) {
  let blankResponses = responseElem.find("input").map(function() {
    return <string>$(this).val();
  }).get();
  return blankResponses.every(br => br === "") ? BLANK_SUBMISSION : blankResponses;
}

export function FITB_FILLER(elem: JQuery, submission: FITBSubmission) {
  // blank out all radio buttons
  let inputs = elem.find("input");

  if (submission !== BLANK_SUBMISSION) {
    assert(inputs.length === submission.length)
    let inputElems = inputs.get();
    submission.forEach((blankText, i) => $(inputElems[i]).val(submission[i]));
  }
  else {
    // if it's a blank submission, blank out all the input boxes
    inputs.val("");
  }
}

export const CODE_FITB_HANDLER = {
  parse: FITB_PARSER,
  render: FITB_RENDERER,
  extract: FITB_EXTRACTOR,
  fill: FITB_FILLER
};




const BLANK_PATTERN = /_+(BLANK|Blank|blank)_+/g;

function createFilledFITB(text: string) {

  // count the number of underscores in each blank pattern
  let blankLengths = text.match(BLANK_PATTERN)?.map(m => {
    let num_ = 5; // start with 5 for the word "blank"
    for(let i = 0; i < m.length; ++i) {
      if (m[i] === "_") { ++num_; }
    }
    return num_;
  }) ?? [];
  
  // Replace blanks with an arbitrary string that the highlighter will parse
  // as a variable - the intent is for the __BLANK__ syntax to not
  // mess with the way that markdown is rendered or code is highlighted.
  let blank_id = "laefiahslkefhalskdfjlksn";
  text = text.replace(BLANK_PATTERN, blank_id);

  // Render markdown
  text = mk2html(text);

  // Replace each of the "blank ids" in the highlighted text with
  // a corresponding input element of the right size based on the
  // number of underscores that were originally in the "__BLANK__"
  blankLengths.forEach((length) => {
    text = text.replace(blank_id, `<input type="text" size="${length}" maxlength="${length}" class="examma-ray-fitb-blank-input"></input>`)
  });
  
  return text;
}