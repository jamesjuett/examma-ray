/**
 * The possible discriminants for different kinds of responses.
 */
export type ResponseKind =
  "multiple_choice" |
  "fitb" |
  "select_a_statement" |
  "code_editor" |
  "fitb_drop";

/**
 * Represents a blank submission. For example, if a student does not select
 * any choices for an MC response or does not fill in any blanks on an FITB
 * response, a blank submission results (rather than e.g. an empty array).
*/
export const BLANK_SUBMISSION = Symbol("blank_submission");

/**
 * Represents a malformed submission that results from a failed attempt
 * to parse a submission from a text representation.
 */
export const MALFORMED_SUBMISSION = Symbol("malformed_submission");

