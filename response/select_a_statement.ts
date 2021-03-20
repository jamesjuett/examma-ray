import { assertFalse } from "../util";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isNumericArray } from "./util";

export type SASResponse = {
  kind: "select_a_statement";
  language: string;
  lines: {
    required: boolean;
    text: string;
  }[];
};

export type SASSubmission = readonly number[] | typeof BLANK_SUBMISSION;

export function SAS_PARSER(rawSubmission: string | null | undefined) : SASSubmission | typeof MALFORMED_SUBMISSION {
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

export function SAS_RENDERER(response: SASResponse, question_id: string) {
  return `TODO
  `;
}

export function SAS_EXTRACTOR(responseElem: JQuery) {
  return assertFalse();
}

export function SAS_FILLER(elem: JQuery, submission: SASSubmission) {
  // TODO
}