import { ExamComponentSkin } from "../core";
import { CODE_EDITOR_HANDLER } from "./code_editor";
import { ResponseKind } from "./common";
import { FITB_HANDLER } from "./fitb";
import { FITB_DROP_HANDLER } from "./fitb-drop";
import { IFRAME_HANDLER } from "./iframe";
import { MC_HANDLER } from "./mc";
import { ResponseHandler, ParsedSubmission, ResponseSpecification, WellFormedSubmission, CheckedSubmission, ValidSubmission, SubmissionType, ResponseSpecificationDiff, is_empty_response_diff } from "./responses";
import { SL_HANDLER } from "./select_lines";


export const RESPONSE_HANDLERS: {
  [QT in ResponseKind]: ResponseHandler<QT>;
} = {
  "multiple_choice": MC_HANDLER,
  "fill_in_the_blank": FITB_HANDLER,
  "select_lines": SL_HANDLER,
  "code_editor": CODE_EDITOR_HANDLER,
  "fitb_drop": FITB_DROP_HANDLER,
  "iframe": IFRAME_HANDLER,
};

export function parse_submission<QT extends ResponseKind>(kind: QT, rawSubmission: string | null | undefined): ParsedSubmission<QT> {
  return RESPONSE_HANDLERS[kind].parse(rawSubmission);
}

export function validate_submission<QT extends ResponseKind>(response: ResponseSpecification<QT>, submission: WellFormedSubmission<QT>): CheckedSubmission<QT> {
  let handler = <ResponseHandler<QT>>RESPONSE_HANDLERS[response.kind];
  return handler.validate(response, submission);
}

export function render_response<QT extends ResponseKind>(response: ResponseSpecification<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin): string {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[<QT>response.kind]).render(response, question_id, question_uuid, skin);
}

export function render_solution<QT extends ResponseKind>(response: ResponseSpecification<QT>, solution: ValidSubmission<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin): string {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[<QT>response.kind]).render_solution(response, solution, question_id, question_uuid, skin);
}

export function activate_response<QT extends ResponseKind>(kind: QT, is_sample_solution: boolean, responseElem: JQuery): void {
  let activateFn = (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[kind]).activate;
  activateFn && activateFn(responseElem, is_sample_solution);
}

export function extract_response<QT extends ResponseKind>(kind: QT, responseElem: JQuery): SubmissionType<QT> {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[kind]).extract(responseElem);
}

export function stringify_response<QT extends ResponseKind>(submission: SubmissionType<QT>) {
  return typeof submission === "string" ? submission : JSON.stringify(submission);
}

export function fill_response<QT extends ResponseKind>(elem: JQuery, kind: QT, response: ValidSubmission<QT>): void {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[kind]).fill(elem, response);
}

export function response_specification_diff(response1: ResponseSpecification<ResponseKind>, response2: ResponseSpecification<ResponseKind>): ResponseSpecificationDiff | undefined {
  if (response1.kind !== response2.kind) {
    return { incompatible: true };
  }
  const diff = RESPONSE_HANDLERS[response1.kind].diff(<any>response1, <any>response2);
  return is_empty_response_diff(diff) ? undefined : diff;
}
