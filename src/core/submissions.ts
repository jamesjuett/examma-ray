import { ResponseKind } from "../response/common";
import { assert } from "./util";

type QuestionAnswerBase<Transparent extends boolean, Responses extends boolean> = {
  uuid: string,
  display_index: string,
  kind: ResponseKind,
  marked_for_regrade?: boolean,
  regrade_request?: string
} & (Transparent extends true ? {
  question_id: string,
  skin_id: string,
} : {}) & (Responses extends true ? {
  response: string,
} : {});

export type TransparentQuestionAnswer = QuestionAnswerBase<true, true>;
export type OpaqueQuestionAnswer = QuestionAnswerBase<false, true>;
export type QuestionAnswer = TransparentQuestionAnswer | OpaqueQuestionAnswer

type SectionAnswersBase<Transparent extends boolean, Responses extends boolean> = {
  uuid: string,
  display_index: string,
  questions: QuestionAnswerBase<Transparent, Responses>[]
} & (Transparent extends true ? {
  section_id: string,
  skin_id: string,
} : {});

export type TransparentSectionAnswers = SectionAnswersBase<true, true>;
export type OpaqueSectionAnswers = SectionAnswersBase<false, true>;
export type SectionAnswers = TransparentSectionAnswers | OpaqueSectionAnswers

type ExamContentBase<Trusted extends boolean, Transparent extends boolean, Responses extends boolean> = {
  exam_id: string,
  uuid: string,
  student: {
    uniqname: string,
    name: string
  },
  time_started?: number,
  timestamp: number,
  saverId: number,
  sections: SectionAnswersBase<Transparent, Responses>[],
} & (Trusted extends true ? {
  trusted: true,
} : {}) & (Transparent extends true ? {
  transparent: true,
} : {});

// export type OpaqueExamSubmission = ExamContentBase<boolean, false>;
// export type TransparentExamSubmission = ExamContentBase<boolean, true>;

// export type TrustedExamSubmission<Transparent extends boolean = false> = ExamContentBase<true, Transparent>;

// type ExamManifest<Transparent extends boolean = false> = TrustedExamSubmission<Transparent>;

export type OpaqueExamManifest = ExamContentBase<true, false, false>;
export type TransparentExamManifest = ExamContentBase<true, true, false>;

export type ExamManifest = OpaqueExamManifest | TransparentExamManifest;

export type OpaqueExamSubmission = ExamContentBase<false, false, true>;
export type TransparentExamSubmission = ExamContentBase<false, true, true>;

export type ExamSubmission = OpaqueExamSubmission | TransparentExamSubmission;

export type TrustedExamSubmission = ExamContentBase<true, true, true>;

/**
 * Fills in the (presumed blank) question responses in the provided manifest
 * with the student submitted answers for the questions with corresponding IDs.
 * This should always be used with manifests loaded from the saved manifest files
 * created on exam generation, since otherwise students could just e.g. change
 * the question IDs, point values, etc. in their submitted answers file.
 * This changes the provided manifest object and returns it (casted to a `TrustedExamSubmission`)
 */
export function fillManifest(manifest: TransparentExamManifest, submitted: ExamSubmission) : TrustedExamSubmission {

  assert(manifest.uuid === submitted.uuid, "Mismatch between manifest UUID and submitted UUID.");

  // Map of submitted UUIDs to responses
  let submittedMap : {[index: string]: string | undefined} = {};
  submitted.sections.forEach(s => s.questions.forEach(q => submittedMap[q.uuid] = q.response));

  // Go through questions in the manifest and look for a response that matches the uuid
  manifest.sections.forEach(s => s.questions.forEach(q => (q as QuestionAnswer).response = submittedMap[q.uuid] ?? ""));

  // This cast is ok because we added a response for each via the line above.
  // Could also be verified by the assert, but that is removed for efficiency.
  // assert(hasResponses(manifest));
  return <TrustedExamSubmission>manifest;
}

export function makeOpaque(manifest: TransparentExamManifest) : OpaqueExamManifest {
  const {transparent, sections, ...other_exam} = manifest;
  return {
    ...other_exam,
    sections: sections.map(s => {
      const {section_id, skin_id, questions, ...other_section} = s;
      return {
        ...other_section,
        questions: questions.map(q => {
          const {question_id, skin_id, ...other_question} = q;
          return {
            ...other_question
          };
        })
      };
    })
  }
}

export function isExamManifest(content: ExamContentBase<boolean, boolean, boolean>) : content is ExamManifest {
  return !!((content as ExamManifest).trusted);
}

export function isTransparentExamManifest(manifest: ExamManifest) : manifest is TransparentExamManifest {
  return !!(manifest as TransparentExamManifest).transparent;
}

export function parseExamManifest(str: string) : ExamManifest {
  const content = <ExamContentBase<boolean, boolean, boolean>>JSON.parse(str);
  assert(isExamManifest(content));
  return content;
}

// export function isTransparentSubmission(sub: ExamSubmission) : sub is TransparentExamManifest {
//   return !!sub.transparent;
// }

export function createManifestFilenameBase(uniqname: string, exam_uuid: string) {
  return uniqname + "-" + exam_uuid;
}

export function parseExamSubmission(str: string) {
  return <ExamSubmission>JSON.parse(str);
}

export function stringifyExamContent(content: ExamContentBase<boolean, boolean, boolean>) {
  return JSON.stringify(content, null, 2);
}

export function isBlankSubmission(submission: ExamSubmission) {
  return submission.sections.every(s => s.questions.every(q => q.response === ""));
}

export function hasResponses<Trusted extends boolean, Transparent extends boolean>(exam_content: ExamContentBase<Trusted, Transparent, boolean>) : exam_content is ExamContentBase<Trusted, Transparent, true> {
  return exam_content.sections.every(s => s.questions.every(q => {
    const qq = <QuestionAnswer>q;
    return qq.response || qq.response == "";
  }));
}