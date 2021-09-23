/**
 * ## Specification
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
 * ### Customizing Existing Specifications
 * 
 * Use the [[CUSTOMIZE]] function if you've got an existing specification (e.g. from a question bank) that
 * you just need to tweak slightly.
 * 
 * @module
 */

import { CHOOSE_ALL, Randomizer } from "./randomization";
import { QuestionBank } from "./QuestionBank";
import { ResponseKind } from "./response/common";
import { ResponseSpecification } from "./response/responses";
import { ExamComponentSkin, SkinChooser } from "./skins";
import { assert } from "./util";
import { Exam, Question, Section } from "./exam_components";



export type QuestionSpecification<QT extends ResponseKind = ResponseKind> = {
  readonly component_kind?: "specification",
  readonly question_id: string,
  readonly points: number,
  readonly mk_description: string,
  readonly response: ResponseSpecification<QT>,
  readonly tags?: readonly string[],
  readonly skin?: ExamComponentSkin | SkinChooser
};

export type SectionSpecification = {
  readonly component_kind?: "specification",
  readonly section_id: string,
  readonly title: string,
  readonly mk_description: string,
  readonly mk_reference?: string,
  readonly questions: readonly (QuestionSpecification | QuestionChooser)[],
  readonly skin?: ExamComponentSkin | SkinChooser,
  reference_width?: number,
}

export type ExamSpecification = {

  readonly component_kind?: "specification",

  /**
   * A unique ID for the exam. Also used as part of the composite seed for UUID generation
   * by an [[ExamGenerator]] using the `"uniqname"` or "uuidv5" strategies.
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
   * Specifies the sections of this exam. Each entry in the array may either specify
   * a particular section or a "chooser" that selects one (or more) from a set of possible
   * sections that an individual student might be assigned.
   * @see [[SectionSpecification]]
   * @see [[SectionChooser]]
*/
  readonly sections: readonly (SectionSpecification | SectionChooser)[],
  readonly mk_announcements?: string[],
  readonly mk_questions_message?: string,
  readonly mk_download_message?: string,
  readonly mk_bottom_message?: string,
  readonly enable_regrades?: boolean
};

export function isValidID(id: string) {
  return /^[a-zA-Z][a-zA-Z0-9_\-]*$/.test(id);
}



export interface QuestionChooser {
  component_kind: "chooser",
  choose(exam: Exam, student: StudentInfo, rand: Randomizer) : readonly Question[];
  getById(id: string) : Question | undefined;
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

export function RANDOM_BY_TAG(tag: string, n: number, questionBank: QuestionBank): QuestionChooser {
  return {
    component_kind: "chooser",
    choose: (exam: Exam, student: StudentInfo, rand: Randomizer) => {
      let qs = questionBank.getQuestionsByTag(tag);
      if (rand === CHOOSE_ALL) {
        return qs;
      }
      assert(n <= qs.length, `Error - cannot choose ${n} questions for tag "${tag}" that only has ${qs.length} associated questions.`);
      return rand.chooseN(qs, n);
    },
    getById: (question_id: string) => {
      return questionBank.getQuestionById(question_id);
    }
  }
}

export function RANDOM_QUESTION(n: number, questions: QuestionBank | readonly (QuestionSpecification | Question)[]): QuestionChooser {
  let qBank: QuestionBank =
    questions instanceof QuestionBank ? questions :
    new QuestionBank(questions);

  return {
    component_kind: "chooser",
    choose: (exam: Exam, student: StudentInfo, rand: Randomizer) => {
      let qs = qBank.questions;
      if (rand === CHOOSE_ALL) {
        return qs;
      }
      assert(n <= qs.length, `Error - cannot choose ${n} questions from a question bank that only has ${qs.length} questions.`);
      return rand.chooseN(qs, n);
    },
    getById: (question_id: string) => {
      return qBank.getQuestionById(question_id);
    }
  }
}





/**
 * A `SectionChooser` selects an array of questions given an exam, a student,
 * and a source of randomness. You may define your own or use a predefined chooser:
 * - [[RANDOM_SECTION]]
 */
export interface SectionChooser {
  component_kind: "chooser";
  choose(exam: Exam, student: StudentInfo, rand: Randomizer): readonly Section[];
  getById(section_id: string): Section | undefined;
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
export function RANDOM_SECTION(n: number, sections: readonly (SectionSpecification | Section)[]): SectionChooser {
  return {
    component_kind: "chooser",
    choose: (exam: Exam, student: StudentInfo, rand: Randomizer) => {
      if (rand === CHOOSE_ALL) {
        return sections.map(s => s instanceof Section ? s : Section.create(s));
      }
      assert(n <= sections.length, `Error - cannot choose ${n} sections from a set of ${sections.length} sections.`);
      return rand.chooseN(sections, n).map(s => s instanceof Section ? s : Section.create(s));
    },
    getById: (section_id: string) => {
      let match = sections.find(s => s.section_id === section_id);
      return match && Section.create(match);
    }
  }
}

export function CUSTOMIZE(spec: QuestionSpecification, customizations: Partial<Exclude<QuestionSpecification, "response">>) : QuestionSpecification;
export function CUSTOMIZE(spec: SectionSpecification, customizations: Partial<Exclude<SectionSpecification, "response">>) : SectionSpecification;
export function CUSTOMIZE(spec: ExamSpecification, customizations: Partial<Exclude<ExamSpecification, "response">>) : ExamSpecification;
export function CUSTOMIZE(spec: QuestionSpecification | SectionSpecification | ExamSpecification, customizations: Partial<Exclude<QuestionSpecification | SectionSpecification | ExamSpecification, "response">>) : QuestionSpecification | SectionSpecification | ExamSpecification {
  return Object.assign({}, spec, customizations);
}








export interface StudentInfo {
  readonly uniqname: string;
  readonly name: string;
}