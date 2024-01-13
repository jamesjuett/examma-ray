

type GraderSelectionStrategy = 
  | "default_grader";

type QuestionVerificationStrategy = 
  | "full_points";

export type QuestionVerifierSpecification = {

  grader_selection_strategy: GraderSelectionStrategy;

  verification_strategy: QuestionVerificationStrategy;

};