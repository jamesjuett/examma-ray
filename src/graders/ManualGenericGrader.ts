import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { ICON_INFO } from "../core/icons";
import { applySkin, highlightCode, mk2html, mk2html_unwrapped } from "../core/render";
import { renderGradingProgressBar, renderShortPointsWorthBadge } from "../core/ui_components";
import { assert } from "../core/util";
import { ResponseKind } from "../response/common";
import { createFilledFITBDrop, mapSkinOverSubmission } from "../response/fitb-drop";
import { createFilledFITB } from "../response/util-fitb";
import { QuestionGrader } from "./QuestionGrader";

export type CodeWritingRubricItemStatus = "on" | "off" | "unknown";
// type ManualOverrideRubricItemStatus = "on" | "off";

export type CodeWritingRubricItem = {
  rubric_item_uuid: string,
  points: number,
  title: string,
  description: string,
  sort_index?: string,
  active: boolean
};


export type ManualGenericGraderSpecification = {
  readonly grader_kind: "manual_generic",
  readonly points_possible: number,
}

export type CodeWritingRubricItemResult = {
  status?: "on" | "off" | "unknown",
  notes?: string
};

export type CodeWritingRubricResult = {
  [index: string]: CodeWritingRubricItemResult | undefined
}

export type ManualGenericGraderSubmissionResult = {
  submission_uuid: string,
  finished?: boolean,
  grader?: string,
  rubric_items: CodeWritingRubricResult
}

export type ManualGenericGraderGradingResult = ManualGenericGraderSubmissionResult & {
  wasBlankSubmission: boolean
};

export type ManualGenericGraderData = {
  rubric: CodeWritingRubricItem[],
  submission_results: ManualGenericGraderSubmissionResult[]
};

function isMeaningfulRubricItemGradingResult(ri: CodeWritingRubricItemResult | undefined) {
  return ri && (ri.status !== undefined && ri.status !== "off" || ri.notes)
}

function isMeaningfulManualGradingResult(gr: ManualGenericGraderSubmissionResult) {
  return gr.finished || Object.values(gr.rubric_items).some(ri => isMeaningfulRubricItemGradingResult(ri));
}

export class ManualGenericGrader implements QuestionGrader<ResponseKind, ManualGenericGraderGradingResult> {

  public readonly t_response_kinds!: ResponseKind;

  public readonly spec: ManualGenericGraderSpecification;

  private rubric: CodeWritingRubricItem[] = [];
  private grading_data?: ManualGenericGraderData;
  private submission_results: {[index: string]: ManualGenericGraderSubmissionResult | undefined} = {};

  public constructor(spec: ManualGenericGraderSpecification) {
    this.spec = spec;
  }
  
  public scale(new_points_possible: number) {
    if (new_points_possible !== this.spec.points_possible) {
      console.log(`Warning: ManualGenericGrader does not support scaling. Requested points possible: ${new_points_possible}, original points possible: ${this.spec.points_possible}`);
    }
    return this;
  }

  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return true;
  }

  public prepare(exam_id: string, question_id: string, grading_data: ManualGenericGraderData) {
    assert(!this.grading_data);

    this.grading_data = grading_data;
    this.rubric = grading_data.rubric;
    this.submission_results = {};
    grading_data.submission_results.forEach(sub => this.submission_results[sub.submission_uuid] = sub);
  }
  
  // public prepareManualGrading(aqs: readonly AssignedQuestion[]) {
  //   if (aqs.length === 0) {
  //     return;
  //   }
  //   let assns = this.createGradingAssignments(aqs);
  //   this.writeGradingAssignments(aqs[0].exam.exam_id, aqs[0].question.question_id, assns);
  // }

  public grade(aq: AssignedQuestion<ResponseKind>) : ManualGenericGraderGradingResult | undefined {
    assert(this.grading_data, `Question ${aq.question.question_id}: Grader prepare() function must be called before attempting grading.`);
    if (aq.submission.validity === "blank") {
      return {
        submission_uuid: aq.uuid,
        wasBlankSubmission: true,
        finished: true,
        rubric_items: {},
      };
    }

    let manual_grading_result = this.submission_results[aq.uuid];

    if (manual_grading_result && isMeaningfulManualGradingResult(manual_grading_result)) {
      return {
        ...manual_grading_result,
        wasBlankSubmission: false
      };
    }
    else {
      return undefined;
    }

  }

  public pointsEarned(gr: ManualGenericGraderGradingResult) {
    return Object.values(this.rubric).reduce((p, ri) => p + (gr.rubric_items[ri.rubric_item_uuid]?.status === "on" ? ri.points : 0), 0);
  }

  public renderReport(aq: GradedQuestion<ResponseKind, ManualGenericGraderGradingResult>) {
    let gr = aq.gradingResult;

    if (aq.submission.validity === "blank" || gr.wasBlankSubmission) {
      return "Your answer for this question was blank.";
    }

    const skin = aq.skin;
    let studentSubmission_html = "";
    let sampleSolution_html = "";
    const res = aq.gradingResult;
    if (aq.isKind("code_editor")) {
      const response = aq.question.response;
      studentSubmission_html = `
        <div class="examma-ray-code-editor-header">
          ${response.header ? `<pre><code>${highlightCode(applySkin(response.header, skin), response.code_language)}</code></pre>` : ""}
        </div>
        <div class="examma-ray-code-editor-submission">
          ${`<pre><code>${highlightCode(aq.submission.encoding, response.code_language)}</code></pre>`}
        </div>
        <div class="examma-ray-code-editor-footer">
          ${response.footer ? `<pre><code>${highlightCode(applySkin(response.footer, skin), response.code_language)}</code></pre>` : ""}
        </div>
      `;
      // TODO: eliminate code duplication
      if (aq.question.sampleSolution) {
        sampleSolution_html = `
          <div class="examma-ray-code-editor-header">
            ${response.header ? `<pre><code>${highlightCode(applySkin(response.header, skin), response.code_language)}</code></pre>` : ""}
          </div>
          <div class="examma-ray-code-editor-submission">
            ${`<pre><code>${highlightCode(""+applySkin(aq.question.sampleSolution.encoding, skin), response.code_language)}</code></pre>`}
          </div>
          <div class="examma-ray-code-editor-footer">
            ${response.footer ? `<pre><code>${highlightCode(applySkin(response.footer, skin), response.code_language)}</code></pre>` : ""}
          </div>
        `;
      }
    }
    else if (aq.isKind("fill_in_the_blank")) {
      const question = aq.question;
      let content = question.response.content;
      let enc = aq.submission.encoding;

      studentSubmission_html = createFilledFITB(applySkin(content, skin), enc); //, content, scores);
      if (question.sampleSolution) {
        sampleSolution_html = createFilledFITB(applySkin(content, skin), question.sampleSolution.encoding.map(s => applySkin(s, skin))); //, content, scores);
      }
      
    }
    else if (aq.isKind("fitb_drop")) {
      const question = aq.question;
      let response = question.response;
      let enc = aq.submission.encoding;
      let group_id = response.group_id ?? question.question_id;
      // createFilledFITBDrop(applySkin(response.content, skin), response.droppables, group_id, skin, response.starter)
      studentSubmission_html = createFilledFITBDrop(
        applySkin(response.content, skin),
        response.droppables,
        group_id,
        skin,
        enc
      );

      if (question.sampleSolution) {

        sampleSolution_html = createFilledFITBDrop(
          applySkin(response.content, skin),
          response.droppables,
          group_id,
          skin,
          mapSkinOverSubmission(question.sampleSolution.encoding, skin)
        );
      }
      
    }
    else {
      const question = aq.question;
      const submission = aq.submission;
      studentSubmission_html = question.renderResponseSolution(aq.uuid, submission, skin);
      if (question.sampleSolution) {
        sampleSolution_html = question.renderResponseSolution(aq.uuid, question.sampleSolution, skin);
      }
    }

    
    return `
      ${Object.values(res.rubric_items).some(r => r?.notes) ? `${ICON_INFO} This icon appears on rubric items with notes form the grader. Hover over the icon to view them.` : ""}
      <table>
        <tr style="text-align: center;">
          <th>Rubric</th>
          <th>Your Submission</th>
          ${aq.question.sampleSolution ? `<th>Sample Solution</th>` : ""}
        </tr>
        <tr>
          <td>
            <ul class="list-group examma-ray-manual-graded-rubric">
              ${this.rubric.sort((a,b) => (a.sort_index ?? "")?.localeCompare(b.sort_index ?? "")).map(ri => {
                let itemResult = res.rubric_items[ri.rubric_item_uuid];
                let statusClass = "";
                if (itemResult?.status === "on") {
                  if (ri.points > 0) {
                    statusClass = "list-group-item-success"
                  }
                  else if (ri.points === 0) {
                    statusClass = "list-group-item-secondary"
                  }
                  else {
                    statusClass = "list-group-item-danger"
                  }
                }
                return `
                <li class="list-group-item examma-ray-manual-graded-rubric-item ${statusClass}">
                  ${renderShortPointsWorthBadge(ri.points)}
                  <b><p>
                    ${itemResult?.notes ? `<span data-toggle="tooltip" data-placement="top" title="${itemResult.notes}">${ICON_INFO}</span>` : ""}
                    ${mk2html_unwrapped(ri.title, skin)}
                  </p></b>
                  ${mk2html(ri.description, skin)}
                </li>
              `}).join("")}
            </ul>
          </td>
          <td style="padding: 1em;">
            ${studentSubmission_html}
          </td>
          ${sampleSolution_html ? `
          <td style="padding: 1em;">
            ${sampleSolution_html}
          </td>` : ""}
        </tr>
      </table>
    `;
  }

  public annotateResponseElem(aq: GradedQuestion<ResponseKind, ManualGenericGraderGradingResult>, response_elem: JQuery) {
    // not yet implemented
  };

  
  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview() {
    assert(this.grading_data, "Grader prepare() function must be called before attempting grading.");
    let numGraded = this.grading_data.submission_results.filter(sub => sub.finished).length;
    let numSubmissions = this.grading_data.submission_results.length;
    return `<div>${renderGradingProgressBar(numGraded, numSubmissions)}</div>`;
  }




}