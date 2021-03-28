import { assert } from "node:console";
import { Exam, Randomizer, Question, Section, StudentInfo } from "./exams";
import { QuestionBank } from "./QuestionBank";
import { ResponseKind } from "./response/common";
import { QuestionResponse } from "./response/responses";
import { QuestionSkin } from "./skins";

export const CHOOSE_ALL = Symbol("choose_all");

export type ExamSpecification = {
  id: string,
  title: string,
  pointsPossible: number,
  mk_intructions: string,
  mk_announcements?: string[],
  frontend_js_path: string,
  frontend_graded_js_path: string,
  sections: readonly (SectionSpecification | Section | SectionChooser)[]
};

export type SectionChooser = (exam: Exam, student: StudentInfo, rand: Randomizer | typeof CHOOSE_ALL) => readonly Section[];

export function RANDOM_SECTION(n: number, sections: (SectionSpecification | Section)[]) {
  return (exam: Exam, student: StudentInfo, rand: Randomizer | typeof CHOOSE_ALL) => {
    if (rand === CHOOSE_ALL) {
      return sections.map(s => s instanceof Section ? s : new Section(s));
    }
    assert(n <= sections.length, `Error - cannot choose ${n} sections from a set of ${sections.length} sections.`);
    return rand.chooseN(sections, n).map(s => s instanceof Section ? s : new Section(s));
  }
}





export type SectionSpecification = {
  readonly id: string;
  readonly title: string;
  readonly mk_description: string;
  readonly mk_reference?: string;
  readonly content: QuestionSpecification | Question | QuestionChooser | (QuestionSpecification | Question | QuestionChooser)[];
  readonly skins?: SkinGenerator;
}

export type QuestionChooser = (exam: Exam, student: StudentInfo, rand: Randomizer | typeof CHOOSE_ALL) => readonly Question[];

export function BY_ID(id: string, questionBank: QuestionBank) {
  return (exam: Exam, student: StudentInfo, rand: Randomizer | typeof CHOOSE_ALL) => {
    let q = questionBank.getQuestionById(id);
    assert(q, `No question with ID: ${id}.`);
    return [q];
  }
}

export function RANDOM_BY_TAG(tag: string, n: number, questionBank: QuestionBank) {
  return (exam: Exam, student: StudentInfo, rand: Randomizer | typeof CHOOSE_ALL) => {
    let qs = questionBank.getQuestionsByTag(tag);
    if (rand === CHOOSE_ALL) {
      return qs;
    }
    assert(n <= qs.length, `Error - cannot choose ${n} questions for tag "${tag}" that only has ${qs.length} associated questions.`);
    return rand.chooseN(qs, n);
  }
}

export function RANDOM_ANY(n: number, questionBank: QuestionBank | (QuestionSpecification | Question)[]) {
  if (!(questionBank instanceof QuestionBank)) {
    questionBank = new QuestionBank(questionBank);
  }
  return (exam: Exam, student: StudentInfo, rand: Randomizer | typeof CHOOSE_ALL) => {
    let qs = (<QuestionBank>questionBank).questions;
    if (rand === CHOOSE_ALL) {
      return qs;
    }
    assert(n <= qs.length, `Error - cannot choose ${n} questions from a question bank that only has ${qs.length} questions.`);
    return rand.chooseN(qs, n);
  }
}





export type QuestionSpecification<QT extends ResponseKind = ResponseKind> = {
  id: string,
  points: number,
  mk_description: string,
  response: QuestionResponse<QT>,
  tags?: readonly string[],
  skins?: SkinGenerator
};



export type SkinGenerator = {
  generate: (exam: Exam, student: StudentInfo, rand: Randomizer) => QuestionSkin
};

export function RANDOM_SKIN(skins: readonly QuestionSkin[]) {
  return (exam: Exam, student: StudentInfo, rand: Randomizer) => {
    assert(skins.length > 0, `Error - array of skin choices is empty.`);
    return rand.choose(skins)
  };
}