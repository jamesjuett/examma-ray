import { ResponseKind } from "./response/common";

export type QuestionAnswer = {
  id: string;
  display_index: string;
  kind: ResponseKind;
  response: string;
};

export type SectionAnswers = {
  id: string;
  display_index: string;
  questions: QuestionAnswer[];
};

export type ExamSubmission<V extends boolean = boolean> = {
  exam_id: string;
  student: {
    uniqname: string,
    name: string
  },
  timestamp: number;
  saverId: number;
  trusted: V;
  sections: SectionAnswers[];
};

export type TrustedExamSubmission = ExamSubmission<true>;

/**
 * Fills in the (presumed blank) question responses in the provided manifest
 * with the student submitted answers for the questions with corresponding IDs.
 * This should always be used with manifests loaded from the saved manifest files
 * created on exam generation, since otherwise students could just e.g. change
 * the question IDs, point values, etc. in their submitted answers file.
 * This changes the provided manifest object and returns it (casted to a `TrustedExamAnswers`)
 */
export function fillManifest(manifest: ExamSubmission, submitted: ExamSubmission) : TrustedExamSubmission {
  let submittedMap : {[index: string]: string} = {};
  submitted.sections.forEach(s => s.questions.forEach(q => submittedMap[q.id] = q.response));
  manifest.sections.forEach(s => s.questions.forEach(q => q.response = submittedMap[q.id]));
  manifest.trusted = true;
  return <TrustedExamSubmission>manifest;
}




