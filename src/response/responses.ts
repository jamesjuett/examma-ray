import { FITB_HANDLER, FITBSpecification, FITBSubmission } from "./fitb";
import { BLANK_SUBMISSION, INVALID_SUBMISSION, MALFORMED_SUBMISSION, ResponseKind } from "./common";
import { MCSpecification, MCSubmission, MC_HANDLER } from "./mc";
import { SLSpecification, SLSubmission, SL_HANDLER } from "./select_lines";
import { CodeEditorSpecification, CodeEditorSubmission, CODE_EDITOR_HANDLER } from "./code_editor";
import { FITBDropSpecification, FITBDropSubmission, FITB_DROP_HANDLER } from "./fitb-drop";
import { ExamComponentSkin } from "../core/skins";

export type ResponseSpecification<QT extends ResponseKind> =
  QT extends "multiple_choice" ? MCSpecification :
  QT extends "fill_in_the_blank" ? FITBSpecification :
  QT extends "select_lines" ? SLSpecification :
  QT extends "code_editor" ? CodeEditorSpecification :
  QT extends "fitb_drop" ? FITBDropSpecification :
  never;

export type SubmissionType<QT extends ResponseKind> =
  QT extends "multiple_choice" ? MCSubmission :
  QT extends "fill_in_the_blank" ? FITBSubmission :
  QT extends "select_lines" ? SLSubmission :
  QT extends "code_editor" ? CodeEditorSubmission :
  QT extends "fitb_drop" ? FITBDropSubmission :
  never;

/**
 * A helper type that represents only the "viable" submissions from a submission type
 * by excluding [[BLANK_SUBMISSION]] and [[INVALID_SUBMISSION]]. There is a general
 * understanding that viable submissions represent those that could earn points or
 * are e.g. valid to specify as a sample solution.
 */
export type ViableSubmission<ST> = Exclude<ST, typeof BLANK_SUBMISSION | typeof INVALID_SUBMISSION>;
export type ViableSubmissionType<QT extends ResponseKind> = ViableSubmission<SubmissionType<QT>>;

export type ResponseHandler<QT extends ResponseKind> = {
  parse: (rawSubmission: string | null | undefined) => SubmissionType<QT> | typeof MALFORMED_SUBMISSION,
  validate?: (response: ResponseSpecification<QT>, submission: SubmissionType<QT>) => SubmissionType<QT>,
  render: (response: ResponseSpecification<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) => string,
  render_sample_solution: (response: ResponseSpecification<QT>, solution: ViableSubmissionType<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) => string,
  activate?: (responseElem: JQuery, is_sample_solution: boolean) => void,
  extract: (responseElem: JQuery) => SubmissionType<QT>,
  fill: (elem: JQuery, submission: SubmissionType<QT>) => void
};

export const RESPONSE_HANDLERS : {
  [QT in ResponseKind]: ResponseHandler<QT>
} = {
  "multiple_choice": MC_HANDLER,
  "fill_in_the_blank": FITB_HANDLER,
  "select_lines": SL_HANDLER,
  "code_editor": CODE_EDITOR_HANDLER,
  "fitb_drop": FITB_DROP_HANDLER
};

export function parse_submission<QT extends ResponseKind>(kind: QT, rawSubmission: string | null | undefined) : SubmissionType<QT> {
  return <SubmissionType<QT>>RESPONSE_HANDLERS[kind].parse(rawSubmission);
}

export function validate_submission<QT extends ResponseKind>(response: ResponseSpecification<QT>, submission: SubmissionType<QT>) : SubmissionType<QT> {
  let handler = <ResponseHandler<QT>>RESPONSE_HANDLERS[response.kind];
  return handler.validate ? handler.validate(response, submission) : submission;
}

export function render_response<QT extends ResponseKind>(response: ResponseSpecification<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) : string {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[<QT>response.kind]).render(response, question_id, question_uuid, skin);
}

export function render_solution<QT extends ResponseKind>(response: ResponseSpecification<QT>, solution: ViableSubmissionType<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) : string {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[<QT>response.kind]).render_sample_solution(response, solution, question_id, question_uuid, skin);
}

export function activate_response<QT extends ResponseKind>(kind: QT, is_sample_solution: boolean, responseElem: JQuery) : void {
  let activateFn = (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[kind]).activate;
  activateFn && activateFn(responseElem, is_sample_solution);
}

export function extract_response<QT extends ResponseKind>(kind: QT, responseElem: JQuery) : SubmissionType<QT> {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[kind]).extract(responseElem);
}

export function stringify_response<QT extends ResponseKind>(submission: SubmissionType<QT>) {
  return submission === BLANK_SUBMISSION ? "" : 
        typeof submission === "string" ? submission :
        JSON.stringify(submission);
}

export function fill_response<QT extends ResponseKind>(elem: JQuery, kind: QT, response: SubmissionType<QT>) : void {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[kind]).fill(elem, response);
}