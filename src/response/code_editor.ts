import { encode } from "he";
import { GraderSpecificationFor, QuestionGrader } from "../graders/QuestionGrader";
import { applySkin, highlightCode } from "../core/render";
import { ExamComponentSkin } from "../core/skins";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";

export type CodeEditorSpecification = {
  kind: "code_editor",
  code_language: string,
  codemirror_mime_type: string,
  starter: string,
  header?: string,
  footer?: string,
  sample_solution?: Exclude<CodeEditorSubmission, typeof BLANK_SUBMISSION>,
  default_grader?: GraderSpecificationFor<"code_editor">
};

export type CodeEditorSubmission = string | typeof BLANK_SUBMISSION;


function CODE_EDITOR_PARSER(rawSubmission: string | null | undefined) : CodeEditorSubmission {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  return rawSubmission;
}

function CODE_EDITOR_RENDERER(response: CodeEditorSpecification, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  return `
    <div class="examma-ray-code-editor">
      <div style="text-align: right; margin-bottom: 5px;">
        Theme: 
        <div class="btn-group btn-group-toggle" data-toggle="buttons">
          <label class="examma-ray-theme-button btn btn-outline-primary btn-sm active" data-codemirror-theme="default">
            <input type="radio" name="options" autocomplete="off" checked> Light
          </label>
          <label class="examma-ray-theme-button btn btn-outline-primary btn-sm" data-codemirror-theme="monokai">
            <input type="radio" name="options" autocomplete="off"> Dark
          </label>
          <label class="examma-ray-theme-button btn btn-outline-primary btn-sm" data-codemirror-theme="">
            <input type="radio" name="options" autocomplete="off"> None
          </label>
        </div>
      </div>
      <div class="examma-ray-code-editor-header">
        ${response.header ? `<pre><code>${highlightCode(applySkin(response.header, skin), response.code_language)}</code></pre>` : ""}
      </div>
      <div class="examma-ray-codemirror" data-codemirror-mime-type="${response.codemirror_mime_type}">${encode(applySkin(response.starter, skin))}</div>
      <div class="examma-ray-code-editor-footer">
        ${response.footer ? `<pre><code>${highlightCode(applySkin(response.footer, skin), response.code_language)}</code></pre>` : ""}
      </div>
    </div>
  `;
}


function CODE_EDITOR_EXTRACTOR(responseElem: JQuery) {
  
  // .getValue() is for the CodeMirror object
  let code : string = $(responseElem).find(".examma-ray-codemirror").data("examma-ray-codemirror").getValue() ?? "";
  return code !== "" ? code : BLANK_SUBMISSION;

}

function CODE_EDITOR_FILLER(elem: JQuery, submission: CodeEditorSubmission) {

  // .setValue() is for the CodeMirror object
  $(elem).find(".examma-ray-codemirror").data("examma-ray-codemirror").setValue(submission === BLANK_SUBMISSION ? "" : submission);
}


export const CODE_EDITOR_HANDLER = {
  parse: CODE_EDITOR_PARSER,
  render: CODE_EDITOR_RENDERER,
  extract: CODE_EDITOR_EXTRACTOR,
  fill: CODE_EDITOR_FILLER
};
