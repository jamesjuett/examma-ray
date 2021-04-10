import { AssignedQuestion, GradedQuestion } from "../exams";
import { QuestionGradingRecords } from "../grading/common";
import { BLANK_SUBMISSION } from "../response/common";
import { Grader, GradingResult } from "./common";

type AutograderRubricItemStatus = "on" | "off" | "unknown";
type ManualOverrideRubricItemStatus = "on" | "off";

export type CodeWritingRubricItem = {
  id: string,
  points: number,
  title: string,
  description: string
};

export type CodeWritingRubricItemGradingResult = {
  auto_graded_status?: AutograderRubricItemStatus,
  manual_override_status?: ManualOverrideRubricItemStatus,
  pointsEarned: number,
  verified: boolean
};

export type CodeWritingGradingResult = GradingResult & {
  itemResults: CodeWritingRubricItemGradingResult[]
};

export class CodeWritingGrader implements Grader<"code_editor"> {

  public readonly questionType = "code_editor";
  public readonly rubric: readonly CodeWritingRubricItem[];
  public readonly results: QuestionGradingRecords<CodeWritingGradingResult>;

  public constructor(rubric: readonly CodeWritingRubricItem[], results: QuestionGradingRecords<CodeWritingGradingResult>) {
    this.rubric = rubric;
    this.results = results;
  }

  public grade(aq: AssignedQuestion<"code_editor">) : CodeWritingGradingResult {
    let submission = aq.submission;
    let code: string;
    if (submission === BLANK_SUBMISSION || submission === "") {
      return {
        wasBlankSubmission: false,
        pointsEarned: 0,
        itemResults: []
      };
    }

    code = submission;

    // let rubricItemResults : CodeWritingRubricItemGradingResult[] = this.rubric.map(rubricItem => {
    //   let ag_status = rubricItem.autograder?.evaluate(code);
    //   return {
    //     auto_graded_status: ag_status,
    //     pointsEarned: rubricItem.points,
    //     verified: false
    //   };
    // });

    return this.results.getGradingRecord(aq.uuid).grading_result;
  }

  public renderReport(aq: GradedQuestion<"code_editor", CodeWritingGradingResult>) {
    let gr = aq.gradingResult;

    if (gr.wasBlankSubmission) {
      return "Your answer for this question was blank.";
    }

    return `
      <div>
      ${gr.itemResults.map(itemResult => JSON.stringify(itemResult)).join("<br />")}
      </div>
    `;
  }

  
  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview() {
    return "Overview is not implemented for this question/grader type yet.";
  }

}