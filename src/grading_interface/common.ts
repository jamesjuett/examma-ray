import { GradingResult } from "../core/QuestionGrader";
import { ResponseKind } from "../core/response/common";
import { SkinReplacements } from "../core/skins";
import { StudentInfo } from "../core/exam_specification";

export type GradingSubmission<QT extends ResponseKind = ResponseKind> = {
  question_uuid: string,
  skin_replacements: SkinReplacements,
  student: StudentInfo,
  response: string
}

export type GradingGroup<QT extends ResponseKind = ResponseKind, GR extends GradingResult = GradingResult> = {
  name: string,
  submissions: GradingSubmission<QT>[],
  representative_index: number,
  grading_result: GR | undefined
}

export type GradingAssignmentSpecification<QT extends ResponseKind = ResponseKind, GR extends GradingResult = GradingResult> = {
  name?: string,
  exam_id: string,
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