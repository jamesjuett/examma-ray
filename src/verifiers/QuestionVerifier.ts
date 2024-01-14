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


type VerifierKind = 
  | "full_credit";

export type VerifierSpecification<VK extends VerifierKind = VerifierKind> =
  VK extends "full_credit" ? FullCreditVerifierSpecification :
  never;

export type Verifier<VK extends VerifierKind = VerifierKind> =
  VK extends "full_credit" ? FullCreditVerifier :
  never;

type ExtractViableVerifiers<V extends Verifier, RK> = V extends Verifier ? RK extends V["t_response_kinds"] ? V : never : never;

export type VerifierSpecificationFor<RK extends ResponseKind> = ExtractViableVerifiers<Verifier, RK>["spec"];
export type VerifierFor<RK extends ResponseKind> = ExtractViableVerifiers<Verifier, RK>;

export function realizeVerifier<VK extends VerifierKind>(spec: VerifierSpecification<VK>) : Verifier<VK> {
  return <Verifier<VK>>(
    spec.verifier_kind === "full_credit" ? new FullCreditVerifier(spec) :
    assertNever(spec.verifier_kind)
  );
}
