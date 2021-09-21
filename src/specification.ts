import { Exam, Question, Section, StudentInfo } from "./exams";
import { Randomizer } from "./randomization";
import { QuestionBank } from "./QuestionBank";
import { BLANK_SUBMISSION, ResponseKind } from "./response/common";
import { ResponseSpecification, SubmissionType } from "./response/responses";
import { DEFAULT_SKIN, QuestionSkin } from "./skins";
import { assert } from "./util";

export function isValidID(id: string) {
  return /^[a-zA-Z][a-zA-Z0-9_\-]*$/.test(id);
}

export const CHOOSE_ALL = Symbol("choose_all");

export type ExamSpecification = {
  id: string,
  title: string,
  mk_intructions: string,
  mk_announcements?: string[],
  sections: readonly (SectionSpecification | Section | SectionChooser)[],
  enable_regrades?: boolean,
  mk_questions_message?: string,
  mk_download_message?: string,
  mk_bottom_message?: string
};

export type SectionChooser = (exam: Exam, student: StudentInfo, rand: Randomizer) => readonly Section[];

export function chooseSections(chooser: SectionSpecification | Section | SectionChooser, exam: Exam, student: StudentInfo, rand: Randomizer) {
  return typeof chooser === "function" ? chooser(exam, student, rand) :
      chooser instanceof Section ? [chooser] :
      [new Section(chooser)]
}

export function RANDOM_SECTION(n: number, sections: readonly (SectionSpecification | Section)[]) {
  return (exam: Exam, student: StudentInfo, rand: Randomizer) => {
    if (rand === CHOOSE_ALL) {
      return sections.map(s => s instanceof Section ? s : new Section(s));
    }
    assert(n <= sections.length, `Error - cannot choose ${n} sections from a set of ${sections.length} sections.`);
    return rand.chooseN(sections, n).map(s => s instanceof Section ? s : new Section(s));
  }
}





export type SectionSpecification = {
  readonly id: string,
  readonly title: string,
  readonly mk_description: string,
  readonly mk_reference?: string,
  readonly questions: QuestionSpecification | Question | QuestionChooser | readonly (QuestionSpecification | Question | QuestionChooser)[],
  readonly skins?: SkinGenerator,
  reference_width?: number
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

export function RANDOM_ANY(n: number, questionBank: QuestionBank | readonly (QuestionSpecification | Question)[]) {
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
  generate: (exam: Exam, student: StudentInfo, rand: Randomizer) => readonly QuestionSkin[],
  getById: (id: string) => QuestionSkin | undefined
};

export const DEFAULT_SKIN_GENERATOR : SkinGenerator = {
  generate: (exam: Exam, student: StudentInfo, rand: Randomizer) => {
    return [DEFAULT_SKIN];
  },
  getById: (id: string) => DEFAULT_SKIN
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



export function CUSTOMIZE(spec: QuestionSpecification, customizations: Partial<Exclude<QuestionSpecification, "response">>) : QuestionSpecification;
export function CUSTOMIZE(spec: SectionSpecification, customizations: Partial<Exclude<SectionSpecification, "response">>) : SectionSpecification;
export function CUSTOMIZE(spec: QuestionSpecification | SectionSpecification, customizations: Partial<Exclude<QuestionSpecification | SectionSpecification, "response">>) : QuestionSpecification | SectionSpecification {
  return Object.assign({}, spec, customizations);
}