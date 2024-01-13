import { AssignedQuestion } from "../core/assigned_exams";
import { assertNever } from "../core/util";
import { ResponseKind } from "../response/common";
import { SubmissionType } from "../response/responses";


export interface QuestionVerifier<RK extends ResponseKind = ResponseKind> {

  /**
   * Returns whether or not this verifier can be used for the given response kind
   * @param responseKind 
   */
  isVerifier<T extends ResponseKind>(responseKind: T): this is QuestionVerifier<T>;

  /**
   * Returns whether or not the given submission is verified.
   * @param sub The submission to verify
   */
  verify(submission: SubmissionType<RK>): boolean;

  /**
   * Renders HTML elements to report verification status. This function is called
   * exactly once for the status badge element when the question in initally rendered.
   * @param elem The HTML element for the status badge.
   */
  renderStatusBadge(aq: AssignedQuestion<RK>) : void;
  
  /**
   * Updates the elements to report verification status.
   * @param elem The HTML element for the status badge.
   */
  updateStatusBadge(elem: JQuery) : void;

};


type VerifierKind = 
  | "grader";

export type VerifierSpecification<VK extends VerifierKind = VerifierKind> =
  VK extends "grader" ? GraderVerifierSpecification :
  never;

export type Verifier<VK extends VerifierKind = VerifierKind> =
  VK extends "grader" ? GraderVerifier :
  never;

type ExtractViableVerifiers<V extends Verifier, RK> = V extends Verifier ? RK extends V["t_response_kinds"] ? G : never : never;

export type VerifierSpecificationFor<RK extends ResponseKind> = ExtractViableVerifiers<Verifier, RK>["spec"];
export type VerifierFor<RK extends ResponseKind> = ExtractViableVerifiers<Verifier, RK>;

export function realizeVerifier<VK extends VerifierKind>(spec: VerifierSpecification<VK>) : Verifier<VK> {
  return <Verifier<VK>>(
    spec.verifier_kind === "grader" ? new GraderVerifier(spec) :
    assertNever(spec)
  );
}


export type GradingResult = {
  wasBlankSubmission: boolean
}

export type ImmutableGradingResult = GradingResult & {
  readonly pointsEarned: number;
  readonly wasBlankSubmission: boolean;
  readonly wasInvalidSubmission?: boolean;
}
