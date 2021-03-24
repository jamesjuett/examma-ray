export type ResponseKind =
  "multiple_choice" |
  "fitb" |
  "select_a_statement" |
  "code_editor";

export const MALFORMED_SUBMISSION = Symbol("malformed_submission");
export const BLANK_SUBMISSION = Symbol("blank_submission");

