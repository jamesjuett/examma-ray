import { encode } from "he";
import { GraderSpecificationFor, QuestionGrader } from "../graders/QuestionGrader";
import { applySkin, highlightCode } from "../core/render";
import { ExamComponentSkin } from "../core/skins";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { ResponseHandler, ViableSubmission } from "./responses";

/**
 * ## Code Editor Response Element Specification
 * 
 * A code editor response element facilitates open-ended code-writing questions. Here's an example:
 * 
 * ![image](media://response-sample-code-editor.png)
 * 
 * ```typescript
 * export const Practice_Question_List_Index_Of : QuestionSpecification = {
 *   question_id: "recursion_list_index_of",
 *   tags: [],
 *   points: 8,
 *   mk_description:
 * `For this question, you will work with a structure of nodes (see reference material) representing a **singly linked list** of integers.
 * 
 * Consider the \`index_of\` function below, which searches a **singly linked list** represented by \`Node\`s for a particular value and returns the 0-based index at which that value first occurs (or \`-1\` if the value is not found).
 * 
 * The \`index_of\` function internally calls a helper function \`index_of_helper\`, passing in an initial value of \`0\` for the \`index\` parameter:
 * 
 * \`\`\`cpp
 * // EFFECTS: Returns the index at which 'value' first occurs in the
 * //          given list. If the value does not occur, returns -1.
 * Node *index_of(Node *node, int value) {
 *     return index_of_helper(node, value, 0);
 * }
 * \`\`\`
 * 
 * Implement the \`index_of_helper\` function below.
 * 
 * - Your implementation should work correctly for any list.
 * - Your code **must** use recursion (and **may not** use any loops).
 * - Your implementation must be **tail recursive**.
 * - You may not call any functions, other than calling \`index_of_helper\` recursively.`,
 *   response: {
 *     kind: "code_editor",
 *     codemirror_mime_type: "text/x-c++src",
 *     code_language: "cpp",
 *     header: "int index_of_helper(Node *node, int value, int index) {",
 *     starter: "",
 *     footer: "}",
 *     sample_solution:
 * `if (!node) {
 *   return -1;
 *  }
 *  if (node->datum == value) {
 *   return index;
 *  }
 *  return index_of_helper(node->next, value, index + 1);`
 *   }
 * };
 * ```
 * 
 * ### Syntax Highlighting and Language Support
 * 
 * You'll want to specify the language you're working with in two places.
 * 
 * - `code_language`: For highlighting in the header/footer, specify the alias for any 
 * [highlightjs supported language](https://highlightjs.readthedocs.io/en/latest/supported-languages.html).
 * For no highlighting, specify `"text"`.
 * 
 * - `codemirror_mime_type`: For syntax highlighting and language support within
 * the code editor itself, specify one of the [MIME types supported by CodeMirror](https://codemirror.net/mode/)
 * (click into the language you want, then scroll to the bottom to see the relevant MIME type).
 * For no highlighting, specify `"null"`.
 * 
 * ### Header, Footer, Starter Code
 * 
 * The `header` and `footer` options specify code above/below the editor. Students can't
 * edit the header/footer code. The `starter` options specifies code to initially 
 * populate the code editor, which students can change.
 * 
 * ### Code Editor Submissions
 * 
 * A submission for an code editor response is simply a string with whatever content
 * was in the code editor box. See [[`CodeEditorSubmission`]] for details.
 * 
 */
export type CodeEditorSpecification = {
  kind: "code_editor",
  code_language: string,
  codemirror_mime_type: string,
  starter: string,
  header?: string,
  footer?: string,
  sample_solution?: ViableSubmission<CodeEditorSubmission>,
  default_grader?: GraderSpecificationFor<"code_editor">
};

/**
 * A submission for a code editor response is simply a string with whatever content
 * was in the code editor box. The submission may also be the symbol [[BLANK_SUBMISSION]]
 * if the contents of the code editor box were entirely blank or consisted of only whitespace.
 * Note that unmodified starter code would not be considered blank.
 */
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

function CODE_EDITOR_SOLUTION_RENDERER(response: CodeEditorSpecification, solution: CodeEditorSubmission, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  if (solution === BLANK_SUBMISSION) {
    solution = "";
  }
  
  return `
    <div class="examma-ray-code-editor-header">
      ${response.header ? `<pre><code>${highlightCode(applySkin(response.header, skin), response.code_language)}</code></pre>` : ""}
    </div>
    <div class="examma-ray-code-editor-submission">
      ${`<pre><code>${highlightCode(""+applySkin(solution, skin), response.code_language)}</code></pre>`}
    </div>
    <div class="examma-ray-code-editor-footer">
      ${response.footer ? `<pre><code>${highlightCode(applySkin(response.footer, skin), response.code_language)}</code></pre>` : ""}
    </div>
  `;
}


function CODE_EDITOR_EXTRACTOR(responseElem: JQuery) {
  
  // .getValue() is for the CodeMirror object
  let code : string = $(responseElem).find(".examma-ray-codemirror").data("examma-ray-codemirror").getValue() ?? "";
  return code.trim() !== "" ? code : BLANK_SUBMISSION;

}

function CODE_EDITOR_FILLER(elem: JQuery, submission: CodeEditorSubmission) {

  // .setValue() is for the CodeMirror object
  $(elem).find(".examma-ray-codemirror").data("examma-ray-codemirror").setValue(submission === BLANK_SUBMISSION ? "" : submission);
}


export const CODE_EDITOR_HANDLER : ResponseHandler<"code_editor"> = {
  parse: CODE_EDITOR_PARSER,
  render: CODE_EDITOR_RENDERER,
  render_sample_solution: CODE_EDITOR_SOLUTION_RENDERER, 
  extract: CODE_EDITOR_EXTRACTOR,
  fill: CODE_EDITOR_FILLER
};
