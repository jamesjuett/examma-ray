import { AssignedQuestion } from "../core/assigned_exams";
import { assertNever } from "../core/util";
import { ResponseKind } from "../response/common";
import { FullCreditVerifier, FullCreditVerifierSpecification } from "./FullCreditVerifier";

export interface QuestionVerifier<RK extends ResponseKind = ResponseKind> {

  /**
   * Returns whether or not the given submission is verified.
   * @param sub The submission to verify
   */
  verify(aq: AssignedQuestion<RK>): boolean;

  /**
   * Renders HTML elements to report verification status. This function is called
   * exactly once for the status badge element when the question in initally rendered.
   * @param elem The HTML element for the status badge.
   */
  renderStatusBadge(aq: AssignedQuestion<RK>) : string;
  
  /**
   * Updates the elements to report verification status.
   * @param elem The HTML element for the status badge.
   */
  updateStatusBadge(aq: AssignedQuestion<RK>, elem: JQuery) : void;

};

export type QuestionVerifierSpecification =
  | FullCreditVerifierSpecification;

// export type QuestionVerifier<VK extends QuestionVerifierKind = QuestionVerifierKind> =
//   VK extends "full_credit" ? FullCreditVerifier :
//   never;

// type ExtractViableVerifiers<V extends QuestionVerifier, RK> = V extends QuestionVerifier ? RK extends V["t_response_kinds"] ? V : never : never;

// export type QuestionVerifierSpecificationFor<RK extends ResponseKind> = ExtractViableVerifiers<QuestionVerifier, RK>["spec"];
// export type VerifierFor<RK extends ResponseKind> = ExtractViableVerifiers<QuestionVerifier, RK>;

export function realizeVerifier(spec: QuestionVerifierSpecification) : QuestionVerifier {
  return (
    spec.verifier_kind === "full_credit" ? new FullCreditVerifier(spec) :
    assertNever(spec.verifier_kind)
  );
}
