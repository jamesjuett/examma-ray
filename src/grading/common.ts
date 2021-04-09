import { QuestionAnswer } from "../submissions";
import { AssignedQuestion } from "../exams";

export type GradingAssignmentSpecification = {
  staff_uniqname: string,
  assigned_questions: QuestionAnswer
};


export class GradingAssignment {

  public readonly staffUniqname: string;
  public readonly assignedQuestions: readonly AssignedQuestion[];

}

export type GradingAssignment = {

}