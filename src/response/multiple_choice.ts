import Mustache from "mustache";
import { QuestionSkin } from "../exams";
import { mk2html } from "../render";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isNumericArray } from "./util";

export type MCResponse = {
  kind: "multiple_choice";
  multiple: boolean;
  choices: string[];
};

export type MCSubmission = readonly number[] | typeof BLANK_SUBMISSION;

export function MC_PARSER(rawSubmission: string | null | undefined) : MCSubmission | typeof MALFORMED_SUBMISSION {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  let parsed = JSON.parse(rawSubmission);
  if (isNumericArray(parsed)) {
    return parsed.length > 0 ? parsed : BLANK_SUBMISSION;
  }
  else {
    return MALFORMED_SUBMISSION;
  }
}

export function MC_RENDERER(response: MCResponse, question_id: string, skin?: QuestionSkin) {
  return `
    <form>
    ${response.choices.map((item,i) => `
      <div>
        <input id="${question_id}_choice_${i}" type="${response.multiple ? "checkbox" : "radio"}" name="${question_id}_choice" value="${i}"/>
        <label for="${question_id}_choice_${i}" class="examma-ray-mc-option">${mk2html(item, skin)}</label>
      </div>`
    ).join("")}
    </form>
  `;
}

export function MC_EXTRACTOR(responseElem: JQuery) : MCSubmission {
  let responses = responseElem.find("input:checked").map(function() {
    return parseInt(<string>$(this).val());
  }).get();
  return responses.length > 0 ? responses : BLANK_SUBMISSION;
}

export function MC_FILLER(elem: JQuery, submission: MCSubmission) {
  // blank out all selections
  let inputs = elem.find("input");
  inputs.prop("checked", false);

  if (submission !== BLANK_SUBMISSION) {
    let inputElems = inputs.get();
    submission.forEach(n => $(inputElems[n]).prop("checked", true));
  }
}

export const MC_HANDLER = {
  parse: MC_PARSER,
  render: MC_RENDERER,
  extract: MC_EXTRACTOR,
  fill: MC_FILLER
};