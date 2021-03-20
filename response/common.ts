export type ResponseKind =
  "multiple_choice" |
  "code_fitb" |
  "select_a_statement";

export const MALFORMED_SUBMISSION = Symbol("malformed_submission");
export const BLANK_SUBMISSION = Symbol("blank_submission");

