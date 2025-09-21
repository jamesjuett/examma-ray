import { ExamComponentSkin } from "../core/skins";
import { CODE_EDITOR_HANDLER, CodeEditorSpecification, CodeEditorSubmission } from "./code_editor";
import { ResponseKind } from "./common";
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

// export type ResponseValidity =
//   "malformed" |
//   "blank" |
//   "invalid" |
//   "viable";

export type MalformedSubmission = { readonly validity: "malformed", raw: string };
export type BlankSubmission = { readonly validity: "blank" };
export type UncheckedSubmission<QT extends ResponseKind> = { validity: "unchecked", encoding: SubmissionType<QT> }
export type InvalidSubmission<QT extends ResponseKind> = { readonly validity: "invalid", encoding: SubmissionType<QT> };
export type ViableSubmission<QT extends ResponseKind> = { readonly validity: "viable", encoding: SubmissionType<QT> };

export type AnySubmission<QT extends ResponseKind> =
  | MalformedSubmission
  | BlankSubmission
  | UncheckedSubmission<QT>
  | InvalidSubmission<QT>
  | ViableSubmission<QT>;

export type ParsedSubmission<QT extends ResponseKind> =
  | MalformedSubmission
  | BlankSubmission
  | UncheckedSubmission<QT>;
  // Note: We don't include InvalidSubmission and ViableSubmission here
  // because validity generally cannot be determined by parsing, instead
  // it requires validation against a specific response specification.

export type WellFormedSubmission<QT extends ResponseKind> = Exclude<AnySubmission<QT>, MalformedSubmission>;

export type CheckedSubmission<QT extends ResponseKind> = Exclude<WellFormedSubmission<QT>, UncheckedSubmission<QT>>;

// export type NonBlankSubmission<QT extends ResponseKind> =
//   | InvalidSubmission<QT>
//   | ViableSubmission<QT>;

export type ValidSubmission<QT extends ResponseKind> = Exclude<CheckedSubmission<QT>, InvalidSubmission<QT>>;


/**
 * Creates a wrapper representing a raw submission that
 * could not be parsed successfully into a well-formed encoding.
 */
export function MALFORMED_SUBMISSION(raw_submission: string) : MalformedSubmission {
  return { validity: "malformed", raw: raw_submission };
}

const _blank_submission : BlankSubmission = Object.freeze({ validity: "blank" });

/**
 * Returns the representation of a blank submission.
*/
export function BLANK_SUBMISSION() : BlankSubmission {
  return _blank_submission;
}

/**
 * Creates a wrapper representing an unchecked submission.
 */
export function UNCHECKED_SUBMISSION<QT extends ResponseKind>(encoding: SubmissionType<QT>) : UncheckedSubmission<QT> {
  return { validity: "unchecked", encoding: encoding };
}

/**
 * Creates a wrapper representing a submission that has been
 * checked and determined to be invalid.
 */
export function INVALID_SUBMISSION<QT extends ResponseKind>(encoding: SubmissionType<QT>) : InvalidSubmission<QT> {
  return { validity: "invalid", encoding: encoding };
}

/**
 * Creates a wrapper representing a submission that has been
 * checked and determined to be viable.
 */
export function VIABLE_SUBMISSION<QT extends ResponseKind>(encoding: SubmissionType<QT>) : ViableSubmission<QT> {
  return { validity: "viable", encoding: encoding };
}

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
  parse: (rawSubmission: string | null | undefined) => ParsedSubmission<QT>,
  validate: (response: ResponseSpecification<QT>, submission: WellFormedSubmission<QT>) => CheckedSubmission<QT>,
  render: (response: ResponseSpecification<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) => string,
  render_solution: (response: ResponseSpecification<QT>, solution: ValidSubmission<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) => string,
  activate?: (responseElem: JQuery, is_sample_solution: boolean) => void,
  extract: (responseElem: JQuery) => SubmissionType<QT>,
  fill: (elem: JQuery, submission: ValidSubmission<QT>) => void,
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

export function parse_submission<QT extends ResponseKind>(kind: QT, rawSubmission: string | null | undefined) : ParsedSubmission<QT> {
  return RESPONSE_HANDLERS[kind].parse(rawSubmission);
}

export function validate_submission<QT extends ResponseKind>(response: ResponseSpecification<QT>, submission: WellFormedSubmission<QT>) : CheckedSubmission<QT> {
  let handler = <ResponseHandler<QT>>RESPONSE_HANDLERS[response.kind];
  return handler.validate(response, submission);
}

// export function is_blank_submission<QT extends ResponseKind>(submission: CheckedSubmission<QT>) : submission is BlankSubmission {
//   return submission.validity === "blank";
// }

// export function is_invalid_submission<QT extends ResponseKind>(submission: CheckedSubmission<QT>) : submission is InvalidSubmission<QT> {
//   return submission.validity === "invalid";
// }

// export function is_viable_submission<QT extends ResponseKind>(submission: CheckedSubmission<QT>) : submission is ViableSubmission<QT> {
//   return submission.validity === "viable";
// }

export function render_response<QT extends ResponseKind>(response: ResponseSpecification<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) : string {
  return (<ResponseHandler<QT>><unknown>RESPONSE_HANDLERS[<QT>response.kind]).render(response, question_id, question_uuid, skin);
}

export function render_solution<QT extends ResponseKind>(response: ResponseSpecification<QT>, solution: ValidSubmission<QT>, question_id: string, question_uuid: string, skin?: ExamComponentSkin) : string {
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
  return typeof submission === "string" ? submission : JSON.stringify(submission);
}

export function fill_response<QT extends ResponseKind>(elem: JQuery, kind: QT, response: ValidSubmission<QT>) : void {
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