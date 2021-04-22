import { AssignedQuestion, GradedQuestion } from "../exams";
import { GradingAssignmentSpecification, QuestionGradingRecords } from "../grading/common";
import { BLANK_SUBMISSION, ResponseKind } from "../response/common";
import { QuestionGrader, GradingResult } from "../QuestionGrader";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { asMutable, assert } from "../util";
import { stringify_response } from "../response/responses";
import { chunk } from "simple-statistics";

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
  
  public prepareManualGrading(aqs: readonly AssignedQuestion<"code_editor">[]) {
    if (aqs.length === 0) {
      return;
    }
    let assns = this.createGradingAssignments(aqs);
    this.writeGradingAssignments(aqs[0].exam.exam_id, aqs[0].question.question_id, assns);
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



  private createGradingAssignments(aqs: readonly AssignedQuestion<"code_editor">[]) : GradingAssignmentSpecification[] {
    let aq = aqs[0];
    let chunks = chunk(asMutable(aqs), Math.ceil(aqs.length / this.staff.length))
    assert(chunks.length === this.staff.length, "Not enough exams to split between that many staff");
    return chunks.map((c, i) => ({
      staff_uniqname: this.staff[i],
      question_id: aq.question.question_id,
      groups: c.map((aq,i) => ({
        submissions: [{
          question_uuid: aq.uuid,
          skin_replacements: aq.skin.replacements,
          student: aq.student,
          response: stringify_response(aq.submission)
        }],
        name: "group_" + i,
        representative_index: 0
      }))
    }));
  }

  private writeGradingAssignments(exam_id: string, question_id: string, assns: GradingAssignmentSpecification[]) {

    const dir = `manual_grading/${exam_id}`;

    // Create output directories
    // (DO NOT CLEAR THEM OUT - we don't want to accidentally overwrite previous grading results)
    mkdirSync(dir, { recursive: true });

    // Is it safe to write grading assignments, or would we overwrite something?
    let wouldOverwrite = assns.some(assn => existsSync(`${dir}/${assn.staff_uniqname}-${assn.question_id}.json`));

    if (!wouldOverwrite) {
      assns.forEach(assn => writeFileSync(
        `${dir}/${assn.staff_uniqname}-${assn.question_id}.json`,
        JSON.stringify(assn, null, 2),
        { flag: "wx" } // Refuse to overwrite previous files (which could lose manual grading data)
      ));
    }
    else {
      console.log(`Note: manual grading files for exam ${exam_id} and question ${question_id} already exist. Not generating new ones.`);
    }

  }

}