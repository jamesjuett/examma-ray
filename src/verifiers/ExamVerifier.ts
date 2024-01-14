

export type ExamVerifierSpecification = 
  | AllVerified;

type AllVerified = {
  verification_strategy: "all_verified";
};