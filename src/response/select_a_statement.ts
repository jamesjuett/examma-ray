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
  kind: "select_a_statement";
  code_language: string;
  choices: (SASGroup | SASItem)[]
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
  return `<pre>${response.choices.map(
    group => group.kind === "item"
      ? renderSASItem(group, question_id, item_index++, response.code_language, skin)
      : group.items.map(item => renderSASItem(item, question_id, item_index++, response.code_language, skin)).join("\n")
  ).join("\n")}</pre>`;
}

function renderSASItem(item: SASItem, question_id: string, item_index: number, code_language: string, skin?: QuestionSkin) {
  return `<input type="checkbox" id="${question_id}-sas-choice-${item_index}" value="${item_index}" class="sas-select-input"></input> <label for="${question_id}-sas-choice-${item_index}" class="sas-select-label">${highlightCode(applySkin(item.text, skin), code_language)}</label>`;
  // let highlightedText = hljs.highlight(code_language, item.text).value;
  // return highlightedText;
}

function SAS_EXTRACTOR(responseElem: JQuery) {
  let chosen = responseElem.find("input:checked").map(function() {
    return parseInt(<string>$(this).val());
  }).get();
  return chosen.length > 0 ? chosen : BLANK_SUBMISSION;
}

function SAS_FILLER(elem: JQuery, submission: SASSubmission) {
  
  // blank out all selections (note this will blank required selections
  // but it's presumed the input file will fill them in subsequently)
  let inputs = elem.find("input");
  inputs.prop("checked", false);

  if (submission !== BLANK_SUBMISSION) {
    let inputElems = inputs.get();
    submission.forEach(n => $(inputElems[n]).prop("checked", true));
  }
}

export const SAS_HANDLER = {
  parse: SAS_PARSER,
  render: SAS_RENDERER,
  extract: SAS_EXTRACTOR,
  fill: SAS_FILLER
};