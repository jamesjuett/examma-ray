import { AssignedQuestion, GradedQuestion } from "../exams";
import { BLANK_SUBMISSION, ResponseKind } from "../response/common";
import { QuestionGrader, GradingResult } from "../QuestionGrader";

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

export class CodeWritingGrader implements QuestionGrader<"code_editor"> {

  public readonly rubric: readonly CodeWritingRubricItem[];
  // public readonly results: QuestionGradingRecords<CodeWritingGradingResult>;
  public readonly staff: readonly string[];

  public constructor(rubric: readonly CodeWritingRubricItem[], staff: string[]) {
    this.rubric = rubric;
    this.staff = staff;
    // this.results = results;
  }

  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return responseKind === "code_editor";
  };
  
  // public prepareManualGrading(aqs: readonly AssignedQuestion<"code_editor">[]) {
  //   if (aqs.length === 0) {
  //     return;
  //   }
  //   let assns = this.createGradingAssignments(aqs);
  //   this.writeGradingAssignments(aqs[0].exam.exam_id, aqs[0].question.question_id, assns);
  // }

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

    return {
      wasBlankSubmission: false,
      itemResults: {
        // TODO PLACEHOLDER
      }
    };//this.results.getGradingRecord(aq.uuid).grading_result;
  }

  public pointsEarned(gr: CodeWritingGradingResult) {
    return Object.values(gr.itemResults).reduce((p, res, i) => p + (res?.status === "on" ? this.rubric[i].points : 0), 0);
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