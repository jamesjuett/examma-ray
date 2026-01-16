import deepEqual from "deep-equal";
import { ResponseKind } from "../response/common";
import { assert } from "./util";

type QuestionSubmissionBase<Transparent extends boolean, Responses extends boolean> = {
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

export type OpaqueQuestionManifest = QuestionSubmissionBase<false, false>;
export type TransparentQuestionManifest = QuestionSubmissionBase<true, false>;

export type QuestionManifest = OpaqueQuestionManifest | TransparentQuestionManifest;

export type TransparentQuestionSubmission = QuestionSubmissionBase<true, true>;
export type OpaqueQuestionSubmission = QuestionSubmissionBase<false, true>;

export type QuestionSubmission = TransparentQuestionSubmission | OpaqueQuestionSubmission;

export function questionSubmissionHasResponse<Transparent extends boolean>(
  q: QuestionSubmissionBase<Transparent, true> | QuestionSubmissionBase<Transparent, false>
) : q is QuestionSubmissionBase<Transparent, true> {
  return (q as QuestionSubmissionBase<Transparent, true>).response !== undefined;
}

type SectionSubmissionBase<Transparent extends boolean, Responses extends boolean> = {
  uuid: string,
  display_index: string,
  questions: QuestionSubmissionBase<Transparent, Responses>[]
} & (Transparent extends true ? {
  section_id: string,
  skin_id: string,
} : {});

export type OpaqueSectionManifest = SectionSubmissionBase<false, false>;
export type TransparentSectionManifest = SectionSubmissionBase<true, false>;

export type SectionManifest = OpaqueSectionManifest | TransparentSectionManifest;

export type TransparentSectionSubmission = SectionSubmissionBase<true, true>;
export type OpaqueSectionSubmission = SectionSubmissionBase<false, true>;

export type SectionSubmission = TransparentSectionSubmission | OpaqueSectionSubmission

type ExamSubmissionBase<Trusted extends boolean, Transparent extends boolean, Responses extends boolean> = {
  exam_id: string,
  uuid: string,
  student: {
    uniqname: string,
    name: string
  },
  time_started?: number,
  timestamp: number,
  saverId: number,
  sections: SectionSubmissionBase<Transparent, Responses>[],
} & (Trusted extends true ? {
  trusted: true,
} : {}) & (Transparent extends true ? {
  transparent: true,
} : {});

// export type OpaqueExamSubmission = ExamSubmissionBase<boolean, false>;
// export type TransparentExamSubmission = ExamSubmissionBase<boolean, true>;

// export type TrustedExamSubmission<Transparent extends boolean = false> = ExamSubmissionBase<true, Transparent>;

// type ExamManifest<Transparent extends boolean = false> = TrustedExamSubmission<Transparent>;

export type OpaqueExamManifest = ExamSubmissionBase<true, false, false>;
export type TransparentExamManifest = ExamSubmissionBase<true, true, false>;

export type ExamManifest = OpaqueExamManifest | TransparentExamManifest;

export type OpaqueExamSubmission = ExamSubmissionBase<false, false, true>;
export type TransparentExamSubmission = ExamSubmissionBase<false, true, true>;

export type ExamSubmission = OpaqueExamSubmission | TransparentExamSubmission;

export type TrustedExamSubmission = ExamSubmissionBase<true, true, true>;

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
  manifest.sections.forEach(s => s.questions.forEach(q => (q as QuestionSubmission).response = submittedMap[q.uuid] ?? ""));

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

export function isExamManifest(content: ExamSubmissionBase<boolean, boolean, boolean>) : content is ExamManifest {
  return !!((content as ExamManifest).trusted);
}

export function isTransparentExamManifest(manifest: ExamManifest) : manifest is TransparentExamManifest {
  return !!(manifest as TransparentExamManifest).transparent;
}

export function parseExamManifest(str: string) : ExamManifest {
  const content = <ExamSubmissionBase<boolean, boolean, boolean>>JSON.parse(str);
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

export function stringifyExamSubmission(content: ExamSubmissionBase<boolean, boolean, boolean>) {
  return JSON.stringify(content, null, 2);
}

export function isBlankSubmission(submission: ExamSubmission) {
  return submission.sections.every(s => s.questions.every(q => q.response === ""));
}

export function hasResponses<Trusted extends boolean, Transparent extends boolean>(exam_content: ExamSubmissionBase<Trusted, Transparent, boolean>) : exam_content is ExamSubmissionBase<Trusted, Transparent, true> {
  return exam_content.sections.every(s => s.questions.every(q => {
    const qq = <QuestionSubmission>q;
    return qq.response || qq.response == "";
  }));
}

export function areExamSubmissionsEquivalent(sub1: ExamSubmission, sub2: ExamSubmission) {
  const {timestamp: ts1, ...sub1_without_ts} = sub1;
  const {timestamp: ts2, ...sub2_without_ts} = sub2;
  return deepEqual(sub1_without_ts, sub2_without_ts);
}