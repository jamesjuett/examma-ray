import { AssignedQuestion, GradedQuestion } from "../exams";
import { QuestionGradingRecords } from "../grading/common";
import { BLANK_SUBMISSION } from "../response/common";
import { Grader, GradingResult } from "./common";

export type CodeWritingRubricItemStatus = "on" | "off" | "unknown";
// type ManualOverrideRubricItemStatus = "on" | "off";

export type CodeWritingRubricItem = {
  id: string,
  points: number,
  title: string,
  description: string
};

export type CodeWritingRubricItemGradingResult = {
  status: CodeWritingRubricItemStatus,
  // manual_override_status?: ManualOverrideRubricItemStatus,
  // verified: boolean
};

export type CodeWritingGradingResult = GradingResult & {
  /** Maps rubric item ID to result*/
  itemResults: {
    [index: string]: CodeWritingRubricItemGradingResult | undefined
  },
  verified?: boolean
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
        itemResults: {}
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

  public pointsEarned(aq: GradedQuestion<"code_editor", CodeWritingGradingResult>) {
    return Math.max(0, Math.min(aq.question.pointsPossible,
      Object.values(aq.gradingResult.itemResults).reduce((p, res, i) => p + (res?.status === "on" ? this.rubric[i].points : 0), 0)
    ));
  }

  public renderReport(aq: GradedQuestion<"code_editor", CodeWritingGradingResult>) {
    let gr = aq.gradingResult;

    if (gr.wasBlankSubmission) {
      return "Your answer for this question was blank.";
    }

    return `
      <div>
      ${this.rubric.map(ri => JSON.stringify(gr.itemResults[ri.id])).join("<br />")}
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