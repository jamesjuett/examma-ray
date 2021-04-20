import { QuestionAnswer } from "../submissions";
import { AssignedQuestion, StudentInfo } from "../exams";
import { GradingResult } from "../QuestionGrader";
import { SubmissionType } from "../response/responses";
import { ResponseKind } from "../response/common";

export type GradingSubmission<QT extends ResponseKind = ResponseKind, GR extends GradingResult = GradingResult> = {
  question_uuid: string,
  student: StudentInfo,
  response: SubmissionType<QT>
}

export type GradingGroup<QT extends ResponseKind = ResponseKind, GR extends GradingResult = GradingResult> = {
  name: string,
  submissions: GradingSubmission<QT,GR>[],
  representative_index: number,
  grading_result?: GR
}

export type GradingAssignmentSpecification<QT extends ResponseKind = ResponseKind, GR extends GradingResult = GradingResult> = {
  staff_uniqname: string,
  question_id: string,
  groups: GradingGroup<QT,GR>[]
};


// export class GradingAssignment {

//   public readonly staffUniqname: string;
//   public readonly assignedQuestions: readonly AssignedQuestion[];

// }

export type QuestionGradingRecord<GR extends GradingResult> = {
  exam_uuid: string,
  student: StudentInfo,
  staff_uniqname: string,
  question_uuid: string,
  grading_result: GR
};

export interface QuestionGradingRecords<GR extends GradingResult> {
  // mapping from question uuid to grading record
  getGradingRecord(question_uuid: string) : QuestionGradingRecord<GR>;
}