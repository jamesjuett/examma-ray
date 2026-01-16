import { ExamComponentSkin } from "../core/skins";
import { CodeEditorSpecification, CodeEditorSubmission } from "./code_editor";
import { ResponseKind } from "./common";
import { FITBSpecification, FITBSubmission } from "./fitb";
import { FITBDropSpecification, FITBDropSubmission } from "./fitb-drop";
import { IFrameResponseSpecification, IFrameSubmission } from "./iframe";
import { MCSpecification, MCSubmission } from "./mc";
import { SLSpecification, SLSubmission } from "./select_lines";

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

let x : SubmissionType<"multiple_choice"> = [1, 2];

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

export function is_empty_response_diff(diff: ResponseSpecificationDiff) {
  return !Object.values(diff).some(v => v);
}