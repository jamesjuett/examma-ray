import { ResponseKind } from "./response/common";

export type QuestionAnswerJSON = {
  id: string;
  display_index: string;
  kind: ResponseKind;
  response: string;
};

export type SectionAnswersJSON = {
  id: string;
  display_index: string;
  questions: QuestionAnswerJSON[];
};

export type ExamAnswersJSON = {
  exam_id: string;
  student: {
    uniqname: string,
    name: string
  },
  timestamp: number;
  sections: SectionAnswersJSON[];
}