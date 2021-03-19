export type QuestionKind =
"multiple_choice" |
"code_fitb" |
"select_a_statement";

export const MALFORMED_SUBMISSION = Symbol("malformed_submission");
export const BLANK_SUBMISSION = Symbol("blank_submission");

export type MCSubmission = readonly number[] | typeof BLANK_SUBMISSION;
export type FITBSubmission = readonly string[] | typeof BLANK_SUBMISSION;
export type SASSubmission = readonly number[] | typeof BLANK_SUBMISSION;

export type SubmissionType<QT extends QuestionKind> =
  QT extends "multiple_choice" ? MCSubmission :
  QT extends "code_fitb" ? FITBSubmission :
  QT extends "select_a_statement" ? SASSubmission :
  never;

function isNumericArray(x: any) : x is readonly number[] {
    return Array.isArray(x) && x.every(elem => typeof elem === "number");
  }
  
function isStringArray(x: any) : x is readonly string[] {
  return Array.isArray(x) && x.every(elem => typeof elem === "string");
}

export function DEFAULT_MC_PARSER(rawSubmission: string | null | undefined) : MCSubmission | typeof MALFORMED_SUBMISSION {
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

export function DEFAULT_CODE_FITB_PARSER(rawSubmission: string | null | undefined) : FITBSubmission | typeof MALFORMED_SUBMISSION {
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

export function DEFAULT_SAS_PARSER(rawSubmission: string | null | undefined) : SASSubmission | typeof MALFORMED_SUBMISSION {
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

export const SUBMISSION_PARSERS : {
  [QT in QuestionKind]: (rawSubmission: string | null | undefined) => SubmissionType<QT> | typeof MALFORMED_SUBMISSION
} = {
  "multiple_choice": DEFAULT_MC_PARSER,
  "code_fitb": DEFAULT_CODE_FITB_PARSER,
  "select_a_statement": DEFAULT_SAS_PARSER,
}

export function parse_submission<QT extends QuestionKind>(questionKind: QT, rawSubmission: string | null | undefined) : SubmissionType<QT> {
  return <SubmissionType<QT>>SUBMISSION_PARSERS[questionKind](rawSubmission);
}