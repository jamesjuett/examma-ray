/**
 * ## Exam Specification
 * 
 * The general structure of an exam specification is:
 *  - [[QuestionSpecification]]s with content for individual questions.
 *  - [[SectionSpecification]]s with content for sections and that specify which questions they contain.
 *  - An [[ExamSpecification]] with content for the overall exam and that specifies which sections it contains.
 * 
 * ### IDs
 * 
 * Question, section, and exam specifications require unique IDs. (They must be unique within their individual
 * component specification category - e.g. it would be ok to have a question and section with the same ID.)
 * 
 * Valid IDs must start with a letter and may contain letters, numbers, underscores, and dashes (i.e. they
 * must match the regex `/^[a-zA-Z][a-zA-Z0-9_\-]*$/`). The [[isValidID]] function tests this.
 * 
 * Student "uniqnames" are also required to meet these same criteria.
 * 
 * When a question/section/exam is assigned to a student, it is given a UUID, with these original IDs used
 * as part of the seed (assuming one of the deterministic UUID generation policies is used). So, don't change
 * the IDs after you've started giving/grading an exam (or ideally don't change them EVER once a question is
 * put into some use).
 * 
 * ### Specifying Question/Section Choosers
 * 
 * Questions within a [[SectionSpecification]] are given as a list of specific questions or [[QuestionChooser]]s
 * that assign a (potentially different) subset of questions to each individual student. You may create custom
 * question choosers or use predefined factory functions to create them:
 *  - [[RANDOM_QUESTION]]
 *  - [[RANDOM_BY_TAG]]
 * 
 * Sections within an [[ExamSpecification]] are given as a list of specific sections or [[SectionChooser]]s
 * that assign a (potentially different) subset of sections to each individual student. You may create custom
 * section choosers or use predefined factory functions to create them:
 *  - [[RANDOM_SECTION]]
 * 
 * ### Randomizing Question/Section Ordering
 * 
 * Use [[SHUFFLE]] to randomize the ordering (on a per-student basis) of a list of questions or sections.
 * 
 * ### Customizing Existing Specifications
 * 
 * Use the [[CUSTOMIZE]] function if you've got an existing specification (e.g. from a question bank) that
 * you just need to tweak slightly.
 * 
 * ### Student information
 * 
 * Presently, the only information needed for students are names and "uniqnames", which are a unique
 * identifier for each student. These must satisfy the same 
 * 
 * @module
 */

import { CHOOSE_ALL, Randomizer } from "./randomization";
import { QuestionBank } from "./QuestionBank";
import { ResponseKind } from "../response/common";
import { ResponseSpecification } from "../response/responses";
import { ExamComponentSkin } from "./skins";
import { assert, assertNever } from "./util";
import { Exam, Question, Section } from "./exam_components";
import { quantileSorted } from "simple-statistics";



export type QuestionSpecification<QT extends ResponseKind = ResponseKind> = {
  readonly component_kind?: "specification",

  /**
   * A unique ID for the question. Must be distinct from all other question IDs.
   * Also used as part of the composite seed for UUID generation
   * by an [[ExamGenerator]] using the `"plain"` or "uuidv5" strategies.
   */
  readonly question_id: string,

  /**
   * The number of points the question is worth overall.
   */
  readonly points: number,

  /**
   * Markdown-formatted question description.
   */
  readonly mk_description: string,

  /**
   * The response for this question, which is the part of the question students interact with to enter their answer.
   * Depending on the kind of response, this may also contain a significant amount of content as well.
   */
  readonly response: ResponseSpecification<QT>,

  /**
   * Tags for this question that may be used to pick it out of a question bank.
   */
  readonly tags?: readonly string[],

  /**
   * A skin for this question, or a "chooser" that selects a skin from a set of possible
   * skins. A question's skin is used in rendering its description and response.
   * @see [[core/skins]]
   */
  readonly skin?: ExamComponentSkin | SkinChooserSpecification

  /**
   * An absolute path to a directory containing media for this question. Media will be
   * available to the frontend at {{frontend_media_dir}}/question/{{question_id}}/ where
   * {{frontend_media_dir}} is configured by the exam generator (defaults to "media").
   * Tip: Use `__dirname` to get an absolute path to a media folder located in the
   * same directory as the file in which you define your specification. For example,
   * `__dirname + "/media"`.
   */
  readonly media_dir?: string;
};

export type SectionSpecification = {
  readonly component_kind?: "specification",

  /**
   * A unique ID for the section. Must be distinct from all other section IDs.
   * Also used as part of the composite seed for UUID generation
   * by an [[ExamGenerator]] using the `"plain"` or "uuidv5" strategies.
   */
  readonly section_id: string,
  
  /**
   * The section title.
   */
  readonly title: string,

  /**
   * Markdown-formatted section description, shown before its questions.
   */
  readonly mk_description: string,

  /**
   * Markdown-formatted section reference material, shown to the side of its description
   * and questions.
   */
  readonly mk_reference?: string,

  /**
   * Specifies the sequence of questions in this section. Each entry in the array may either specify
   * a particular question or a "chooser" that selects one (or more) from a set of possible
   * questions that an individual student might be assigned.
   * @see [[QuestionSpecification]]
   * @see [[QuestionChooser]]
   */
  readonly questions: readonly (QuestionSpecification | QuestionChooserSpecification)[],
  
  /**
   * A skin for this section, or a "chooser" that selects a skin from a set of possible
   * skins. A section's skin is used in rendering its description and response, and also
   * affects the rendering of its questions (each question uses a compound skin created
   * by layering its own skin on top of the section skin).
   * @see [[core/skins]]
   */
  readonly skin?: ExamComponentSkin | SkinChooserSpecification,

  /**
   * The initial width, in percent 0-100, of the reference material for this section.
   */
  reference_width?: number,


  /**
   * An absolute path to a directory containing media for this section. Media will be
   * available to the frontend at {{frontend_media_dir}}/section/{{section_id}}/ where
   * {{frontend_media_dir}} is configured by the exam generator (defaults to "media").
   * Tip: Use `__dirname` to get an absolute path to a media folder located in the
   * same directory as the file in which you define your specification. For example,
   * `__dirname + "/media"`.
   */
  readonly media_dir?: string;
}

export type ExamSpecification = {

  readonly component_kind?: "specification",

  /**
   * A unique ID for the exam. Also used as part of the composite seed for UUID generation
   * by an [[ExamGenerator]] using the `"plain"` or "uuidv5" strategies.
   */
  readonly exam_id: string,

  /**
   * Title shown at the top of the exam.
   */
  readonly title: string,

  /**
   * Markdown-formatted exam instructions, shown at the top of the exam.
   */
  readonly mk_intructions: string,

  /**
   * Specifies the sequence of sections on this exam. Each entry in the array may either specify
   * a particular section or a "chooser" that selects one (or more) from a set of possible
   * sections that an individual student might be assigned.
   * @see [[SectionSpecification]]
   * @see [[SectionChooser]]
   */
  readonly sections: readonly (SectionSpecification | SectionChooserSpecification)[],

  /**
   * Markdown-formatted announcements that will be shown in an "alert" style box at the top of the exam,
   * right below the main instructions. These are intended to stand out from the regular instructions.
   */
  readonly mk_announcements?: string[],

  /**
   * A markdown-formatted message that appears at the bottom left of the page, right above the
   * "Answers File" button. A suggested use is to specify how students can ask questions during
   * the exam, perhaps including a link to e.g. a course forum or video meeting with proctors.
   */
  readonly mk_questions_message?: string,

  /**
   * A markdown-formatted message that appears at the bottom left of the page, right below the
   * "Answers File" button. A suggested use is to remind students why to click the "Answers File"
   * button, e.g. "Download an answers file to submit to Canvas".
   */
  readonly mk_download_message?: string,

  /**
   * A markdown-formatted message that appears when students open the "Answers File" modal.
   * A suggested use is to give students instructions for downloading and turning in their
   * answers file.
   */
  readonly mk_saver_message?: string,

  /**
   * A markdown-formatted message that appears at the bottom of the exam. A suggested use is
   * to confirm that students have reached the bottom of the exam and remind them to download
   * the answers file and turn it in elsewhere (e.g. to Canvas or some other LMS).
   * 
   * Defaults to [[MK_DEFAULT_DOWNLOAD_MESSAGE]]
   */
  readonly mk_bottom_message?: string,

  /**
   * TODO this will probably be moved elsewhere.
   */
  readonly enable_regrades?: boolean

  /**
   * An absolute path to a directory containing media for this exam. Media will be
   * available to the frontend at {{frontend_media_dir}}/exam/{{exam_id}}/ where
   * {{frontend_media_dir}} is configured by the exam generator (defaults to "media").
   * Tip: Use `__dirname` to get an absolute path to a media folder located in the
   * same directory as the file in which you define your specification. For example,
   * `__dirname + "/media"`.
   */
  readonly media_dir?: string;
};

export function isValidID(id: string) {
  return /^[a-zA-Z][a-zA-Z0-9_\-]*$/.test(id);
}







type ChooserStrategySpecification = {
  kind: "random_1";
} | {
  kind: "random_n";
  n: number;
} | {
  kind: "shuffle";
}

type ChooserKind = "section" | "question" | "skin";

type ChoiceKind = {
  "section": SectionSpecification,
  "question": QuestionSpecification,
  "skin": ExamComponentSkin
};

interface ExamComponentChooserSpecification<CK extends ChooserKind> {
  readonly component_kind: "chooser_specification";
  readonly chooser_kind: CK;
  readonly choices: readonly (ChoiceKind[CK] | ChoiceKind[CK][] | ExamComponentChooserSpecification<CK>)[];
  readonly strategy: ChooserStrategySpecification;
}

export type SectionChooserSpecification = ExamComponentChooserSpecification<"section">;

export type QuestionChooserSpecification = ExamComponentChooserSpecification<"question">;

export type SkinChooserSpecification = ExamComponentChooserSpecification<"skin">;

interface ExamComponentChooser<CK extends ChooserKind> {
  readonly component_kind: "chooser";
  readonly chooser_kind: CK;
  choose(exam: Exam, student: StudentInfo, rand: Randomizer): readonly ChoiceKind[CK][];
  getById(id: string): ChoiceKind[CK] | undefined;
}

/**
 * A `SectionChooser` selects an array of questions given an exam, a student,
 * and a source of randomness. You may define your own or use a predefined chooser:
 * - [[RANDOM_SECTION]]
 */
export type SectionChooser = ExamComponentChooser<"section">;

export type QuestionChooser = ExamComponentChooser<"question">;

export type SkinChooser = ExamComponentChooser<"skin">;

export function realizeChooser<CK extends ChooserKind>(spec: ExamComponentChooserSpecification<CK>) : ExamComponentChooser<CK> {
  return {
    component_kind: "chooser",
    chooser_kind: spec.chooser_kind,
    choose: createChooseFunction(spec),
    getById: createGetByIdFunction(spec)
  }
}

// choose: (exam: Exam, student: StudentInfo, rand: Randomizer) => {
//   let qs = questions.map(q => realizeQuestion(q)).flatMap(q => chooseQuestions(q, exam, student, rand));
//   return rand === CHOOSE_ALL ? qs : rand.shuffle(qs);
// },
// getById: (question_id: string) => {
//   return questions
//     .map(q => realizeQuestion(q))
//     .map(q => q.component_kind === "chooser" ? q.getById(question_id) : q)
//     .find(q => q?.question_id === question_id);
// }

function localChoose<CK extends ChooserKind>(spec: ExamComponentChooserSpecification<CK>, exam: Exam, student: StudentInfo, rand: Randomizer) {
  return rand === CHOOSE_ALL ? spec.choices :
    spec.strategy.kind === "random_1" ? [rand.choose_one(spec.choices)] :
    spec.strategy.kind === "random_n" ? rand.chooseN(spec.choices, spec.strategy.n) :
    spec.strategy.kind === "shuffle" ? rand.shuffle(spec.choices) :
    assertNever(spec.strategy);
}

function createChooseFunction<CK extends ChooserKind>(spec: ExamComponentChooserSpecification<CK>)
  : (exam: Exam, student: StudentInfo, rand: Randomizer) => readonly ChoiceKind[CK][] {
  return (exam: Exam, student: StudentInfo, rand: Randomizer) => {
    return localChoose(spec, exam, student, rand).flatMap(c =>
      Array.isArray(c) ? c : 
      c.component_kind === "chooser_specification" ? createChooseFunction(c)(exam, student, rand) : c
    );
  };
};

function createGetByIdFunction<CK extends ChooserKind>(spec: ExamComponentChooserSpecification<CK>) {
  return (
    spec.chooser_kind === "section" ? (id: string) => (spec.choices as readonly SectionSpecification[]).find(c => c.section_id === id) :
    spec.chooser_kind === "question" ? (id: string) => (spec.choices as readonly QuestionSpecification[]).find(c => c.question_id === id) :
    spec.chooser_kind === "skin" ? (id: string) => (spec.choices as readonly ExamComponentSkin[]).find(c => c.skin_id === id) :
    assertNever(spec.chooser_kind)
  ) as (id: string) => ChoiceKind[CK] | undefined;
}



export function realizeQuestion(q: QuestionSpecification | Question) : Question;
export function realizeQuestion(q: QuestionSpecification | Question | QuestionChooserSpecification | QuestionChooser) : Question | QuestionChooser;
export function realizeQuestion(q: QuestionSpecification | Question | QuestionChooserSpecification | QuestionChooser) {
  return q.component_kind === "chooser_specification" ? realizeChooser(q) :
    q.component_kind === "chooser" ? q :
    q.component_kind === "component" ? q :
    Question.create(q);
}

export function realizeQuestions(questions: readonly (QuestionSpecification | Question)[]) : readonly Question[];
export function realizeQuestions(questions: readonly (QuestionSpecification | Question | QuestionChooserSpecification | QuestionChooser)[]) : readonly (Question | QuestionChooser)[];
export function realizeQuestions(questions: readonly (QuestionSpecification | Question | QuestionChooserSpecification | QuestionChooser)[]) {
  return <readonly Question[]>questions.map(realizeQuestion);
}

export function chooseQuestions(chooser: Question | QuestionChooser, exam: Exam, student: StudentInfo, rand: Randomizer) {
  return chooser.component_kind === "component" ? [chooser] : chooser.choose(exam, student, rand);
}

// export function BY_ID(id: string, questionBank: QuestionBank) {
//   return (exam: Exam, student: StudentInfo, rand: Randomizer) => {
//     let q = questionBank.getQuestionById(id);
//     assert(q, `No question with ID: ${id}.`);
//     return [q];
//   }
// }

/**
 * This factory function returns a [[QuestionChooser]] that will randomly select a set
 * of n questions matching the given tag. If there are not enough questions matching that
 * tag, the chooser will throw an exception.
 * @param tag Choose only questions with this tag
 * @param n The number of questions to choose
 * @param questionBank The bank to choose questions from
 * @returns 
 */
export function RANDOM_BY_TAG(tag: string, n: number, questions: QuestionBank | readonly QuestionSpecification[]): QuestionChooserSpecification {
  let qs = questions instanceof QuestionBank ? questions.questions : questions;
  return {
    component_kind: "chooser_specification",
    chooser_kind: "question",
    choices: qs.filter(q => q.tags?.indexOf(tag) !== -1),
    strategy: {
      kind: "random_n",
      n: n
    }
  };
}

/**
 * This factory function returns a [[QuestionChooser]] that will randomly select a set
 * of n questions from the given set of questions or question bank. If there are not enough
 * to choose n of them, the chooser will throw an exception.
 * @param n 
 * @param questions 
 * @returns 
 */
export function RANDOM_QUESTION(n: number, questions: QuestionBank | readonly QuestionSpecification[]): QuestionChooserSpecification {
  let qs = questions instanceof QuestionBank ? questions.questions : questions;
  return {
    component_kind: "chooser_specification",
    chooser_kind: "question",
    choices: qs,
    strategy: {
      kind: "random_n",
      n: n
    }
  };
}

/**
 * This factory function returns a [[QuestionChooser]] that will randomly select a set
 * of n sequences of questions from the given set of question sequences. If there are not enough
 * to choose n of them, the chooser will throw an exception.
 * @param n 
 * @param questions 
 * @returns 
 */
export function RANDOM_QUESTION_SEQUENCE(n: number, questions: readonly QuestionSpecification[][]): QuestionChooserSpecification {
  let qs = questions instanceof QuestionBank ? questions.questions : questions;
  return {
    component_kind: "chooser_specification",
    chooser_kind: "question",
    choices: qs,
    strategy: {
      kind: "random_n",
      n: n
    }
  };
}







export function realizeSection(s: SectionSpecification | Section) : Section;
export function realizeSection(s: SectionSpecification | Section | SectionChooserSpecification | SectionChooser) : Section | SectionChooser;
export function realizeSection(s: SectionSpecification | Section | SectionChooserSpecification | SectionChooser) {
  return s.component_kind === "chooser_specification" ? realizeChooser(s) :
    s.component_kind === "chooser" ? s :
    s.component_kind === "component" ? s :
    Section.create(s);
}

export function realizeSections(sections: readonly (SectionSpecification | Section)[]) : readonly Section[];
export function realizeSections(sections: readonly (SectionSpecification | Section | SectionChooserSpecification | SectionChooser)[]) : readonly (Section | SectionChooser)[];
export function realizeSections(sections: readonly (SectionSpecification | Section | SectionChooserSpecification | SectionChooser)[]) {
  return <readonly Section[]>sections.map(realizeSection);
}

export function chooseSections(chooser: Section | SectionChooser, exam: Exam, student: StudentInfo, rand: Randomizer) {
  return chooser.component_kind === "component" ? [chooser] : chooser.choose(exam, student, rand);
}

/**
 * 
 * @param n 
 * @param sections 
 * @returns 
 */
export function RANDOM_SECTION(n: number, sections: readonly SectionSpecification[]): SectionChooserSpecification {
  return {
    component_kind: "chooser_specification",
    chooser_kind: "section",
    choices: sections,
    strategy: {
      kind: "random_n",
      n: n
    }
  };
}

export function CUSTOMIZE(spec: QuestionSpecification, customizations: Partial<Omit<QuestionSpecification, "response">>) : QuestionSpecification;
export function CUSTOMIZE(spec: SectionSpecification, customizations: Partial<Omit<SectionSpecification, "response">>) : SectionSpecification;
export function CUSTOMIZE(spec: ExamSpecification, customizations: Partial<Omit<ExamSpecification, "response">>) : ExamSpecification;
export function CUSTOMIZE<T extends keyof QuestionSpecification>(spec: Omit<QuestionSpecification, T>, customizations: Partial<Omit<QuestionSpecification, "response">> & Pick<QuestionSpecification, T>): QuestionSpecification;
export function CUSTOMIZE<T extends keyof SectionSpecification>(spec: Omit<SectionSpecification, T>, customizations: Partial<Omit<SectionSpecification, "response">> & Pick<SectionSpecification, T>): SectionSpecification;
export function CUSTOMIZE<T extends keyof ExamSpecification>(spec: Omit<ExamSpecification, T>, customizations: Partial<Omit<ExamSpecification, "response">> & Pick<ExamSpecification, T>): ExamSpecification;
export function CUSTOMIZE(spec: any, customizations: any) {
  return Object.assign({}, spec, customizations);
}


export function SHUFFLE(questions: QuestionSpecification | QuestionChooserSpecification | readonly(QuestionSpecification | QuestionChooserSpecification)[]) : QuestionChooserSpecification;
export function SHUFFLE(sections: SectionSpecification | SectionChooserSpecification | readonly(SectionSpecification | SectionChooserSpecification)[]) : SectionChooserSpecification;
export function SHUFFLE(sectionsOrQuestions: QuestionSpecification | QuestionChooserSpecification | SectionSpecification | SectionChooserSpecification | readonly(QuestionSpecification | QuestionChooserSpecification)[] | readonly(SectionSpecification | SectionChooserSpecification)[]) : QuestionChooserSpecification | SectionChooserSpecification {
  if(!Array.isArray(sectionsOrQuestions)) {
    // If not an array, it's a single specification or chooser.
    // Pack it in an array and cast to make the type system happy.
    return SHUFFLE(<any[]>[sectionsOrQuestions]);
  }
  
  assert(sectionsOrQuestions.length > 0);
  let first = sectionsOrQuestions[0];
  if (first.component_kind === "specification" && (<QuestionSpecification & SectionSpecification>first).question_id
    || first.component_kind === "chooser" && first.chooser_kind === "question") {
      return SHUFFLE_QUESTIONS(<readonly(QuestionSpecification | QuestionChooserSpecification)[]>sectionsOrQuestions);
  }
  else {
    return SHUFFLE_SECTIONS(<readonly(SectionSpecification | SectionChooserSpecification)[]>sectionsOrQuestions);
  }
}

function SHUFFLE_QUESTIONS(questions: readonly(QuestionSpecification | QuestionChooserSpecification)[]) : QuestionChooserSpecification {
  return {
    component_kind: "chooser_specification",
    chooser_kind: "question",
    choices: questions,
    strategy: {
      kind: "shuffle"
    }
    // choose: (exam: Exam, student: StudentInfo, rand: Randomizer) => {
    //   let qs = questions.map(q => realizeQuestion(q)).flatMap(q => chooseQuestions(q, exam, student, rand));
    //   return rand === CHOOSE_ALL ? qs : rand.shuffle(qs);
    // },
    // getById: (question_id: string) => {
    //   return questions
    //     .map(q => realizeQuestion(q))
    //     .map(q => q.component_kind === "chooser" ? q.getById(question_id) : q)
    //     .find(q => q?.question_id === question_id);
    // }
  }
}

function SHUFFLE_SECTIONS(sections: readonly(SectionSpecification | SectionChooserSpecification)[]) : SectionChooserSpecification {
  return {
    component_kind: "chooser_specification",
    chooser_kind: "section",
    choices: sections,
    strategy: {
      kind: "shuffle"
    }
  }
}








export interface StudentInfo {
  readonly uniqname: string;
  readonly name: string;
}