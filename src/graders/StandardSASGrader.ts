import { applySkin, highlightCode, mk2html } from "../render";
import { renderScoreBadge } from "../ui_components";
import { AssignedQuestion, GradedQuestion, Question } from "../exams";
import { BLANK_SUBMISSION, ResponseKind } from "../response/common";
import { SASItem, SASSubmission } from "../response/select_a_statement";
import { QuestionGrader, GradingResult, ImmutableGradingResult } from "../QuestionGrader";
import { CHECK_ICON, RED_X_ICON } from "../icons";
import { QuestionSkin } from "../skins";
import { assert } from "../util";


export type StandardSASGradingResult = ImmutableGradingResult & {
  readonly itemResults: readonly {
    applied: boolean,
    submittedLines: number[]
  }[]
};

type SASRubricItem = {
  points: number;
  required: number[];
  prohibited: number[];
  title: string;
  description: string;
};

function gradeSASRubricItem(rubricItem: SASRubricItem, submission: Exclude<SASSubmission, typeof BLANK_SUBMISSION>) {
  return {
    applied: rubricItem.required.every(line => submission.indexOf(line) !== -1) && !rubricItem.prohibited.some(line => submission.indexOf(line) !== -1),
    submittedLines: rubricItem.required.concat(rubricItem.prohibited).filter(line => submission.indexOf(line) !== -1)
  };
}


export class StandardSASGrader implements QuestionGrader<"select_a_statement"> {

  public constructor(
    public readonly rubric: readonly SASRubricItem[]
  ) { }

  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return responseKind === "select_a_statement";
  };

  public prepare() { }

  public grade(aq: AssignedQuestion<"select_a_statement">) : StandardSASGradingResult {
    let orig_submission = aq.submission;
    if (orig_submission === BLANK_SUBMISSION || orig_submission.length === 0) {
      return {
        wasBlankSubmission: true,
        pointsEarned: 0,
        itemResults: []
      };
    }
    let submission = orig_submission;

    let itemResults = this.rubric.map(rubricItem => gradeSASRubricItem(rubricItem, submission));
    return {
      wasBlankSubmission: false,
      pointsEarned: itemResults.reduce((p, r, i) => p + (r.applied ? this.rubric[i].points : 0), 0),
      itemResults: itemResults
    }
  }

  public pointsEarned(gr: StandardSASGradingResult) {
    return gr.pointsEarned;
  }

  public renderReport(aq: GradedQuestion<"select_a_statement", StandardSASGradingResult>) {
    let question = aq.question;
    let orig_submission = aq.submission;
    let submission: readonly number[];
    let gr = aq.gradingResult;
    if (gr.wasBlankSubmission) {
      return "Your answer for this question was blank.";
    }
    else {
      assert(orig_submission !== BLANK_SUBMISSION)
      submission = orig_submission;
    }

    let skin = aq.skin;

    let itemResults = gr.itemResults;
    assert(itemResults.length === this.rubric.length);

    return `
    <table class="examma-ray-sas-diff table table-sm">
      <tr><th>Rubric</th><th>Your Code</th><th>Solution</th></tr>
      ${itemResults.map((itemResult, i) => {
        let rubricItem = this.rubric[i];
        let included = rubricItem.required.concat(rubricItem.prohibited).filter(line => submission.indexOf(line) !== -1);
        let riScore = itemResult.applied ? rubricItem.points : 0;

        // let details: string;
        // if (missing.length === 0 && extra.length === 0) {
        //   details = `Your code contains the correct conceptual components for this task, including these lines:<ul>${rubricItem.required.map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
        // }
        // else if (missing.length > 0) {
        //   details = `Your code is missing these lines (or they are misplaced):<ul>${missing.map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
        // }
        // else {
        //   details = `Your code contains these incorrect lines (or they are misplaced):<ul>${extra.map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
        //   details += `<br />The correct solution needed this line:<ul>${rubricItem.required.map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
        // }
        // if (missing.length === 0 && extra.length === 0) {
        // details = `Your code contains these lines:<ul>${rubricItem.required.concat(rubricItem.prohibited).filter(line => submission.indexOf(line) !== -1).map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
        // details += `<br />The solution should contain these lines (and these lines only):<ul>${rubricItem.required.map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
        let elem_id = `question-${aq.uuid}-item-${i}`;

        return `
          <tr>
            <td class="examma-ray-sas-rubric-item">
              <div id="${elem_id}" class="card rubric-item-card">
                <div class="card-header">
                  <a class="nav-link" data-toggle="collapse" data-target="#${elem_id}-details" role="button" aria-expanded="false" aria-controls="${elem_id}-details">${renderScoreBadge(riScore, rubricItem.points)} ${mk2html(rubricItem.title, skin)}</a>
                </div>
                <div class="collapse" id="${elem_id}-details">
                  <div class="card-body">
                    ${mk2html(rubricItem.description, skin)}
                  </div>
                </div>
              </div>
            </td>
            <td>${included.length === 0
              ? `<pre style="font-style: italic">${rubricItem.required.length === 0 ? CHECK_ICON : RED_X_ICON} (no selection)</pre>`
              : (included.map(line => `<pre>${rubricItem.required.indexOf(line) !== -1 ? CHECK_ICON : RED_X_ICON} <code>${highlightCode(applySkin((<SASItem>question.response.choices[line]).text, skin), question.response.code_language)}</code></pre>`).join('<br style="font-size: 0.3rem"/>'))}
            </td>
            <td>${rubricItem.required.map(line => `<pre><code>${highlightCode(applySkin((<SASItem>question.response.choices[line]).text, skin), question.response.code_language)}</code></pre>`).join('<br style="font-size: 0.3rem"/>')}</td>
          </tr>`;
    }).join("")}
    </table>`;
  }
  // TODO ^^^ make this handle groups as well
  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview() {
    return "Overview is not implemented for this question/grader type yet.";
  }
}
