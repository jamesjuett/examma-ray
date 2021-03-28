import { decode } from "he";
import { Question, QuestionSkin } from "../exams";
import { ResponseKind } from "../response/common";
import { SubmissionType } from "../response/responses";

export interface Grader<QT extends ResponseKind = ResponseKind> {
  readonly questionType: QT;
  grade(question: Question<QT>, submission: SubmissionType<QT>): number;
  renderReport(question: Question<QT>, submission: SubmissionType<QT>, questionSkin: QuestionSkin | undefined): string;
  renderStats(question: Question<QT>, submissions: readonly SubmissionType<QT>[]): string;
  renderOverview(question: Question<QT>, submissions: readonly SubmissionType<QT>[]): string;

};

export function isGrader<QT extends ResponseKind>(grader: Grader, questionType: QT) : grader is Grader<QT> {
  return grader.questionType === questionType;
}



