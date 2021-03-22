import { Question } from "../autograder";
import { CODE_FITB_EXTRACTOR, CODE_FITB_FILLER, CODE_FITB_HANDLER, CODE_FITB_PARSER, CODE_FITB_RENDERER, FITBResponse, FITBSubmission } from "./fitb";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION, ResponseKind } from "./common";
import { MC_EXTRACTOR, MC_FILLER, MC_PARSER, MC_RENDERER, MCResponse, MCSubmission, MC_HANDLER } from "./multiple_choice";
import { SAS_EXTRACTOR, SAS_FILLER, SAS_PARSER, SAS_RENDERER, SASResponse, SASSubmission, SAS_HANDLER } from "./select_a_statement";

export type QuestionResponse<QT extends ResponseKind> = {
  "multiple_choice" : MCResponse,
  "fitb" : FITBResponse,
  "select_a_statement" : SASResponse
}[QT];

export type SubmissionType<QT extends ResponseKind> = {
  "multiple_choice" : MCSubmission,
  "fitb" : FITBSubmission,
  "select_a_statement" : SASSubmission
}[QT];


export type ResponseHandler<QT extends ResponseKind> = {
  parse: (rawSubmission: string | null | undefined) => SubmissionType<QT> | typeof MALFORMED_SUBMISSION,
  render: (response: QuestionResponse<QT>, question_id: string) => string,
  extract: (responseElem: JQuery) => SubmissionType<QT>,
  fill: (elem: JQuery, submission: SubmissionType<QT>) => void
};

export const RESPONSE_HANDLERS : {
  [QT in ResponseKind]: ResponseHandler<QT>
} = {
  "multiple_choice": MC_HANDLER,
  "fitb": CODE_FITB_HANDLER,
  "select_a_statement": SAS_HANDLER,
};

export function parse_submission<QT extends ResponseKind>(kind: QT, rawSubmission: string | null | undefined) : SubmissionType<QT> {
  return <SubmissionType<QT>>RESPONSE_HANDLERS[kind].parse(rawSubmission);
}

export function render_response<QT extends ResponseKind>(response: QuestionResponse<QT>, question_id: string) : string {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[<QT>response.kind]).render(response, question_id);
}

export function extract_response<QT extends ResponseKind>(kind: QT, responseElem: JQuery) : SubmissionType<QT> {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[kind]).extract(responseElem);
}

export function stringify_response<QT extends ResponseKind>(submission: SubmissionType<QT>) {
  return submission === BLANK_SUBMISSION ? "" : JSON.stringify(submission, null, 2);
}

export function fill_response<QT extends ResponseKind>(elem: JQuery, kind: QT, response: SubmissionType<QT>) : void {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[kind]).fill(elem, response);
}