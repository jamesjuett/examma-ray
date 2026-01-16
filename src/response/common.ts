import { BlankSubmission, MalformedSubmission } from "./responses";

/**
 * The possible discriminants for different kinds of responses.
 */
export type ResponseKind =
  "multiple_choice" |
  "fill_in_the_blank" |
  "select_lines" |
  "code_editor" |
  "fitb_drop" |
  "iframe";