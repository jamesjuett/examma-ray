import { assert, assertFalse } from "../util";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isStringArray } from "./util";
import hljs from 'highlight.js';

export type FITBResponse = {
  kind: "code_fitb";
  text: string;
  code_language: string;
};

export type FITBSubmission = readonly string[] | typeof BLANK_SUBMISSION;

export function CODE_FITB_PARSER(rawSubmission: string | null | undefined) : FITBSubmission | typeof MALFORMED_SUBMISSION {
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

export function CODE_FITB_RENDERER(response: FITBResponse, question_id: string) {
  return `<pre><code>${createFilledFITB(response.text, response.code_language)}</code></pre>`;
}




export function CODE_FITB_EXTRACTOR(responseElem: JQuery) {
  return responseElem.find("input").map(function() {
    return <string>$(this).val();
  }).get();
}

export function CODE_FITB_FILLER(elem: JQuery, submission: FITBSubmission) {
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





const BLANK_PATTERN = /_+(BLANK|Blank|blank)_+/g;

function createFilledFITB(text: string, code_language: string) {

  // count the number of underscores in each blank
  let blankLengths = text.match(BLANK_PATTERN)?.map(m => {
    let num_ = 5; // start with 5 for the word "blank"
    for(let i = 0; i < m.length; ++i) {
      if (m[i] === "_") { ++num_; }
    }
    return num_;
  }) ?? [];
  
  // Replace blanks with an arbitrary string that the highlighter will parse
  // as a variable - the intent is for the __BLANK__ syntax to not
  // mess with the way that things are highlighted.
  let blank_id = "laefiahslkefhalskdfjlksn";
  text = text.replace(BLANK_PATTERN, blank_id);

  let highlightedText = hljs.highlight(code_language, text).value;

  // Replace each of the "blank ids" in the highlighted text with
  // a corresponding input element of the right size based on the
  // number of underscores that were originally in the "__BLANK__"
  blankLengths.forEach((length) => {
    highlightedText = highlightedText.replace(blank_id, `<input type="text" size="${length}" maxlength="${length}" class="examma-ray-fitb-blank-input"></input>`)
  });

  // Replace "blank lines" with a custom spacer (I took this out for now since I like the literal spacing better)
  // highlightedText = highlightedText.replace(/\n\n/g, '\n<div class="examma-ray-fitb-spacer"></div>');
  
  return highlightedText;
}