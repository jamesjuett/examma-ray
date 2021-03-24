import { encode } from "he";
import { mk2html } from "../render";
import { assert, assertFalse } from "../util";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isStringArray } from "./util";

export type CodeEditorResponse = {
  kind: "code_editor",
  language: string,
  starter: string
};

export type CodeEditorSubmission = string | typeof BLANK_SUBMISSION;


export function CODE_EDITOR_PARSER(rawSubmission: string | null | undefined) : CodeEditorSubmission | typeof MALFORMED_SUBMISSION {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  return rawSubmission;
}

export function CODE_EDITOR_RENDERER(response: CodeEditorResponse) {
  return `
    <div class="examma-ray-code-editor">
      <div style="text-align: right; margin-bottom: 5px;">
        Theme: 
        <div class="btn-group btn-group-toggle" data-toggle="buttons">
          <label class="examma-ray-theme-button btn btn-outline-primary btn-sm active" data-codemirror-theme="default">
            <input type="radio" name="options" id="option1" autocomplete="off" checked> Light
          </label>
          <label class="examma-ray-theme-button btn btn-outline-primary btn-sm" data-codemirror-theme="monokai">
            <input type="radio" name="options" id="option2" autocomplete="off"> Dark
          </label>
          <label class="examma-ray-theme-button btn btn-outline-primary btn-sm" data-codemirror-theme="">
            <input type="radio" name="options" id="option3" autocomplete="off"> None
          </label>
        </div>
      </div>
      <div class="examma-ray-codemirror">${encode(response.starter)}</div>
    </div>
  `;
}

export const CODE_EDITOR_HANDLER = {
  parse: CODE_EDITOR_PARSER,
  render: CODE_EDITOR_RENDERER,
  extract: CODE_EDITOR_EXTRACTOR,
  fill: CODE_EDITOR_FILLER
};


export function CODE_EDITOR_EXTRACTOR(responseElem: JQuery) {
  
  // .getValue() is for the CodeMirror object
  let code : string = $(responseElem).find(".examma-ray-codemirror").data("examma-ray-codemirror").getValue() ?? "";
  return code !== "" ? code : BLANK_SUBMISSION;

}

export function CODE_EDITOR_FILLER(elem: JQuery, submission: CodeEditorSubmission) {

  // .setValue() is for the CodeMirror object
  $(elem).find(".examma-ray-codemirror").data("examma-ray-codemirror").setValue(submission === BLANK_SUBMISSION ? "" : submission);
}





const BLANK_PATTERN = /_+(BLANK|Blank|blank)_+/g;

function createFilledCODE_EDITOR(text: string) {

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