import { applySkin, mk2html } from "../render";
import { renderScoreBadge } from "../ui_components";
import { Question } from "../exams";
import { BLANK_SUBMISSION } from "../response/common";
import { SASItem, SASSubmission } from "../response/select_a_statement";
import { Grader } from "./common";
import { CHECK_ICON, RED_X_ICON } from "../icons";
import { QuestionSkin } from "../skins";

type SASRubricItem = {
  points: number;
  required: number[];
  prohibited: number[];
  title: string;
  description: string;
};
function gradeSASRubricItem(rubricItem: SASRubricItem, submission: SASSubmission) {
  if (submission === BLANK_SUBMISSION ||
    !rubricItem.required.every(line => submission.indexOf(line) !== -1) ||
    !rubricItem.prohibited.every(line => submission.indexOf(line) === -1)) {
    return 0;
  }

  return rubricItem.points;
}



export class StandardSASGrader implements Grader<"select_a_statement"> {

  public readonly questionType = "select_a_statement";

  public constructor(
    public readonly rubric: readonly SASRubricItem[]
  ) { }

  public grade(question: Question<"select_a_statement">, submission: SASSubmission) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return 0;
    }

    return this.rubric.reduce((prev, rubricItem) => prev + gradeSASRubricItem(rubricItem, submission), 0);
  }

  public renderReport(question: Question<"select_a_statement">, submission: SASSubmission, skin: QuestionSkin | undefined) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return "Your answer for this question was blank.";
    }

    let score = this.grade(question, submission);
    return `
    <table class="examma-ray-sas-diff table table-sm">
      <tr><th>Rubric</th><th>Your Code</th><th>Solution</th></tr>
      ${this.rubric.map((rubricItem, i) => {
        let included = rubricItem.required.concat(rubricItem.prohibited).filter(line => submission.indexOf(line) !== -1);
        let missing = rubricItem.required.filter(line => submission.indexOf(line) === -1);
        let extra = rubricItem.prohibited.filter(line => submission.indexOf(line) !== -1);
        let riScore = gradeSASRubricItem(rubricItem, submission);

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
        let elem_id = `question-${question.question_id}-item-${i}`;

        return `
          <tr>
            <td class="examma-ray-sas-rubric-item">
              <div id="${elem_id}" class="card rubric-item-card">
                <div class="card-header">
                  <a class="nav-link" data-toggle="collapse" data-target="#${elem_id}-details" role="button" aria-expanded="false" aria-controls="${elem_id}-details">${renderScoreBadge(riScore, rubricItem.points)} ${mk2html(rubricItem.title)}</a>
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
              : (included.map(line => `<pre>${rubricItem.required.indexOf(line) !== -1 ? CHECK_ICON : RED_X_ICON} <code class="language-cpp">${applySkin((<SASItem>question.response.choices[line]).text, skin)}</code></pre>`).join('<br style="font-size: 0.3rem"/>'))}
            </td>
            <td>${rubricItem.required.map(line => `<pre><code class="language-cpp">${applySkin((<SASItem>question.response.choices[line]).text, skin)}</code></pre>`).join('<br style="font-size: 0.3rem"/>')}</td>
          </tr>`;
    }).join("")}
    </table>`;
  }
  // TODO ^^^ make this handle groups as well
  // TODO ^^^ take out hardcoded cpp
  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview() {
    return "Overview is not implemented for this question/grader type yet.";
  }
}
