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

import { Randomizer } from "./randomization";
import { QuestionBank } from "./QuestionBank";
import { ResponseKind } from "../response/common";
import {response_specification_diff, ResponseSpecification, ResponseSpecificationDiff } from "../response/responses";
import { ExamComponentSkin } from "./skins";
import { assert, assertFalse, assertNever } from "./util";
import { Exam, Question, Section } from "./exam_components";
import { quantileSorted } from "simple-statistics";
import { GraderSpecification } from "../graders/QuestionGrader";
import deepEqual from "deep-equal";



export type QuestionSpecification<QT extends ResponseKind = ResponseKind> = {
  readonly component_kind?: "specification",

  /**
   * A unique ID for the question. Must be distinct from all other question IDs.
   * Also used as part of the composite seed for UUID generation
   * by an [[ExamGenerator]] using the `"plain"` or "uuidv5" strategies.
   */
  readonly question_id: string,
  
  /**
   * An optional question title.
   */
  readonly title?: string,

  /**
   * The number of points the question is worth overall.
   */
  readonly points: number,

  /**
   * Markdown-formatted question description.
   */
  readonly mk_description: string,

  /**
   * Optional, markdown-formatted question postscript. Appears below the response element.
   */
  readonly mk_postscript?: string,

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
   * An absolute path to a directory containing assets for this question. Assets will be
   * available to the frontend at {{frontend_assets_dir}}/question/{{question_id}}/ where
   * {{frontend_assets_dir}} is configured by the exam generator (defaults to "assets").
   * Tip: Use `__dirname` to get an absolute path to an assets folder located in the
   * same directory as the file in which you define your specification. For example,
   * `__dirname + "/assets"`.
   */
  readonly assets_dir?: string;
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
  readonly reference_width?: number,


  /**
   * An absolute path to a directory containing assets for this section. Assets will be
   * available to the frontend at {{frontend_assets_dir}}/section/{{section_id}}/ where
   * {{frontend_assets_dir}} is configured by the exam generator (defaults to "assets").
   * Tip: Use `__dirname` to get an absolute path to an assets folder located in the
   * same directory as the file in which you define your specification. For example,
   * `__dirname + "/assets"`.
   */
  readonly assets_dir?: string;
}

export type CredentialsStrategy = "google";

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
   * An absolute path to a directory containing assets for this exam. Assets will be
   * available to the frontend at {{frontend_assets_dir}}/exam/{{exam_id}}/ where
   * {{frontend_assets_dir}} is configured by the exam generator (defaults to "assets").
   * Tip: Use `__dirname` to get an absolute path to an assets folder located in the
   * same directory as the file in which you define your specification. For example,
   * `__dirname + "/assets"`.
   */
  readonly assets_dir?: string;

  /**
   * Whether or not the exam content is available in the clienside exam spec,
   * which is written to spec/exam_spec.json. Defaults to undefined (interpreted as false).
   * 
   * Enabling this is required for certain client-side features, for example, local
   * grading of questions.
   * 
   * CAUTION! This should NOT be enabled unless you are OK with the
   * full content, including the exam structure, randomization details, and all questions
   * being potentially available to savvy users. If the exam specification contains
   * sample solutions or encodings of graders, those would also be accessible.
   */
  readonly allow_clientside_content?: boolean;

  /**
   * Enable login on the clientside to retrieve credentials that may be used
   * to authenticate requests to a backend server.
   */
  readonly credentials_strategy?: CredentialsStrategy;
};

export function isValidID(id: string) {
  return /^[a-zA-Z][a-zA-Z0-9_\-]*$/.test(id);
}

export function without_content(spec: ExamSpecification) : ExamSpecification {
  const {sections, ...others} = spec;
  return {
    ...others,
    sections: []
  };
}

export type ExamComponentSpecification =
  | ExamSpecification
  | SectionSpecification
  | QuestionSpecification
  | ExamComponentSkin;


export function isExamSpecification(spec: ExamComponentSpecification) : spec is ExamSpecification {
  return !!(spec as ExamSpecification).exam_id;
}

export function isSectionSpecification(spec: ExamComponentSpecification) : spec is SectionSpecification {
  return !!(spec as SectionSpecification).section_id;
}

export function isQuestionSpecification(spec: ExamComponentSpecification) : spec is QuestionSpecification {
  return !!(spec as QuestionSpecification).question_id;
}

export function isSkinSpecificatoin(spec: ExamComponentSpecification) : spec is ExamComponentSkin {
  return !!(spec as ExamComponentSkin).skin_id;
}

export function getExamComponentSpecificationID(spec: ExamComponentSpecification) {
  if(isExamSpecification(spec)) { return spec.exam_id; }
  if(isSectionSpecification(spec)) { return spec.section_id; }
  if(isQuestionSpecification(spec)) { return spec.question_id; }
  if(isSkinSpecificatoin(spec)) { return spec.skin_id; }
  return assertNever(spec);
}
export type ExamComponentOrChooserSpecification =
  | ExamComponentSpecification
  | ExamComponentChooserSpecification<"section">
  | ExamComponentChooserSpecification<"question">
  | ExamComponentChooserSpecification<"skin">;




type ChooserStrategySpecification = {
  kind: "group";
} | {
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

type ExamComponentChooserSpecification<CK extends ChooserKind> = {
  readonly component_kind: "chooser_specification";
  readonly chooser_kind: CK;
  readonly strategy: ChooserStrategySpecification;
  readonly choices: readonly (ChoiceKind[CK] | ExamComponentChooserSpecification<CK>)[];
};

export type SectionChooserSpecification = ExamComponentChooserSpecification<"section">;

export type QuestionChooserSpecification = ExamComponentChooserSpecification<"question">;

export type SkinChooserSpecification = ExamComponentChooserSpecification<"skin">;

class ExamComponentChooser<CK extends ChooserKind> {
  readonly spec: ExamComponentChooserSpecification<CK>;
  readonly component_kind = "chooser";
  readonly chooser_kind: CK;
  readonly all_choices: readonly ChoiceKind[CK][];
  readonly n_chosen: MinMax;

  public constructor(spec: ExamComponentChooserSpecification<CK>) {
    this.spec = spec;
    this.chooser_kind = spec.chooser_kind;
    this.all_choices = uniqueChoices(chooseAll(spec));
    this.n_chosen = minMaxChosenItems(<QuestionChooserSpecification | SectionChooserSpecification | SkinChooserSpecification>this.spec);
  }

  public choose(exam: Exam, student: StudentInfo, rand: Randomizer) {
    return choose_impl(this.spec, exam, student, rand);
  }
}

function choose_impl<CK extends ChooserKind>(spec: ExamComponentChooserSpecification<CK>, exam: Exam, student: StudentInfo, rand: Randomizer) : readonly ChoiceKind[CK][] {
  const strategy = spec.strategy;
  const choices = spec.choices;
  return (
    strategy.kind === "group" ? choices :
    strategy.kind === "random_1" ? [rand.chooseOne(choices)] :
    strategy.kind === "random_n" ? rand.chooseN(choices, strategy.n) :
    strategy.kind === "shuffle" ? rand.shuffle(choices) :
    assertNever(strategy)
  ).flatMap(c =>
    Array.isArray(c) ? c : 
    c.component_kind === "chooser_specification" ? choose_impl(c, exam, student, rand) : [c]
  );
}

export type SectionChooser = ExamComponentChooser<"section">;

export type QuestionChooser = ExamComponentChooser<"question">;

export type SkinChooser = ExamComponentChooser<"skin">;

export function realizeChooser<CK extends ChooserKind>(spec: ExamComponentChooserSpecification<CK>) {
  return new ExamComponentChooser<CK>(spec);
}

function chooseAll<CK extends ChooserKind>(spec: ExamComponentChooserSpecification<CK>) : readonly ChoiceKind[CK][]{
  return spec.choices.flatMap(c => c.component_kind === "chooser_specification" ? chooseAll(c) : c);
}

function uniqueChoices<CK extends ChooserKind>(choices: readonly ChoiceKind[CK][]) {
  return Array.from(new Map<string, ChoiceKind[CK]>(choices.map(c => [getExamComponentSpecificationID(c), c])).values());
}

type MinMax = {
  readonly min: number,
  readonly max: number,
};

export type MinMaxPoints = MinMax & { _t_min_max_points?: never};
export type MinMaxItems = MinMax & { _t_min_max_items?: never};

export function minMaxPoints(component: QuestionChooserSpecification | SectionChooserSpecification | SectionSpecification | QuestionSpecification | ExamSpecification) : MinMaxPoints {
  return (
    Array.isArray(component) ? minMaxReduce(component.map(elt => minMaxPoints(elt))) : // for compatibility with older specs that could contain arrays
    component.component_kind === "chooser_specification" ? minMaxChooserPoints(component) :
    isQuestionSpecification(component) ? { min: component.points, max: component.points } :
    isSectionSpecification(component) ? minMaxReduce(component.questions.map(q => minMaxPoints(q))) :
    isExamSpecification(component) ? minMaxReduce(component.sections.map(s => minMaxPoints(s))) :
    assertNever(component)
  );
}

function minMaxReduce(mm: readonly MinMax[]) : MinMax {
  return {
    min: mm.map(mm => mm.min).reduce((p, c) => p + c, 0),
    max: mm.map(mm => mm.max).reduce((p, c) => p + c, 0),
  };
}

function minMaxChooserPoints(chooser_spec: QuestionChooserSpecification | SectionChooserSpecification) : MinMaxPoints {
  const strategy = chooser_spec.strategy;
  const choiceMinMaxs = chooser_spec.choices.map(c => minMaxPoints(c));
  return minMaxChooserHelper(strategy, choiceMinMaxs);
}


export function minMaxChosenItems(chooser_spec: QuestionChooserSpecification | SectionChooserSpecification | SkinChooserSpecification) : MinMaxItems {
  const strategy = chooser_spec.strategy;
  const choiceMinMaxs = chooser_spec.choices.map(component => (
    Array.isArray(component) ? { min: 1, max: 1 } : // for compatibility with older specs that could contain arrays
    component.component_kind === "chooser_specification" ? minMaxChosenItems(component) :
    isQuestionSpecification(component) ? { min: 1, max: 1 } :
    isSectionSpecification(component) ? { min: 1, max: 1 } :
    isSkinSpecificatoin(component) ? { min: 1, max: 1 } :
    assertNever(component)
  ));
  return minMaxChooserHelper(strategy, choiceMinMaxs);
}

function minMaxChooserHelper(strategy: ChooserStrategySpecification, choiceMinMaxs: MinMax[]) : MinMax {
  // If we're only choosing one
  if (strategy.kind === "random_1") {
    return {
      min: Math.min(...choiceMinMaxs.map(mm => mm.min)),
      max: Math.max(...choiceMinMaxs.map(mm => mm.max))
    };
  }

  // Add the list of questions
  if (strategy.kind === "group" || strategy.kind === "shuffle" || strategy.kind === "random_n" ) {  
    let choiceMins = choiceMinMaxs.map(mm => mm.min);
    let choiceMaxs = choiceMinMaxs.map(mm => mm.max);
    
    // If the strategy was random_n, only add best/worst case subsets
    if (strategy.kind === "random_n") {
      choiceMins = choiceMins.sort((a, b) => a - b).slice(0, strategy.n); // the n smallest
      choiceMaxs = choiceMaxs.sort((a, b) => b - a).slice(0, strategy.n); // the n largest
    }

    return {
      min: choiceMins.reduce((p, c) => p + c, 0),
      max: choiceMaxs.reduce((p, c) => p + c, 0),
    };
  }

  return assertNever(strategy);
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

export function chooseAllSections(chooser: Section | SectionChooser) {
  return chooser.component_kind === "component" ? [chooser] : chooser.all_choices;
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

export function chooseAllQuestions(chooser: Question | QuestionChooser) {
  return chooser.component_kind === "component" ? [chooser] : chooser.all_choices;
}



export function chooseSkins(chooser: ExamComponentSkin | SkinChooser, exam: Exam, student: StudentInfo, rand: Randomizer) {
  return chooser.component_kind === "chooser" ? chooser.choose(exam, student, rand) : [chooser];
}

export function chooseAllSkins(chooser: ExamComponentSkin | SkinChooser) {
  return chooser.component_kind === "chooser" ? chooser.all_choices : [chooser];
}


/**
 * 
 * @param n 
 * @param sections 
 * @returns 
 */
export function RANDOM_SECTION(n: number, sections: readonly (SectionSpecification | SectionChooserSpecification)[]): SectionChooserSpecification {
  return {
    component_kind: "chooser_specification",
    chooser_kind: "section",
    choices: sections,
    strategy: n === 1 ? { kind: "random_1" } : { kind: "random_n", n: n }
  };
}



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
    strategy: n === 1 ? { kind: "random_1" } : { kind: "random_n", n: n }
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
export function RANDOM_QUESTION(n: number, questions: QuestionBank | readonly (QuestionSpecification | QuestionChooserSpecification)[]): QuestionChooserSpecification {
  let qs = questions instanceof QuestionBank ? questions.questions : questions;
  return {
    component_kind: "chooser_specification",
    chooser_kind: "question",
    choices: qs,
    strategy: n === 1 ? { kind: "random_1" } : { kind: "random_n", n: n }
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



/**
 * This factory function returns a chooser that simply selects all its choices. The
 * intended use is to ensure they are grouped together when nested within other
 * randomization constructs.
 * @param questions 
 */
export function GROUP(questions: QuestionSpecification | QuestionChooserSpecification | readonly(QuestionSpecification | QuestionChooserSpecification)[]) : QuestionChooserSpecification;
/**
 * This factory function returns a chooser that simply selects all its choices. The
 * intended use is to ensure they are grouped together when nested within other
 * randomization constructs.
 * @param sections 
 */
export function GROUP(sections: SectionSpecification | SectionChooserSpecification | readonly(SectionSpecification | SectionChooserSpecification)[]) : SectionChooserSpecification;
export function GROUP(sectionsOrQuestions: QuestionSpecification | QuestionChooserSpecification | SectionSpecification | SectionChooserSpecification | readonly(QuestionSpecification | QuestionChooserSpecification)[] | readonly(SectionSpecification | SectionChooserSpecification)[]) : QuestionChooserSpecification | SectionChooserSpecification {
  if(!Array.isArray(sectionsOrQuestions)) {
    // If not an array, it's a single specification or chooser.
    // Pack it in an array and cast to make the type system happy.
    return GROUP(<any[]>[sectionsOrQuestions]);
  }
  
  assert(sectionsOrQuestions.length > 0);
  let first = sectionsOrQuestions[0];
  if (first.component_kind === "specification" && (<QuestionSpecification & SectionSpecification>first).question_id
    || first.component_kind === "chooser" && first.chooser_kind === "question") {
      return GROUP_QUESTIONS(<readonly(QuestionSpecification | QuestionChooserSpecification)[]>sectionsOrQuestions);
  }
  else {
    return GROUP_SECTIONS(<readonly(SectionSpecification | SectionChooserSpecification)[]>sectionsOrQuestions);
  }
}

function GROUP_QUESTIONS(questions: readonly(QuestionSpecification | QuestionChooserSpecification)[]) : QuestionChooserSpecification {
  return {
    component_kind: "chooser_specification",
    chooser_kind: "question",
    choices: questions,
    strategy: {
      kind: "group"
    }
  }
}

function GROUP_SECTIONS(sections: readonly(SectionSpecification | SectionChooserSpecification)[]) : SectionChooserSpecification {
  return {
    component_kind: "chooser_specification",
    chooser_kind: "section",
    choices: sections,
    strategy: {
      kind: "group"
    }
  }
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






export function parseExamSpecification(str: string) : ExamSpecification { return <ExamSpecification>parseExamComponentSpecification(str); }
export function parseSectionSpecification(str: string) : SectionSpecification { return <SectionSpecification>parseExamComponentSpecification(str); }
export function parseQuestionSpecification(str: string) : QuestionSpecification { return <QuestionSpecification>parseExamComponentSpecification(str); }
export function parseExamSkinSpecification(str: string) : ExamComponentSkin { return <ExamComponentSkin>parseExamComponentSpecification(str); }

export function parseExamComponentSpecification(str: string) : ExamComponentOrChooserSpecification | ResponseSpecification<ResponseKind> | GraderSpecification {
  return JSON.parse(
    str,
    (key: string, value: any) => {
      if (typeof value === "object" && typeof value["examma_ray_serialized_regex"] === "object") {
        return new RegExp(
          value["examma_ray_serialized_regex"]["source"],
          value["examma_ray_serialized_regex"]["flags"]
        );
      }
      return value;
    }
  );
}

export function stringifyExamComponentSpecification(spec: ExamComponentOrChooserSpecification | ResponseSpecification<ResponseKind> | GraderSpecification) : string {
  return JSON.stringify(
    spec,
    (key: string, value: any) => {
      if (value instanceof RegExp) {
        return {
          examma_ray_serialized_regex: {
            source: value.source,
            flags: value.flags
          }
        }
      }
      return value;
    },
    2
  );
}



// export type ExamSpecificationDiff = {
//   exam_id?: boolean,
//   title?: boolean,
//   instructions?: boolean,
//   meta?: boolean,
//   sections?: (ExamComponentSpecificationIDDiff | SectionSpecificationDiff | ExamComponentChooserSpecificationDiff | undefined)[],
//   format?: boolean,
// }

// export function exam_specification_diff(spec1: ExamSpecification, spec2: ExamSpecification) : ExamSpecificationDiff | undefined {
//   const sections_diff = spec1.sections.map((q1, i) => {
//     const q2 = spec2.sections[i];
//     if (q1.component_kind === "chooser_specification" || q2.component_kind === "chooser_specification") {
//       if (q1.component_kind !== "chooser_specification" || q2.component_kind !== "chooser_specification") {
//         return <ExamComponentChooserSpecificationDiff>{
//           choices: true,
//           strategy: true,
//         };
//       }
//       else {
//         return exam_component_chooser_specification_diff(q1, q2);
//       }
//     }
//     else {
//       return section_specification_diff(q1, q2);
//     }
//   });

//   const diff : ExamSpecificationDiff = {
//     exam_id:
//       spec1.exam_id !== spec2.exam_id,
//     title:
//       spec1.title !== spec2.title,
//     instructions:
//       spec1.mk_intructions !== spec2.mk_intructions,
//     meta:
//       spec1.mk_announcements !== spec2.mk_announcements ||
//       spec1.mk_bottom_message !== spec2.mk_bottom_message ||
//       spec1.mk_download_message !== spec2.mk_download_message ||
//       spec1.mk_questions_message !== spec2.mk_questions_message ||
//       spec1.mk_saver_message !== spec2.mk_saver_message,
//     sections:
//       sections_diff.some(d => d) ? sections_diff: undefined,
//   };

//   return Object.values(diff).some(v => v) ? diff : undefined;
// }



// export type SectionSpecificationDiff = {
//   section_id?: boolean,
//   title?: boolean,
//   description?: boolean,
//   reference?: boolean,
//   questions?: (ExamComponentSpecificationIDDiff | ExamComponentChooserSpecificationDiff | undefined)[],
//   skin?: boolean,
//   format?: boolean,
// }

// export function section_specification_diff(spec1: SectionSpecification, spec2: SectionSpecification) : SectionSpecificationDiff | undefined {

//   const questions_diff = spec1.questions.map((q1, i) => {
//     const q2 = spec2.questions[i];

//     if (!q2) {
//       return <ExamComponentSpecificationRemovedDiff>{
//         diff_kind: "removed",
//       };
//     }

//     if (q1.component_kind === "chooser_specification" || q2.component_kind === "chooser_specification") {
//       if (q1.component_kind !== "chooser_specification" || q2.component_kind !== "chooser_specification") {
//         return <ExamComponentChooserSpecificationDiff>{
//           choices: true,
//           strategy: true,
//         };
//       }
//       else {
//         return exam_component_chooser_specification_diff(q1, q2);
//       }
//     }
//     else if(q1.question_id !== q2.question_id) {
//       return <ExamComponentSpecificationIDDiff>{
//         diff_kind: "id",
//         id1: q1.question_id,
//         id2: q2.question_id,
//       };
//     }
//     else {
//       return undefined;
//     }
//   });

//   // If spec2 questions is longer, we added some
//   for(let i = 0; i < spec2.questions.length - spec1.questions.length; ++i) {

//   }

//   const diff : SectionSpecificationDiff = {
//     section_id:
//       spec1.section_id !== spec2.section_id,
//     title:
//       spec1.title !== spec2.title,
//     description:
//       spec1.mk_description !== spec2.mk_description,
//     reference:
//       spec1.mk_reference !== spec1.mk_reference,
//     questions:
//       questions_diff.some(d => d) ? questions_diff: undefined,
//     skin:
//       !deepEqual(spec1.skin, spec2.skin, { strict: true }),
//     format:
//       spec1.reference_width !== spec2.reference_width
//   };

//   return Object.values(diff).some(v => v) ? diff : undefined;
// }


// export type QuestionSpecificationDiff = {
//   question_id?: boolean,
//   response?: ResponseSpecificationDiff,
//   description?: boolean,
//   points: boolean,
//   skin?: boolean,
//   tags: boolean,
// }

// export function question_specification_diff(spec1: QuestionSpecification, spec2: QuestionSpecification) : QuestionSpecificationDiff | undefined {
//   const diff = {
//     question_id:
//       spec1.question_id !== spec2.question_id,
//     response:
//       response_specification_diff(spec1.response, spec2.response),
//     description:
//       spec1.mk_description !== spec2.mk_description,
//     points:
//       spec1.points !== spec2.points,
//     skin:
//       !deepEqual(spec1.skin, spec2.skin, { strict: true }),
//     tags:
//       !deepEqual(spec1.tags, spec2.tags)
//   };
  
//   return Object.values(diff).some(v => v) ? diff : undefined;
// }


// export type ExamComponentSpecificationAddedDiff = {
//   diff_kind: "added",
// };

// export type ExamComponentSpecificationRemovedDiff = {
//   diff_kind: "removed",
// };

// export type ExamComponentSpecificationIDDiff = {
//   diff_kind: "id",
//   id1?: string,
//   id2?: string,
// };

// export type ExamComponentChooserSpecificationDiff = {
//   diff_kind: "chooser",
//   choices?: boolean,
//   strategy?: boolean,
// };

// function exam_component_chooser_specification_diff<CK extends ChooserKind>(spec1: ExamComponentChooserSpecification<CK>, spec2: ExamComponentChooserSpecification<CK>) : ExamComponentChooserSpecificationDiff | undefined {
  
//   let diff : ExamComponentChooserSpecificationDiff = {
//     strategy: !deepEqual(spec1.strategy, spec2.strategy, { strict: true }),
//     diff_kind: "chooser",
//   };

//   if (spec1.choices.length !== spec2.choices.length) {
//     diff.choices = true;
//   }
//   else{
//     spec1.choices.forEach((cs1, i) => {
//       const cs2 = spec2.choices[i];
//       if (Array.isArray(cs1) || Array.isArray(cs2)) {
//         diff.choices ||= !Array.isArray(cs1) || !Array.isArray(cs2) || cs1.length !== cs2.length || cs1.some((c1, i) => choice_id_diff(spec1.chooser_kind, c1, cs2[i]));
//       }
//       else if (cs1.component_kind === "chooser_specification" || cs2.component_kind === "chooser_specification") {
//         if (cs1.component_kind !== "chooser_specification" || cs2.component_kind !== "chooser_specification") {
//           diff.choices = true;
//         }
//         else {
//           const rec_diff = exam_component_chooser_specification_diff(cs1, cs2);
//           diff.choices ||= rec_diff?.choices;
//           diff.strategy ||= rec_diff?.strategy;
//         }
//       }
//       else {
//         diff.choices ||= choice_id_diff(spec1.chooser_kind, cs1, cs2);
//       }
//     });
//   }

//   return Object.values(diff).some(v => v) ? diff : undefined;
// }

// function choice_id_diff<CK extends ChooserKind>(chooser_kind: CK, choice1: ChoiceKind[CK], choice2: ChoiceKind[CK]) {
//   return chooser_kind === "question" ? (<QuestionSpecification>choice1).question_id !== (<QuestionSpecification>choice2).question_id :
//     chooser_kind === "section" ? (<SectionSpecification>choice1).section_id !== (<SectionSpecification>choice2).section_id :
//     chooser_kind === "skin" ? (<ExamComponentSkin>choice1).skin_id !== (<ExamComponentSkin>choice2).skin_id :
//     assertNever(chooser_kind);
// }