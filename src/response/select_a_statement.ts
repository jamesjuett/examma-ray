import { encode } from "he";
import { applySkin, highlightCode } from "../render";
import { QuestionSkin } from "../skins";
import { assertFalse } from "../util";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isNumericArray } from "./util";

export type SASItem = {
  kind: "item",
  text: string,
  forced?: boolean
};

export type SASGroup = {
  kind: "group",
  title?: string, // TODO make sure this can be skinned as well once it's implemented
  items: SASItem[]
};

export type SASSpecification = {
  kind: "select_a_statement",
  code_language: string,
  choices: (SASGroup | SASItem)[],
  header?: string,
  footer?: string
};

export type SASSubmission = readonly number[] | typeof BLANK_SUBMISSION;

function SAS_PARSER(rawSubmission: string | null | undefined) : SASSubmission | typeof MALFORMED_SUBMISSION {
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

function SAS_RENDERER(response: SASSpecification, question_id: string, skin?: QuestionSkin) {
  let item_index = 0;
  return `
    <div style="text-align: right; margin-bottom: 5px;">
      <div class="btn-group btn-group-toggle" data-toggle="buttons">
        <label class="btn btn-outline-primary btn-sm active">
          <input class="examma-ray-sas-show-choices-button" type="radio" name="options" autocomplete="off" checked> All Choices
        </label>
        <label class="btn btn-outline-primary btn-sm">
          <input class="examma-ray-sas-show-preview-button" type="radio" name="options" autocomplete="off"> Selected Only
        </label>
      </div>
    </div>
    <div class="examma-ray-sas-header">
      ${response.header ? `<pre><code>${highlightCode(applySkin(response.header, skin), response.code_language)}</code></pre>` : ""}
    </div>
    <div class="examma-ray-sas-choices sas-view-choices">
      ${response.choices.map(
        group => group.kind === "item"
          ? renderSASItem(group, question_id, item_index++, response.code_language, skin)
          : group.items.map(item => renderSASItem(item, question_id, item_index++, response.code_language, skin)).join("\n")
      ).join("\n")}
    </div>
    <div class="examma-ray-sas-footer">
      ${response.footer ? `<pre><code>${highlightCode(applySkin(response.footer, skin), response.code_language)}</code></pre>` : ""}
    </div>
  `;
}

function renderSASItem(item: SASItem, question_id: string, item_index: number, code_language: string, skin?: QuestionSkin) {
  return `
    <div class="examma-ray-sas-line">
      <input type="checkbox" id="${question_id}-sas-choice-${item_index}" value="${item_index}" class="sas-select-input"${item.forced ? " checked=\"checked\" disabled=\"disabled\"" : ""}></input> 
      <label for="${question_id}-sas-choice-${item_index}" class="sas-select-label">
        <pre><code>${highlightCode(applySkin(item.text, skin), code_language)}</code></pre>
      </label><br />
    </div>`;
}


function SAS_ACTIVATE(responseElem: JQuery) {
  responseElem.data("sas-view", "choices");
  responseElem.find(".examma-ray-sas-show-choices-button").on("click",
    () => {
      responseElem.find(".examma-ray-sas-choices")
        .addClass("sas-view-choices")
        .removeClass("sas-view-preview");
      responseElem.data("sas-view", "choices");
      responseElem.find(".examma-ray-sas-line").slideDown();
    }
  );
  responseElem.find(".examma-ray-sas-show-preview-button").on("click",
    () => {
      responseElem.data("sas-view", "preview");
      responseElem.find(".examma-ray-sas-line").has("input:not(:checked)").slideUp(400, () => {
        responseElem.find(".examma-ray-sas-choices")
          .addClass("sas-view-preview")
          .removeClass("sas-view-choices");
      });
    }
  );
}

function SAS_EXTRACTOR(responseElem: JQuery) {
  let chosen = responseElem.find(".examma-ray-sas-choices input:checked").map(function() {
    return parseInt(<string>$(this).val());
  }).get();
  return chosen.length > 0 ? chosen : BLANK_SUBMISSION;
}

function SAS_FILLER(responseElem: JQuery, submission: SASSubmission) {
  
  let inputs = responseElem.find(".examma-ray-sas-choices input");

  // blank out all selections, except those that are disabled
  // which would be the "forced" items in the list of SAS choices
  inputs.filter(":not(:disabled)").prop("checked", false);

  if (submission !== BLANK_SUBMISSION) {
    let inputElems = inputs.get();
    submission.forEach(n => $(inputElems[n]).prop("checked", true));
  }

  // Initially revert to showing everything
  responseElem.find(".examma-ray-sas-line").show();
  
  // If we're in preview mode, hide anything that isn't checked
  if (responseElem.data("sas-view") === "preview") {
    responseElem.find(".examma-ray-sas-line").has("input:not(:checked)").hide();
  }
}

export const SAS_HANDLER = {
  parse: SAS_PARSER,
  render: SAS_RENDERER,
  activate: SAS_ACTIVATE,
  extract: SAS_EXTRACTOR,
  fill: SAS_FILLER
};