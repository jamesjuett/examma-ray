import { ExamComponentSkin } from "../core/skins";
import { CODE_EDITOR_HANDLER, CodeEditorSpecification, CodeEditorSubmission } from "./code_editor";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION, ResponseKind } from "./common";
import { FITBSpecification, FITBSubmission, FITB_HANDLER } from "./fitb";
import { FITBDropSpecification, FITBDropSubmission, FITB_DROP_HANDLER } from "./fitb-drop";
import { IFRAME_HANDLER, IFrameResponseSpecification, IFrameSubmission } from "./iframe";
import { MCSpecification, MCSubmission, MC_HANDLER } from "./mc";
import { SLSpecification, SLSubmission, SL_HANDLER } from "./select_lines";

export type ResponseSpecification<QT extends ResponseKind> =
  QT extends "multiple_choice" ? MCSpecification :
  QT extends "fill_in_the_blank" ? FITBSpecification :
  QT extends "select_lines" ? SLSpecification :
  QT extends "code_editor" ? CodeEditorSpecification :
  QT extends "fitb_drop" ? FITBDropSpecification :
  QT extends "iframe" ? IFrameResponseSpecification :
  never;

export type SubmissionType<QT extends ResponseKind> =
  QT extends "multiple_choice" ? MCSubmission :
  QT extends "fill_in_the_blank" ? FITBSubmission :
  QT extends "select_lines" ? SLSubmission :
  QT extends "code_editor" ? CodeEditorSubmission :
  QT extends "fitb_drop" ? FITBDropSubmission :
  QT extends "iframe" ? IFrameSubmission :
  never;


declare const VALID_SUBMISSION_BRAND: unique symbol;

/**
 * A branded type that represents only the valid submissions, which are those that
 * could be present in a student submission without some kind of bug or other funny
 * business. Note that [[BLANK_SUBMISSION]] is still included in this type. The
 * [[validate_submission]] function may be used as a type predicate to narrow a
 * regular (unvalidated) [[SubmissionType]] to a [[ValidSubmission]].
 */
export type ValidSubmission<ST extends SubmissionType<ResponseKind>> = ST & { [VALID_SUBMISSION_BRAND]: void };

/**
 * A helper type that gives the [[ValidSubmission]] type for a given response kind.
 */
export type ValidSubmissionType<QT extends ResponseKind> = ValidSubmission<SubmissionType<QT>>;



/**
 * A narrowed type that represents only "viable" submissions from a [[SubmissionType]],
 * which are those within the corresponding [[ValidSubmission]] type, except for
 * [[BLANK_SUBMISSION]]. In other words, these are submissions that could potentially
 * earn points or are e.g. valid to specify as a sample solution.
 */
export type ViableSubmission<ST extends SubmissionType<ResponseKind>> = Exclude<ValidSubmission<ST>, typeof BLANK_SUBMISSION>;

/**
 * A helper type that gives the [[ViableSubmission]] type for a given response kind.
 */
export type ViableSubmissionType<QT extends ResponseKind> = ViableSubmission<SubmissionType<QT>>;


/**
 * A type used to represent differences between two response specifications.
 */
export type ResponseSpecificationDiff = {
  incompatible?: boolean,
  structure?: boolean,
  content?: boolean,
  sample_solution?: boolean,
  default_grader?: boolean,
  format?: boolean,
}


export type ResponseHandler<QT extends ResponseKind> = {
  parse: (rawSubmission: string | null | undefined) => SubmissionType<QT> | typeof MALFORMED_SUBMISSION,
  validate?: (response: ResponseSpecification<QT>, submission: SubmissionType<QT>) => boolean,
  render: (response: ResponseSpecification<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) => string,
  render_solution: (response: ResponseSpecification<QT>, solution: ValidSubmissionType<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) => string,
  activate?: (responseElem: JQuery, is_sample_solution: boolean) => void,
  extract: (responseElem: JQuery) => SubmissionType<QT>,
  fill: (elem: JQuery, submission: ValidSubmissionType<QT>) => void,
  diff: (response1: ResponseSpecification<QT>, response2: ResponseSpecification<QT>) => ResponseSpecificationDiff;
};

export const RESPONSE_HANDLERS : {
  [QT in ResponseKind]: ResponseHandler<QT>
} = {
  "multiple_choice": MC_HANDLER,
  "fill_in_the_blank": FITB_HANDLER,
  "select_lines": SL_HANDLER,
  "code_editor": CODE_EDITOR_HANDLER,
  "fitb_drop": FITB_DROP_HANDLER,
  "iframe": IFRAME_HANDLER,
};

export function parse_submission<QT extends ResponseKind>(kind: QT, rawSubmission: string | null | undefined) : SubmissionType<QT> | typeof MALFORMED_SUBMISSION {
  return RESPONSE_HANDLERS[kind].parse(rawSubmission);
}

export function validate_submission<QT extends ResponseKind>(response: ResponseSpecification<QT>, submission: SubmissionType<QT>) : submission is ValidSubmissionType<QT> {
  let handler = <ResponseHandler<QT>>RESPONSE_HANDLERS[response.kind];
  return handler.validate === undefined || handler.validate(response, submission);
}

export function is_viable_submission<QT extends ResponseKind>(response: ResponseSpecification<QT>, submission: SubmissionType<QT>) : submission is ViableSubmissionType<QT> {
  return validate_submission(response, submission) && submission !== BLANK_SUBMISSION;
}

export function render_response<QT extends ResponseKind>(response: ResponseSpecification<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) : string {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[<QT>response.kind]).render(response, question_id, question_uuid, skin);
}

export function render_solution<QT extends ResponseKind>(response: ResponseSpecification<QT>, solution: ValidSubmissionType<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) : string {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[<QT>response.kind]).render_solution(response, solution, question_id, question_uuid, skin);
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

export function fill_response<QT extends ResponseKind>(elem: JQuery, kind: QT, response: ValidSubmissionType<QT>) : void {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[kind]).fill(elem, response);
}

export function response_specification_diff(response1: ResponseSpecification<ResponseKind>, response2: ResponseSpecification<ResponseKind>) : ResponseSpecificationDiff | undefined {
  if (response1.kind !== response2.kind) {
    return { incompatible: true };
  }
  const diff = RESPONSE_HANDLERS[response1.kind].diff(<any>response1, <any>response2);
  return is_empty_response_diff(diff) ? undefined : diff;
}

function is_empty_response_diff(diff: ResponseSpecificationDiff) {
  return !Object.values(diff).some(v => v);
}