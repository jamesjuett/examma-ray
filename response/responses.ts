import { Question } from "../autograder";
import { CODE_FITB_EXTRACTOR, CODE_FITB_FILLER, CODE_FITB_PARSER, CODE_FITB_RENDERER, FITBResponse, FITBSubmission } from "./code_fitb";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION, ResponseKind } from "./common";
import { MC_EXTRACTOR, MC_FILLER, MC_PARSER, MC_RENDERER, MCResponse, MCSubmission } from "./multiple_choice";
import { SAS_EXTRACTOR, SAS_FILLER, SAS_PARSER, SAS_RENDERER, SASResponse, SASSubmission } from "./select_a_statement";

export type QuestionResponse<QT extends ResponseKind> = {
  "multiple_choice" : MCResponse,
  "code_fitb" : FITBResponse,
  "select_a_statement" : SASResponse
}[QT];

export type SubmissionType<QT extends ResponseKind> = {
  "multiple_choice" : MCSubmission,
  "code_fitb" : FITBSubmission,
  "select_a_statement" : SASSubmission
}[QT];

export const SUBMISSION_PARSERS : {
  [QT in ResponseKind]: (rawSubmission: string | null | undefined) => SubmissionType<QT> | typeof MALFORMED_SUBMISSION
} = {
  "multiple_choice": MC_PARSER,
  "code_fitb": CODE_FITB_PARSER,
  "select_a_statement": SAS_PARSER,
}

export function parse_submission<QT extends ResponseKind>(kind: QT, rawSubmission: string | null | undefined) : SubmissionType<QT> {
  return <SubmissionType<QT>>SUBMISSION_PARSERS[kind](rawSubmission);
}

export const RESPONSE_RENDERERS : {
  [QT in ResponseKind]: (response: QuestionResponse<QT>, question_id: string) => string
} = {
  "multiple_choice": MC_RENDERER,
  "code_fitb": CODE_FITB_RENDERER,
  "select_a_statement": SAS_RENDERER,
}

export function render_response<QT extends ResponseKind>(response: QuestionResponse<QT>, question_id: string) : string {
  return (<(response: QuestionResponse<QT>, question_id: string) => string>RESPONSE_RENDERERS[response.kind])(response, question_id);
}

export const RESPONSE_EXTRACTORS : {
  [QT in ResponseKind]: (responseElem: JQuery) => SubmissionType<QT>
} = {
  "multiple_choice": MC_EXTRACTOR,
  "code_fitb": CODE_FITB_EXTRACTOR,
  "select_a_statement": SAS_EXTRACTOR,
}

export function extract_response<QT extends ResponseKind>(kind: QT, responseElem: JQuery) : SubmissionType<QT> {
  return (<(responseElem: JQuery) => SubmissionType<QT>>RESPONSE_EXTRACTORS[kind])(responseElem);
}

export function stringify_response<QT extends ResponseKind>(submission: SubmissionType<QT>) {
  return submission === BLANK_SUBMISSION ? "" : JSON.stringify(submission);
}

export const RESPONSE_FILLERS : {
  [QT in ResponseKind]: (elem: JQuery, submission: SubmissionType<QT>) => void
} = {
  "multiple_choice": <any>MC_FILLER,
  "code_fitb": <any>CODE_FITB_FILLER,
  "select_a_statement": <any>SAS_FILLER,
}

export function fill_response<QT extends ResponseKind>(elem: JQuery, kind: QT, response: SubmissionType<QT>) : void {
  return (<(elem: JQuery, submission: SubmissionType<QT>) => void>RESPONSE_FILLERS[kind])(elem, response);
}