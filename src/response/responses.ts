import { CODE_FITB_HANDLER, FITBSpecification, FITBSubmission } from "./fitb";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION, ResponseKind } from "./common";
import { MCSpecification, MCSubmission, MC_HANDLER } from "./multiple_choice";
import { SASSpecification, SASSubmission, SAS_HANDLER } from "./select_a_statement";
import { CodeEditorSpecification, CodeEditorSubmission, CODE_EDITOR_HANDLER } from "./code_editor";
import { QuestionSkin } from "../skins";

export type ResponseSpecification<QT extends ResponseKind> =
  QT extends "multiple_choice" ? MCSpecification :
  QT extends "fitb" ? FITBSpecification :
  QT extends "select_a_statement" ? SASSpecification :
  QT extends "code_editor" ? CodeEditorSpecification :
  never;

export type SubmissionType<QT extends ResponseKind> =
  QT extends "multiple_choice" ? MCSubmission :
  QT extends "fitb" ? FITBSubmission :
  QT extends "select_a_statement" ? SASSubmission :
  QT extends "code_editor" ? CodeEditorSubmission :
  never;


export type ResponseHandler<QT extends ResponseKind> = {
  parse: (rawSubmission: string | null | undefined) => SubmissionType<QT> | typeof MALFORMED_SUBMISSION,
  render: (response: ResponseSpecification<QT>, question_id: string, skin?: QuestionSkin) => string,
  activate?: () => void,
  extract: (responseElem: JQuery) => SubmissionType<QT>,
  fill: (elem: JQuery, submission: SubmissionType<QT>) => void
};

export const RESPONSE_HANDLERS : {
  [QT in ResponseKind]: ResponseHandler<QT>
} = {
  "multiple_choice": MC_HANDLER,
  "fitb": CODE_FITB_HANDLER,
  "select_a_statement": SAS_HANDLER,
  "code_editor": CODE_EDITOR_HANDLER
};

export function parse_submission<QT extends ResponseKind>(kind: QT, rawSubmission: string | null | undefined) : SubmissionType<QT> {
  return <SubmissionType<QT>>RESPONSE_HANDLERS[kind].parse(rawSubmission);
}

export function render_response<QT extends ResponseKind>(response: ResponseSpecification<QT>, question_id: string, skin?: QuestionSkin) : string {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[<QT>response.kind]).render(response, question_id, skin);
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