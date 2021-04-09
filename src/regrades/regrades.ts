
export type QuestionRegradeRequest = {
  uuid: string,
  display_index: string,
  marked_for_regrade: boolean,
  regrade_request?: string,
};

export type SectionRegradeRequest = {
  uuid: string,
  display_index: string,
  question_requests: QuestionRegradeRequest[]
};

export type ExamRegradeRequest = {
  exam_id: string,
  uuid: string,
  student: {
    uniqname: string,
    name: string
  },
  timestamp: number,
  saverId: number,
  section_requests: SectionRegradeRequest[]
};