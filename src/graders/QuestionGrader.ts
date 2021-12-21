import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { assertNever } from "../core/util";
import { GradingAssignmentSpecification } from "../grading_interface/common";
import { ResponseKind } from "../response/common";
import { CodeWritingGrader, CodeWritingGraderSpecification, CodeWritingRubricResult } from "./CodeWritingGrader";
import { LegacyCodeWritingGrader, LegacyCodeWritingGraderSpecification, LegacyCodeWritingRubricResult } from "./LegacyCodeWritingGrader";
import { FITBRegexGrader, FITBRegexGraderSpecification } from "./FITBRegexGrader";
import { FreebieGrader, FreebieGraderSpecification } from "./FreebieGrader";
import { SimpleMCGrader, SimpleMCGraderSpecification } from "./SimpleMCGrader";
import { StandardSLGrader, StandardSLGraderSpecification } from "./StandardSLGrader";
import { SummationMCGrader, SummationMCGraderSpecification } from "./SummationMCGrader";
import { StandardFITBDropGrader, StandardFITBDropGraderSpecification } from "./StandardFITBDropGrader";
import { BugCatchingGrader, BugCatchingGraderSpecification } from "./BugCatchingGrader";

/**
 * ## TODO this documentation is old and needs to be updated Grading Exams
 * 
 * To start, you'll want to define some graders and a mapping from question IDs
 * for the questions you're using to those graders. You might put these in their own
 * files, or in the same file as the question definitions, or somewhere else.
 * Whatever organization you like is fine, as long as you can eventually import
 * the graders you define into your grading script.
 * 
 * The association between a question ID and the grader that handles that
 * question is done with a [[GraderMap]].
 * 
 * ### `src/rubric/tf.ts`
 * ```typescript
 * import { GraderMap, SimpleMCGrader } from "examma-ray";
 * export const TF_Graders : GraderMap = {
 *  "sp20_mc_time_complexity_1" : new SimpleMCGrader(0),
 *  "sp20_mc_time_complexity_2" : new SimpleMCGrader(0)
 * };
 * ```
 * 
 * ### `src/rubric/s7_3.ts`
 * ```typescript
 * import { GraderMap, SimpleMCGrader } from "examma-ray";
 * export const S7_3_Grader = {
 *   "sp20_7_3_assn_op": new StandardSLGrader([
 *     {
 *       title: "Function Header",
 *       description: `Function header has correct name, parameter, and return ...`,
 *       points: 1,
 *       required: [1],
 *       prohibited: [0]
 *     },
 *     {
 *       title: "Self-Assignment Check",
 *       description: "The function should compare the \`this\` pointer, which ...",
 *       points: 0.5,
 *       required: [3],
 *       prohibited: [2]
 *     },
 *     ...
 * ```
 * 
 * and so on...
 * 
 * Then, set up a top-level grading script to create an [[ExamGrader]], register
 * your graders with it, load exams, grade the exams, and write out reports:
 * 
 * ### `src/grade.ts`
 * ```typescript
 * import { ExamGrader } from "examma-ray";
 * import { exam } from "./exam-spec"
 * import { TF_Graders } from "./rubric/tf";
 * import { S7_3_Grader } from "./rubric/s7_3";
 * 
 * let grader = new ExamGrader(exam, [
 *   TF_Graders,
 *   S7_3_Grader
 * ]);
 * 
 * grader.loadAllSubmissions();
 * grader.gradeAll();
 * grader.writeAll();
 * ```
 * 
 * Note the import of `exam` in the example above. This comes from your exam
 * specification that you've created in a separate file. TODO link to that documentation.
 * 
 * You might also have some questions (e.g. open-ended code writing) that require
 * people to manually grade. Calling `gradeAll()` won't fully grade those, but
 * it will trigger the appropriate graders to create grading assignment files.
 * Once those are filled in, just run the grading script again and it will pick
 * up the human-generated results in those files.
 * 
 * 
 * Several graders are currently supported:

- `FreebieGrader` - Gives points to everyone (or, optionally, to all non-blank submissions)
- `SimpleMCGrader` - Grades an MC question with one right answer
- `SummationMCGrader` - Grades a multiple-select MC question where each selection is worth positive or negative points
- `FITBRegexGrader` - Uses regular expressions to grade each blank in an FITB question. Also comes with an interface for human review of unique answers
- `StandardSLGrader` - Grades SL ("select-a-statement") questions based on which lines should/shouldn't be included

The format for the graders looks like JSON, but it's actually typescript code defining an object literal, so autocomplete, etc. should be available in VS Code.

For the FITB Regex grader, you'll need to be familiar with javascript regular expression syntax.

- Tutorial/Documentation at [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- Interactive tool for testing out regexes, really neat. [https://regex101.com/](https://regex101.com/) Make sure to select the "ECMAScript/Javascript" flavor on the left side.
- Tip: Normally, the regex will match against any substring of what the student entered. If you want it to only match the WHOLE thing, use `^` and `$`. For example, if you're looking to match any decimal number `/[\d\.]+` will match `6.2` and `My answer is 6.2`, whereas `^[\d\.]+$` will only match `6.2`. Essentially `^` means "beginning of string" and `$` means "end of string".

For now, refer to examples of existing graders. More thorough documentation coming.


 * @module
 */



/**
 * An interface for question graders. A grader itself defines the grading process,
 * and may be instantiated e.g. with a particular rubric. A grader is immutable
 * during the grading process and calls to each of the functions are idempotent. In
 * other words, a grader does not "remember" the questions it grades.
 * 
 * @template RK The kind(s) of responses this grader can grade
 * @template GR Representation of a grading result from this kind of grader
 */
export interface QuestionGrader<RK extends ResponseKind = ResponseKind, GR extends GradingResult = GradingResult> {

  /**
   * Returns whether or not this grader can be used for the given response kind
   * @param responseKind 
   */
  isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T>;

  /**
   * Gives the grader a chance to do any one-time preparation depending on
   * the exam and question it is being used for. Generally, this is used to
   * process manual grading results, which are loaded externally and provided
   * as a parameter when `prepare()` is called.
   * @param exam_id 
   * @param question_id 
   * @param manual_grading
   */
  prepare(exam_id: string, question_id: string, grader_data: any): void;

  /**
   * Grades the given assigned question and returns the grading result. This function
   * does not itself modify the assigned question to contain the result (just returns it).
   * @param aq The assigned question to grade
   * @returns The result of 
   */
  grade(aq: AssignedQuestion<RK>): GR | undefined;

  /**
   * Computes the number of points earned for the given grading result.
   * Heads up! This could be negative or more than the number of points
   * a question is worth, depending on the type of grader. That's not the
   * concern of the grader, and it's presumed to be handled elsewhere
   * (e.g. by clamping the value between 0 and max points possible on a question).
   * @param gr 
   */
  pointsEarned(gr: GR): number;

  /**
   * Renders a report of how an individual question was graded to an HTML string.
   * @param gq 
   */
  renderReport(gq: GradedQuestion<RK, GR>): string;

  renderStats(aqs: readonly AssignedQuestion<RK>[]): string;

  /**
   * Renders an overview of the results on all graded questions to an HTML string.
   * @param gqs 
   */
  renderOverview(gqs: readonly GradedQuestion<RK>[]): string;

};


type GraderKind = 
  | "manual_code_writing"
  | "manual_regex_fill_in_the_blank"
  | "freebie"
  | "simple_multiple_choice"
  | "summation_multiple_choice"
  | "standard_select_lines"
  | "standard_fitb_drop"
  | "bug_catching"
  | "legacy_code_writing";

export type GraderSpecification<GK extends GraderKind = GraderKind> =
  GK extends "manual_code_writing" ? CodeWritingGraderSpecification :
  GK extends "manual_regex_fill_in_the_blank" ? FITBRegexGraderSpecification :
  GK extends "freebie" ? FreebieGraderSpecification :
  GK extends "simple_multiple_choice" ? SimpleMCGraderSpecification :
  GK extends "summation_multiple_choice" ? SummationMCGraderSpecification :
  GK extends "standard_select_lines" ? StandardSLGraderSpecification :
  GK extends "standard_fitb_drop" ? StandardFITBDropGraderSpecification :
  GK extends "bug_catching" ? BugCatchingGraderSpecification :
  GK extends "legacy_code_writing" ? LegacyCodeWritingGraderSpecification :
  never;

export type Grader<GK extends GraderKind = GraderKind> =
  GK extends "manual_code_writing" ? CodeWritingGrader :
  GK extends "manual_regex_fill_in_the_blank" ? FITBRegexGrader :
  GK extends "freebie" ? FreebieGrader :
  GK extends "simple_multiple_choice" ? SimpleMCGrader :
  GK extends "summation_multiple_choice" ? SummationMCGrader :
  GK extends "standard_select_lines" ? StandardSLGrader :
  GK extends "standard_fitb_drop" ? StandardFITBDropGrader :
  GK extends "bug_catching" ? BugCatchingGrader :
  GK extends "legacy_code_writing" ? LegacyCodeWritingGrader :
  never;

type ExtractViableGraders<G extends Grader, RK> = G extends Grader ? RK extends G["t_response_kinds"] ? G : never : never;

export type GraderSpecificationFor<RK extends ResponseKind> = ExtractViableGraders<Grader, RK>["spec"];
export type GraderFor<RK extends ResponseKind> = ExtractViableGraders<Grader, RK>;

export function realizeGrader<GK extends GraderKind>(spec: GraderSpecification<GK>) : Grader<GK> {
  return <Grader<GK>>(
    spec.grader_kind === "manual_code_writing" ? new CodeWritingGrader(spec) :
    spec.grader_kind === "manual_regex_fill_in_the_blank" ? new FITBRegexGrader(spec) :
    spec.grader_kind === "freebie" ? new FreebieGrader(spec) :
    spec.grader_kind === "simple_multiple_choice" ? new SimpleMCGrader(spec) :
    spec.grader_kind === "summation_multiple_choice" ? new SummationMCGrader(spec) :
    spec.grader_kind === "standard_select_lines" ? new StandardSLGrader(spec) :
    spec.grader_kind === "standard_fitb_drop" ? new StandardFITBDropGrader(spec) :
    spec.grader_kind === "bug_catching" ? new BugCatchingGrader(spec) :
    spec.grader_kind === "legacy_code_writing" ? new LegacyCodeWritingGrader(spec) :
    assertNever(spec)
  );
}


export type GradingResult = {
  wasBlankSubmission: boolean
}

export type ImmutableGradingResult = GradingResult & {
  readonly pointsEarned: number;
  readonly wasBlankSubmission: boolean;
  readonly wasInvalidSubmission?: boolean;
}
