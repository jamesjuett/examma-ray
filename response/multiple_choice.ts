import { mk2html } from "../render";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isNumericArray } from "./util";

export type MCResponse = {
  kind: "multiple_choice";
  multiple: boolean;
  choices: string[];
  maxSelections: number;
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

export function MC_RENDERER(response: MCResponse, question_id: string) {
  return `
    <form>
    ${response.choices.map((item,i) => `
      <div>
        <input id="${question_id}_choice_${i}" type="${response.multiple ? "checkbox" : "radio"}" name="${question_id}_choice" value="${i}"/>
        <label for="${question_id}_choice_${i}" class="examma-ray-mc-option">${mk2html(item)}</label>
      </div>`
    ).join("")}
    </form>
  `;
}

export function MC_EXTRACTOR(responseElem: JQuery) {
  return responseElem.find("input:checked").map(function() {
    return parseInt(<string>$(this).val());
  }).get();
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