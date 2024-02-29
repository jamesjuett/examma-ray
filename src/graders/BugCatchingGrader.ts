import { encode } from "he";
import { ResponseKind, BLANK_SUBMISSION } from "../response/common";
import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { mk2html } from "../core/render";
import { INVALID_SUBMISSION } from "../response/common";
import { GradingResult, QuestionGrader } from "./QuestionGrader";

const ICON_BUG_EMPTY = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bug" viewBox="0 0 16 16">
  <path d="M4.355.522a.5.5 0 0 1 .623.333l.291.956A4.979 4.979 0 0 1 8 1c1.007 0 1.946.298 2.731.811l.29-.956a.5.5 0 1 1 .957.29l-.41 1.352A4.985 4.985 0 0 1 13 6h.5a.5.5 0 0 0 .5-.5V5a.5.5 0 0 1 1 0v.5A1.5 1.5 0 0 1 13.5 7H13v1h1.5a.5.5 0 0 1 0 1H13v1h.5a1.5 1.5 0 0 1 1.5 1.5v.5a.5.5 0 1 1-1 0v-.5a.5.5 0 0 0-.5-.5H13a5 5 0 0 1-10 0h-.5a.5.5 0 0 0-.5.5v.5a.5.5 0 1 1-1 0v-.5A1.5 1.5 0 0 1 2.5 10H3V9H1.5a.5.5 0 0 1 0-1H3V7h-.5A1.5 1.5 0 0 1 1 5.5V5a.5.5 0 0 1 1 0v.5a.5.5 0 0 0 .5.5H3c0-1.364.547-2.601 1.432-3.503l-.41-1.352a.5.5 0 0 1 .333-.623zM4 7v4a4 4 0 0 0 3.5 3.97V7H4zm4.5 0v7.97A4 4 0 0 0 12 11V7H8.5zM12 6a3.989 3.989 0 0 0-1.334-2.982A3.983 3.983 0 0 0 8 2a3.983 3.983 0 0 0-2.667 1.018A3.989 3.989 0 0 0 4 6h8z"/>
</svg>`;

const ICON_BUG_FILLED = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bug-fill" viewBox="0 0 16 16">
  <path d="M4.978.855a.5.5 0 1 0-.956.29l.41 1.352A4.985 4.985 0 0 0 3 6h10a4.985 4.985 0 0 0-1.432-3.503l.41-1.352a.5.5 0 1 0-.956-.29l-.291.956A4.978 4.978 0 0 0 8 1a4.979 4.979 0 0 0-2.731.811l-.29-.956z"/>
  <path d="M13 6v1H8.5v8.975A5 5 0 0 0 13 11h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 1 0 1 0v-.5a1.5 1.5 0 0 0-1.5-1.5H13V9h1.5a.5.5 0 0 0 0-1H13V7h.5A1.5 1.5 0 0 0 15 5.5V5a.5.5 0 0 0-1 0v.5a.5.5 0 0 1-.5.5H13zm-5.5 9.975V7H3V6h-.5a.5.5 0 0 1-.5-.5V5a.5.5 0 0 0-1 0v.5A1.5 1.5 0 0 0 2.5 7H3v1H1.5a.5.5 0 0 0 0 1H3v1h-.5A1.5 1.5 0 0 0 1 11.5v.5a.5.5 0 1 0 1 0v-.5a.5.5 0 0 1 .5-.5H3a5 5 0 0 0 4.5 4.975z"/>
</svg>`;

const ICON_QUESTION_CIRCLE_FILL = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle-fill" viewBox="0 0 16 16">
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
</svg>`;

const CHECK_ICON = '<svg style="fill: green;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>';
const RED_X_ICON = '<svg style="fill: red;"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg>';


type TestCaseGradingResult = GradingResult & {
  bugs_caught: BugInfo[]
}

export type BugInfo = {
  num: number,
  name: string,
  description: string,

  /**
   * Indices of test cases that catch this bug
   */
  test_cases: number[]
};



export type BugCatchingGraderSpecification = {
  readonly grader_kind: "bug_catching",
  readonly bugs: readonly BugInfo[];
  readonly target: number;
  readonly points_possible: number;
};

export class BugCatchingGrader implements QuestionGrader<"multiple_choice"> {

  public readonly spec: BugCatchingGraderSpecification;

  public readonly t_response_kinds!: "multiple_choice";

  public constructor(spec: BugCatchingGraderSpecification) {
    this.spec = spec;

    // check that the bugs are catchable
    for (const bug of this.spec.bugs) {
      if (bug.test_cases.length === 0) {
        throw new Error(`Bug ${bug.num} is not catchable`);
      }
    }
  }
  
  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T, GradingResult> {
    return responseKind === "multiple_choice";
  }

  public prepare(exam_id: string, question_id: string, grader_data: any) {
    // do nothing
  }

  public grade(aq: AssignedQuestion<"multiple_choice">): TestCaseGradingResult {
    const choices = aq.submission;

    if(choices === INVALID_SUBMISSION) {
      return {
        bugs_caught: [],
        wasBlankSubmission: false,
      }
    }

    if (choices === BLANK_SUBMISSION || choices.length === 0) {
      return {
        bugs_caught: [],
        wasBlankSubmission: true,
      }
    }

    let bugs_caught = this.spec.bugs.filter(bug => bug.test_cases.some(tc => choices.indexOf(tc) !== -1));

    return {
      bugs_caught: bugs_caught,
      wasBlankSubmission: false,
    };

  }

  public pointsEarned(gr: TestCaseGradingResult): number {
    let bug_shortfall = this.spec.target - gr.bugs_caught.length;
    if (bug_shortfall <= 0) {
      return this.spec.points_possible;
    }
    else {
      return Math.max(0, this.spec.points_possible-bug_shortfall);
    }
  }

  public renderReport(gq: GradedQuestion<"multiple_choice", TestCaseGradingResult>): string {
    let question = gq.question;
    let gr = gq.gradingResult;
    let gr_bugs_caught = gr.bugs_caught.map(b=>b.num);
    let pts = this.pointsEarned(gr);
    if (gq.submission === BLANK_SUBMISSION) {
      return "Your submission for this question was blank.";
    }

    if (gq.submission === INVALID_SUBMISSION) {
      return "Your submission for this question was invalid.";
    }

    const chosen = gq.submission;

    return `
      <p>
        You caught ${gr.bugs_caught.length} out of ${this.spec.bugs.length} bugs, which earns ${gq.pointsEarned}/${gq.question.pointsPossible} points.
      </p>
      <table class="table table-sm" style="font-size: 9pt; text-align: center;">
        <tr>
          <th>Test Case<th>
          ${this.spec.bugs.map(bug_info => {
            let isCaught = gr_bugs_caught.indexOf(bug_info.num) !== -1;
            return `<th>
              ${bug_info.name}
              <a class="examma-ray-test-case-grader-tooltip link" data-toggle="tooltip" data-placement="top" data-html="true" title="${encode(mk2html(bug_info.description))}">${ICON_QUESTION_CIRCLE_FILL}</a>
              ${isCaught ? CHECK_ICON : RED_X_ICON}
            </th>`;
          }).join("")}
        </tr>
        ${question.response.choices.map((tc, i) => `
          <tr class="${chosen.indexOf(i) !== -1 ? "table-primary" : "table-default"}">
            <td style="text-align: left;">
              <input type="checkbox" ${chosen.indexOf(i) !== -1 ? "checked" : "disabled"}/>
              <label class="examma-ray-mc-option">${mk2html(tc, gq.skin)}</label>
            </td>
            <td>
              ${this.spec.bugs.map(bug => `
                <td>${bug.test_cases.indexOf(i) !== -1 ? ICON_BUG_FILLED : ""}</td>
              `).join("")}
            </td>
          </tr>`
        ).join("")}
      </table>
      <script>
        $(".examma-ray-test-case-grader-tooltip").tooltip();
      </script>
    `;
  }
  
  public annotateResponseElem(gq: GradedQuestion<"multiple_choice", TestCaseGradingResult>, response_elem: JQuery) {
    // not yet implemented
  }

  public renderStats(aqs: readonly AssignedQuestion<"multiple_choice">[]): string {
    return "";
  }

  public renderOverview(gqs: readonly GradedQuestion<"multiple_choice", TestCaseGradingResult>[]): string {
    return `
      <div>${this.spec.bugs.map(bug => {
        let numCatching = gqs.filter(gq => gq.gradingResult.bugs_caught.find(b => b.num == bug.num)).length;
        return `
          <div>
            Bug ${bug.num} caught by ${numCatching} / ${gqs.length}
          </div>
        `;}
      ).join("")}
      </div>
    `;
  }
  
}