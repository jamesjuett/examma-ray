import { decode } from "he";
import { AssignedQuestion, GradedQuestion, Question } from "../exams";
import { ResponseKind } from "../response/common";
import { SubmissionType } from "../response/responses";
import { QuestionSkin } from "../skins";


export type GradingResult = {
  pointsEarned: number,
  blankSubmission: boolean
}

export interface Grader<QT extends ResponseKind = ResponseKind, GR extends GradingResult = GradingResult> {
  readonly questionType: QT;
  grade(aq: AssignedQuestion<QT>): GR;
  renderReport(aq: GradedQuestion<QT, GR>): string;
  renderStats(aqs: readonly AssignedQuestion<QT>[]): string;
  renderOverview(aqs: readonly AssignedQuestion<QT>[]): string;

};

export function isGrader<QT extends ResponseKind>(grader: Grader, questionType: QT) : grader is Grader<QT> {
  return grader.questionType === questionType;
}

export function wasGradedBy<QT extends ResponseKind, GR extends GradingResult>(aq: AssignedQuestion, grader: Grader<QT, GR>) : aq is GradedQuestion<QT,GR> {
  return aq.gradedBy === grader;
};


