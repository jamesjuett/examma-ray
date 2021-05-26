import { decode } from "he";
import { AssignedQuestion, GradedQuestion, Question } from "./exams";
import { ResponseKind } from "./response/common";
import { SubmissionType } from "./response/responses";
import { QuestionSkin } from "./skins";


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
   * the exam and question it is being used for. For example, a manually graded
   * question may prepare by loading its grading result data from files.
   * @param exam_id 
   * @param question_id 
   */
  prepare(exam_id: string, question_id: string): void;

  /**
   * Grades the given assigned question and returns the grading result. This function
   * does not itself modify the assigned question to contain the result (just returns it). 
   * @param aq The assigned question to grade
   * @returns The result of 
   */
  grade(aq: AssignedQuestion<RK>): GR | undefined;

  /**
   * Computes the number of points earned for the given graded question.
   * Heads up! This could be negative or more than the number of points
   * a question is worth, depending on the type of grader. That's not the
   * concern of the grader, and it's your decision on how to handle it elsewhere
   * (e.g. by clamping the value between 0 and max points possible on a question).
   * @param gr 
   */
  pointsEarned(gr: GR): number;

  /**
   * Renders a report of how the question was graded to an HTML string.
   * @param gq 
   */
  renderReport(gq: GradedQuestion<RK, GR>): string;


  renderStats(aqs: readonly AssignedQuestion<RK>[]): string;
  renderOverview(aqs: readonly AssignedQuestion<RK>[]): string;

};


export type GradingResult = {
  wasBlankSubmission: boolean
}

export type ImmutableGradingResult = GradingResult & {
  readonly pointsEarned: number;
  readonly wasBlankSubmission: boolean;
}
