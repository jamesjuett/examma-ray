import { decode } from "he";
import { AssignedQuestion, Question } from "../exams";
import { ResponseKind } from "../response/common";
import { SubmissionType } from "../response/responses";
import { QuestionSkin } from "../skins";

export interface Grader<QT extends ResponseKind = ResponseKind> {
  readonly questionType: QT;
  grade(aq: AssignedQuestion<QT>): number;
  renderReport(aq: AssignedQuestion<QT>): string;
  renderStats(aqs: readonly AssignedQuestion<QT>[]): string;
  renderOverview(aqs: readonly AssignedQuestion<QT>[]): string;

};

export function isGrader<QT extends ResponseKind>(grader: Grader, questionType: QT) : grader is Grader<QT> {
  return grader.questionType === questionType;
}



