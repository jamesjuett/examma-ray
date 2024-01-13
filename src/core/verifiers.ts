

export type GraderSelectionStrategy = 
  | "default_grader";

export type QuestionVerifierSpecification = 
  | FullPoints;

type FullPoints = {
  verification_strategy: "full_points";
  grader_selection_strategy?: GraderSelectionStrategy;
};

export type ExamVerifierSpecification = 
  | AllVerified;



type AllVerified = {
  verification_strategy: "all_verified";
};