import { ResponseKind } from "./response/common";
import { assert } from "./util";

export type QuestionAnswer = {
  question_id: string,
  uuid: string,
  display_index: string,
  kind: ResponseKind,
  response: string,
  marked_for_regrade?: boolean,
  regrade_request?: string
};

export type SectionAnswers = {
  section_id: string,
  uuid: string,
  display_index: string,
  questions: QuestionAnswer[]
};

export type ExamSubmission<V extends boolean = boolean> = {
  exam_id: string,
  uuid: string,
  student: {
    uniqname: string,
    name: string
  },
  timestamp: number,
  saverId: number,
  trusted: V,
  sections: SectionAnswers[]
};

export type TrustedExamSubmission = ExamSubmission<true>;

export type ExamManifest = TrustedExamSubmission;

/**
 * Fills in the (presumed blank) question responses in the provided manifest
 * with the student submitted answers for the questions with corresponding IDs.
 * This should always be used with manifests loaded from the saved manifest files
 * created on exam generation, since otherwise students could just e.g. change
 * the question IDs, point values, etc. in their submitted answers file.
 * This changes the provided manifest object and returns it (casted to a `TrustedExamAnswers`)
 */
export function fillManifest(manifest: ExamSubmission, submitted: ExamSubmission) : TrustedExamSubmission {

  assert(manifest.uuid === submitted.uuid, "Mismatch between manifest UUID and submitted UUID.");

  // Map of submitted UUIDs to responses
  let submittedMap : {[index: string]: string} = {};
  submitted.sections.forEach(s => s.questions.forEach(q => submittedMap[q.uuid] = q.response));

  // Go through questions in the manifest and look for a response that matches the uuid
  manifest.sections.forEach(s => s.questions.forEach(q => q.response = submittedMap[q.uuid]));
  manifest.trusted = true;
  return <TrustedExamSubmission>manifest;
}




