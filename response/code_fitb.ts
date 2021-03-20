import { assertFalse } from "../util";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { isStringArray } from "./util";

export type FITBResponse = {
  kind: "code_fitb";
  text: string;
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
  return `TODO
  `;
}

export function CODE_FITB_EXTRACTOR(responseElem: JQuery) {
  return assertFalse();
}

export function CODE_FITB_FILLER(elem: JQuery, submission: FITBSubmission) {
  // TODO
}