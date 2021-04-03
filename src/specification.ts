import { Exam, Question, Section, StudentInfo } from "./exams";
import { Randomizer, SeededRandomizer } from "./randomization";
import { QuestionBank } from "./QuestionBank";
import { ResponseKind } from "./response/common";
import { ResponseSpecification } from "./response/responses";
import { DEFAULT_SKIN, QuestionSkin } from "./skins";
import { assert } from "./util";

export const CHOOSE_ALL = Symbol("choose_all");

export type ExamSpecification = {
  id: string,
  title: string,
  mk_intructions: string,
  mk_announcements?: string[],
  frontend_js_path: string,
  frontend_graded_js_path: string,
  sections: readonly (SectionSpecification | Section | SectionChooser)[],
  allow_duplicates?: boolean
};

export type SectionChooser = (exam: Exam, student: StudentInfo, rand: Randomizer) => readonly Section[];

export function chooseSections(chooser: SectionSpecification | Section | SectionChooser, exam: Exam, student: StudentInfo, rand: Randomizer) {
  return typeof chooser === "function" ? chooser(exam, student, rand) :
      chooser instanceof Section ? [chooser] :
      [new Section(chooser)]
}

export function RANDOM_SECTION(n: number, sections: (SectionSpecification | Section)[]) {
  return (exam: Exam, student: StudentInfo, rand: Randomizer) => {
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
  readonly questions: QuestionSpecification | Question | QuestionChooser | (QuestionSpecification | Question | QuestionChooser)[];
  readonly skins?: SkinGenerator;
}

export type QuestionChooser = (exam: Exam, student: StudentInfo, rand: Randomizer) => readonly Question[];

export function chooseQuestions(chooser: QuestionSpecification| Question | QuestionChooser, exam: Exam, student: StudentInfo, rand: Randomizer) {
  return typeof chooser === "function" ? chooser(exam, student, rand) :
      chooser instanceof Question ? [chooser] :
      [new Question(chooser)]
}

export function BY_ID(id: string, questionBank: QuestionBank) {
  return (exam: Exam, student: StudentInfo, rand: Randomizer) => {
    let q = questionBank.getQuestionById(id);
    assert(q, `No question with ID: ${id}.`);
    return [q];
  }
}

export function RANDOM_BY_TAG(tag: string, n: number, questionBank: QuestionBank) {
  return (exam: Exam, student: StudentInfo, rand: Randomizer) => {
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
  return (exam: Exam, student: StudentInfo, rand: Randomizer) => {
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
  response: ResponseSpecification<QT>,
  tags?: readonly string[],
  skins?: SkinGenerator
};



export type SkinGenerator = {
  generate: (exam: Exam, student: StudentInfo, rand: Randomizer) => readonly QuestionSkin[]
};

export const DEFAULT_SKIN_GENERATOR : SkinGenerator = {
  generate: (exam: Exam, student: StudentInfo, rand: Randomizer) => {
    return [DEFAULT_SKIN];
  }
}

export function RANDOM_SKIN(skins: readonly QuestionSkin[]) {
  let skinMap : {[index: string]: QuestionSkin | undefined} = {};
  skins.forEach(s => skinMap[s.id] = s);
  return {
    generate: (exam: Exam, student: StudentInfo, rand: Randomizer) => {
      assert(skins.length > 0, `Error - array of skin choices is empty.`);
      return rand === CHOOSE_ALL ? skins : [rand.choose(skins)]
    },
    getById: (id: string) => skinMap[id]
  };
}