import { QuestionGrader } from "../QuestionGrader";
import { mk2html } from "../render";
import { ExamComponentSkin } from "../skins";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isNumericArray } from "./util";

export type MCSpecification = {
  kind: "multiple_choice";
  multiple: boolean;
  choices: string[];
  sample_solution?: Exclude<MCSubmission, typeof BLANK_SUBMISSION>;
  default_grader?: QuestionGrader<"multiple_choice", any>
};

export type MCSubmission = readonly number[] | typeof BLANK_SUBMISSION;

function MC_PARSER(rawSubmission: string | null | undefined) : MCSubmission | typeof MALFORMED_SUBMISSION {
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

function MC_RENDERER(response: MCSpecification, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  return `
    <form>
    ${response.choices.map((item,i) => `
      <div>
        <input id="${question_uuid}_choice_${i}" type="${response.multiple ? "checkbox" : "radio"}" name="${question_uuid}_choice" value="${i}"/>
        <label for="${question_uuid}_choice_${i}" class="examma-ray-mc-option">${mk2html(item, skin)}</label>
      </div>`
    ).join("")}
    </form>
  `;
}

function MC_EXTRACTOR(responseElem: JQuery) : MCSubmission {
  let responses = responseElem.find("input:checked").map(function() {
    return parseInt(<string>$(this).val());
  }).get();
  return responses.length > 0 ? responses : BLANK_SUBMISSION;
}

function MC_FILLER(elem: JQuery, submission: MCSubmission) {
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