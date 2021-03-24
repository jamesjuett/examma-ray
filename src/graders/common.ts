import { decode, encode } from "he";
import { min } from "simple-statistics";
import { mk2html } from "../../render";
import { renderNumBadge, renderScoreBadge } from "../common";
import { Question } from "../exams";
import { ResponseKind, BLANK_SUBMISSION } from "../response/common";
import { createFilledFITB, FITBSubmission } from "../response/fitb";
import { MCSubmission } from "../response/multiple_choice";
import { SubmissionType } from "../response/responses";
import { SASSubmission } from "../response/select_a_statement";
import { assert, assertFalse } from "../util";

export interface Grader<QT extends ResponseKind = ResponseKind> {
  readonly questionType: QT;
  grade(question: Question<QT>, submission: SubmissionType<QT>): number;
  renderReport(question: Question<QT>, submission: SubmissionType<QT>): string;
  renderStats(question: Question<QT>, submissions: readonly SubmissionType<QT>[]): string;
  renderOverview(question: Question<QT>, submissions: readonly SubmissionType<QT>[]): string;

};

export function isGrader<QT extends ResponseKind>(grader: Grader, questionType: QT) : grader is Grader<QT> {
  return grader.questionType === questionType;
}


export class FreebieGrader<QT extends ResponseKind> implements Grader<QT>{

  /**
   * 
   * @param pointValue How many points are awarded for answering the question.
   */
  public constructor(
    public readonly pointValue: number,
    public readonly questionType: QT,
    public readonly blankAllowed = false
  ) { }

  public grade(question: Question<QT>, submission: SubmissionType<QT>) {
    return this.blankAllowed || submission !== BLANK_SUBMISSION ? this.pointValue : 0;
  }

  public renderReport(question: Question<QT>, submission: SubmissionType<QT>) {
    if (!this.blankAllowed && submission === BLANK_SUBMISSION) {
      return "You did not select an answer for this question.";
    }
    else {
      return `<span class="examma-ray-grading-annotation">You earned ${this.pointValue}/${question.pointsPossible} points for answering this question.</span>`;
    }
  }

  public renderStats(question: Question<QT>, submissions: readonly SubmissionType<QT>[]) {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview(question: Question<QT>, submissions: readonly SubmissionType<QT>[]) {
    if (this.blankAllowed) {
      return `Assigned ${this.pointValue} freebie points to all ${submissions.length} submissions.`;
    }
    else {
      let numBlank = submissions.filter(sub => sub === BLANK_SUBMISSION).length;
      let numNonBlank = submissions.length - numBlank;
      return `Assigned ${this.pointValue} freebie points to ${numNonBlank} submissions.<br />Assigned 0 points to ${numBlank} blank submissions.`;
    }
  }
}

export class SimpleMCGrader implements Grader<"multiple_choice">{

  public readonly questionType = "multiple_choice";

  /**
   * 
   * @param correctIndex 0-based index of correct answer.
   */
  public constructor(
    public readonly correctIndex: number
  ) { }

  public grade(question: Question<"multiple_choice">, submission: MCSubmission) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return 0;
    }
    
    assert(submission.length <= 1, `${question}\nSimpleMCGrader cannot be used for questions where more than one selection is allowed.`);

    return submission[0] === this.correctIndex ? question.pointsPossible : 0;
  }

  public renderReport(question: Question<"multiple_choice">, submission: MCSubmission) {
    // if (submission === BLANK_SUBMISSION || submission.length === 0) {
    //   return "You did not select an answer for this question.";
    // }
    
    assert(submission === BLANK_SUBMISSION || submission.length <= 1, "SimpleMCGrader cannot be used for questions where more than one selection is allowed.");

    let score = this.grade(question, submission);
    let chosen : number = submission === BLANK_SUBMISSION || submission.length === 0 ? -1 : submission[0];

    let report = `
      <form>
      ${question.response.choices.map((item,i) => `
        <div><input type="radio" ${i === chosen ? "checked" : "disabled"}/>
        <label class="examma-ray-mc-option ${i === this.correctIndex ? "examma-ray-correct" : "examma-ray-incorrect"}">${mk2html(item)}</label></div>`).join("")}
      </form>
      
      `;
      if (chosen !== -1) {
        report += `<span class="examma-ray-grading-annotation">${chosen === this.correctIndex ? `You selected item ${chosen+1}, which was correct.` : `You selected item ${chosen+1}, but the correct answer was item ${this.correctIndex+1}.`}</span>`;
      }
      else {
        report += `<span class="examma-ray-grading-annotation">You did not select an answer for this question.`;
      }
      return report;
  }

  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview(question: Question<"multiple_choice">, submissions: readonly SubmissionType<"multiple_choice">[]) {
    let f = function (sub:MCSubmission) : sub is number[] {
      return sub !== BLANK_SUBMISSION && sub.length > 0;
    }
    let nonBlankSubmissions = submissions.filter(f);
    let numBlank = submissions.length - nonBlankSubmissions.length;

    assert(nonBlankSubmissions.every(sub => sub.length === 1), "SimpleMCGrader cannot be used for questions where more than one selection is allowed.");
    
    let selectionChoices = nonBlankSubmissions.map(sub => sub[0]);

    let maxSelection = Math.max(...selectionChoices);
    let hist: number[] = [];
    for(let i = 0; i <= maxSelection; ++i) { // Note: <= is correct here!
      hist.push(0);
    }
    selectionChoices.forEach(c => ++hist[c]);

    let numCorrect = selectionChoices.filter(c => c === this.correctIndex).length;
    let percentCorrect = numCorrect / submissions.length;

    return `
      ${hist.map((count, i) => `<div class="examma-ray-mc-option">${renderNumBadge(count)} ${i === this.correctIndex ? CHECK_ICON : RED_X_ICON} ${mk2html(question.response.choices[i])}</div>`).join("")}
      <div class="examma-ray-mc-option">${renderNumBadge(numBlank)} ${RED_X_ICON} BLANK</div>
    `;
  }
}

function renderPointAdjustmentBadge(pointAdjustment: number) {
  return `<span class="badge ${
    pointAdjustment === 0 ? "badge-secondary" :
    pointAdjustment < 0 ? "badge-danger" :
    "badge-success"
  } examma-ray-point-adjustment-badge">${pointAdjustment > 0 ? "+"+pointAdjustment : pointAdjustment === 0 ? "n/a" : pointAdjustment}</span>`;
}


export class SummationMCGrader implements Grader<"multiple_choice">{

  public readonly questionType = "multiple_choice";

  /**
   * 
   * @param pointValues For each answer option, points to add (or subtract if negative) if that option was selected
   */
  public constructor(
    public readonly pointValues: readonly number[]
  ) { }

  public grade(question: Question<"multiple_choice">, submission: MCSubmission) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return 0;
    }

    return Math.max(0, Math.min(question.pointsPossible, submission.reduce((prev, selection) => prev + this.pointValues[selection], 0)));
  }

  public renderReport(question: Question<"multiple_choice">, submission: MCSubmission) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return "You did not select an answer for this question.";
    }

    let score = this.grade(question, submission);

    return `
      <form class="examma-ray-summation-grader">
      ${question.response.choices.map((item,i) => {
        let chosen = submission.indexOf(i) !== -1;
        return `
          <div><span ${!chosen ? 'style="visibility: hidden"': ""}>${renderPointAdjustmentBadge(this.pointValues[i])}</span><input type="checkbox" ${chosen ? "checked" : ""} style="pointer-events: none;" />
          <label class="examma-ray-mc-option">${mk2html(item)}</label></div>`}
      ).join("")}
      </form>
    `
  }

  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview() {
    return "Overview is not implemented for this question/grader type yet.";
  }
}

type SASRubricItem = {
  points: number,
  required: number[],
  prohibited: number[],
  title: string,
  description: string
};

function gradeSASRubricItem(rubricItem: SASRubricItem, submission: SASSubmission) {
  if (submission === BLANK_SUBMISSION ||
      !rubricItem.required.every(line => submission.indexOf(line) !== -1) ||
      !rubricItem.prohibited.every(line => submission.indexOf(line) === -1)) {
    return 0;
  }
  
  return rubricItem.points;
}

// https://primer.style/octicons/
const CHECK_ICON = '<svg style="fill: green;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>';
const YELLOW_X_ICON = '<svg style="fill: yellow;"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg>';
const RED_X_ICON = '<svg style="fill: red;"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path></svg>';
const QUESTION_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zM6.92 6.085c.081-.16.19-.299.34-.398.145-.097.371-.187.74-.187.28 0 .553.087.738.225A.613.613 0 019 6.25c0 .177-.04.264-.077.318a.956.956 0 01-.277.245c-.076.051-.158.1-.258.161l-.007.004a7.728 7.728 0 00-.313.195 2.416 2.416 0 00-.692.661.75.75 0 001.248.832.956.956 0 01.276-.245 6.3 6.3 0 01.26-.16l.006-.004c.093-.057.204-.123.313-.195.222-.149.487-.355.692-.662.214-.32.329-.702.329-1.15 0-.76-.36-1.348-.863-1.725A2.76 2.76 0 008 4c-.631 0-1.155.16-1.572.438-.413.276-.68.638-.849.977a.75.75 0 101.342.67z"></path></svg>';

export class StandardSASGrader implements Grader<"select_a_statement">{

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

  public renderReport(question: Question<"select_a_statement">, submission: SASSubmission) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return "Your answer for this question was blank.";
    }
    
    let score = this.grade(question, submission);
    return assertFalse();
    // return `
    // <table class="examma-ray-sas-diff table table-sm">
    //   <tr><th>Rubric</th><th>Your Code</th><th>Solution</th></tr>
    //   ${this.rubric.map((rubricItem, i) => {
    //     let included = rubricItem.required.concat(rubricItem.prohibited).filter(line => submission.indexOf(line) !== -1);
    //     let missing = rubricItem.required.filter(line => submission.indexOf(line) === -1);
    //     let extra = rubricItem.prohibited.filter(line => submission.indexOf(line) !== -1);
    //     let riScore = gradeSASRubricItem(rubricItem, submission);

    //     // let details: string;
    //     // if (missing.length === 0 && extra.length === 0) {
    //     //   details = `Your code contains the correct conceptual components for this task, including these lines:<ul>${rubricItem.required.map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
    //     // }
    //     // else if (missing.length > 0) {
    //       //   details = `Your code is missing these lines (or they are misplaced):<ul>${missing.map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
    //       // }
    //       // else {
    //         //   details = `Your code contains these incorrect lines (or they are misplaced):<ul>${extra.map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
    //         //   details += `<br />The correct solution needed this line:<ul>${rubricItem.required.map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
    //         // }
            
    //     // if (missing.length === 0 && extra.length === 0) {
    //     // details = `Your code contains these lines:<ul>${rubricItem.required.concat(rubricItem.prohibited).filter(line => submission.indexOf(line) !== -1).map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;
    //     // details += `<br />The solution should contain these lines (and these lines only):<ul>${rubricItem.required.map(line => `<li><code>${question.data.lines[line].text}</code></li>`).join("")}</ul>`;

    //     let elem_id = `question-${question.id}-item-${i}`;

    //     return `
    //     <tr>
    //       <td class="examma-ray-sas-rubric-item">
    //         <div id="${elem_id}" class="card rubric-item-card">
    //           <div class="card-header">
    //             <a class="nav-link" data-toggle="collapse" data-target="#${elem_id}-details" role="button" aria-expanded="false" aria-controls="${elem_id}-details">${renderScoreBadge(riScore, rubricItem.points)} ${mk2html(rubricItem.title)}</a>
    //           </div>
    //           <div class="collapse" id="${elem_id}-details">
    //             <div class="card-body">
    //               ${mk2html(rubricItem.description)}
    //             </div>
    //           </div>
    //         </div>
    //       </td>
    //       <td>${included.length === 0 ? `<pre style="font-style: italic">${rubricItem.required.length === 0 ? CHECK_ICON : RED_X_ICON} (no selection)</pre>` : (included.map(line => `<pre>${rubricItem.required.indexOf(line) !== -1 ? CHECK_ICON : RED_X_ICON} <code>${hljs.highlight(question.codeLanguage, question.response.lines[line].text.replace(/^\n+|\n+$/g, "")).value}</code></pre>`).join('<br style="font-size: 0.3rem"/>'))}</td>
    //       <td>${rubricItem.required.map(line => `<pre><code>${hljs.highlight(question.codeLanguage, question.response.lines[line].text.replace(/^\n+|\n+$/g, "")).value}</code></pre>`).join('<br style="font-size: 0.3rem"/>')}</td>
    //     </tr>`
    //   }).join("")}
    // </table>`;
  }

  public renderStats() {
    return "Stats are not implemented for this question/grader type yet.";
  }

  public renderOverview() {
    return "Overview is not implemented for this question/grader type yet.";
  }
}


type FITBRegexRubricItem = {
  blankIndex: number,
  points: number,
  title: string,
  description: string,
  solution: string,
  patterns: {
    pattern: RegExp | readonly string[],
    points: number,
    explanation: string
  }[];
};

function identifyCodeWords(blanks: string[]) {
  let result = new Set<string>();
  blanks.forEach(code => code.split(/[^a-zA-Z0-9_]/).forEach(w => result.add(w)));
  return result;
}

function replaceWordInSubmission(submission: string[], word: string, replacement: string) {
  return submission.map(blankStr => blankStr.replace(word, replacement));
}

export class FITBRegexGrader implements Grader<"fitb">{

  public readonly questionType = "fitb";
  private solutionWords: ReadonlySet<string>;
  private minRubricItemPoints: number;

  public constructor(
    public readonly rubric: readonly FITBRegexRubricItem[]
  ) {

    this.solutionWords = identifyCodeWords(rubric.map(ri => ri.solution));
    this.minRubricItemPoints = min(this.rubric.map(ri => ri.points));
  }

  public grade(question: Question<"fitb">, orig_submission: FITBSubmission) {
    if (orig_submission === BLANK_SUBMISSION || orig_submission.length === 0) {
      return 0;
    }
    let submission = orig_submission.slice();

    assert(submission.length === this.rubric.length, `Error: Mismatched number of answers in FITB grader submission vs. rubric for ${question.id}`.red);

    let score = this.grade_helper(submission);

    let submissionWords = identifyCodeWords(submission);
    submissionWords.forEach(subWord => this.solutionWords.forEach(solWord => {
      let newScore = this.grade_helper(replaceWordInSubmission(submission, subWord, solWord));
      if (newScore > score + this.minRubricItemPoints) {
        console.log(`HEYYYYY, might be double jeopardy here. ${question.id} Replace ${subWord} with ${solWord}! ${score} --> ${newScore}`);
      }
    }));

    return score;
  }

  private grade_helper(submission: string[]) {
    return this.rubric.reduce((prev, rubricItem, i) => {
      assert(rubricItem.blankIndex === i+1, "Mismatched blank index on FITB rubric.");
      
      let riMatch = FITBRubricItemMatch(rubricItem, submission[i]);

      return prev + (riMatch?.points ?? 0);
    }, 0);
  }

  public renderReport(question: Question<"fitb">, submission: FITBSubmission) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return "Your answer for this question was blank.";
    }

    let overallScore = this.grade(question, submission);
    let scores = this.rubric.map((rubricItem, i) => {
      let riMatch = FITBRubricItemMatch(rubricItem, submission[i])
      return riMatch?.points ?? 0;
    });
    
    let content = question.response.content;
    
    let studentFilled = createFilledFITB(content, submission.map(s => s));//, content, scores);
    let solutionFilled = createFilledFITB(content, this.rubric.map(ri => ri.solution));//, content, undefined);

    let rubricItemsHtml = `<table style="position: sticky; top: 0;">${this.rubric.map((rubricItem, i) => {
        
      let riMatch = FITBRubricItemMatch(rubricItem, submission[i]);
      let riScore = riMatch?.points ?? 0;

      let explanation: string = riMatch?.explanation ?? "Your response for this blank was incomplete or incorrect.";

      let elem_id = `question-${question.id}-item-${i}`;

      return `
        <tr><td><div id="${elem_id}" class="card rubric-item-card">
          <div class="card-header">
            <a class="nav-link" style="font-weight: 500;" data-toggle="collapse" data-target="#${elem_id}-details" role="button" aria-expanded="false" aria-controls="${elem_id}-details">${renderScoreBadge(riScore, rubricItem.points)} Blank ${i+1}<br />${rubricItem.title}</a>
          </div>
          <div class="collapse" id="${elem_id}-details">
            <div class="card-body">
              ${mk2html(rubricItem.description)}
              <p>Your response for this blank was: <code style="border: solid 1px #333; padding: 0.2em; white-space: pre;">${encode(submission[i])}</code></p>
              ${mk2html(explanation)}
            </div>
          </div>
        </div></td></tr>`;
    }).join("")}</table>`;

    return `
    <table class="table table-sm examma-ray-fitb-diff">
      <tr><th>Rubric</th><th>Your Code</th><th>Sample Solution</th></tr>
      <tr>
        <td>${rubricItemsHtml}</td>
        <td><pre><code>${studentFilled}</code></pre></td>
        <td><pre><code>${solutionFilled}</code></pre></td>
      </tr>
    </table>`;
  }

  public renderStats(question: Question<"fitb">, submissions: readonly FITBSubmission[]) {
    let gradedBlankSubmissions = this.getGradedBlanksSubmissions(submissions);

    let solutionFilled = createFilledFITB(question.response.content, this.rubric.map(ri => ri.solution));


    return `<table class="table" style="border-collapse: separate; border-spacing: 0;">
      <tr>
        <th style="position: sticky; left: 0; top: 0; z-index: 11; background-color: white; border-bottom: 1px solid #dee2e6; border-top: 1px solid #dee2e6; border-right: 1px solid #dee2e6;">Sample Solution</th>
        ${this.rubric.map(ri => `<th style="position: sticky; top: 0; z-index: 10; background: white; z-index: 10; border-bottom: 1px solid #dee2e6; border-top: 1px solid #dee2e6;">Blank ${ri.blankIndex} <button class="examma-ray-blank-saver btn btn-primary" data-blank-num="${ri.blankIndex-1}">Copy</button></th>`).join("")}
      </tr>
      <tr>
      <td style="position: sticky; left: 0; background-color: white; border-top: none; border-right: 1px solid #dee2e6;">
        <div style="position: sticky; top: 65px; white-space: pre; font-size: 0.8rem; max-height: 90vh; overflow: auto;">${solutionFilled}</div>
      </td>
        ${gradedBlankSubmissions.map((blankSubs, i) => 
          `<td style="vertical-align: top; border-top: none;">
            ${blankSubs.map(s => `<div style="white-space: pre"><input type="checkbox" data-blank-num="${i}" data-blank-submission="${encode(s.sub)}"> ${renderScoreBadge(s.points, this.rubric[i].points)} ${renderNumBadge(s.num)} "<code style="white-space: pre">${s.sub}</code>"</li>`).join("")}
          </td>`
        ).join("")}
      </tr>

    </table>`;
  }

  private getGradedBlanksSubmissions(submissions: readonly FITBSubmission[]) {
    let blankSubmissions = this.rubric.map(ri => <string[]>[]);
    submissions.forEach(sub => {
      if (sub === BLANK_SUBMISSION || sub.length === 0 || sub.length !== this.rubric.length) {
        return;
      }

      sub.forEach((s, i) => blankSubmissions[i].push(s));
    });

    // keep only unique answers for each
    let uniqueSubmissions = blankSubmissions.map(bs => [...new Set(bs)]);

    // grade them and add number of times used
    let gradedBlankSubmissions = uniqueSubmissions.map(
      (bs, blankIndex) => bs.map(
        b => ({
          points: FITBRubricItemMatch(this.rubric[blankIndex], b)?.points ?? 0,
          sub: b,
          num: blankSubmissions[blankIndex].reduce((prev, s) => prev + (s === b ? 1 : 0), 0)
        })
      )
    );

    // sort by points earned
    gradedBlankSubmissions = gradedBlankSubmissions.map(bs => bs.sort((a, b) => b.points - a.points));
    return gradedBlankSubmissions;
  }

  public renderOverview(question: Question<"fitb">, submissions: readonly FITBSubmission[]) {
    return assertFalse();
    // let gradedBlankSubmissions = this.getGradedBlanksSubmissions(submissions);

    // let blankAverages = gradedBlankSubmissions.map(
    //   gradedSubmissions => sum(gradedSubmissions.map(s => s.points * s.num)) / sum(gradedSubmissions.map(s => s.num)));
    // let blankPoints = this.rubric.map(ri => ri.points);
    // let blankSolutions = this.rubric.map(ri => encode(ri.solution));
    // let percents = blankAverages.map((avg, i) => Math.floor(100 * (avg/blankPoints[i])));

    // let blankBars = blankAverages.map((avg, i) => renderPointsProgressBar(avg, blankPoints[i], `${percents[i]}% ${blankSolutions[i]}`));

    // let solutionFilled = this.createFilledFITB(blankBars, question.response.text, undefined);
    // return `<pre><code class="language-${question.response.code_language}">${solutionFilled}</code></pre>`;
  }

//   private createFilledFITB(submission: string[], data: string, scores: number[] | undefined) {
//     let ids = submission.map(response => "aslkjfalskdfjhahflkdsj");
//     ids.forEach(id => data = data.replace(/\< *blank.*?\>.*?\< *\/blank *\>/, id));

//     // lollllll
//     let indentSpaces = "";
//     data = data.replace(/\<tab +lvl *= *1 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
//     data = data.replace(/\<tab +lvl *= *2 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
//     data = data.replace(/\<tab +lvl *= *3 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
//     data = data.replace(/\<tab +lvl *= *4 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
//     data = data.replace(/\<tab +lvl *= *5 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
//     data = data.replace(/\<tab +lvl *= *6 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
//     data = data.replace(/\<tab +lvl *= *7 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
//     data = data.replace(/\<tab +lvl *= *8 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
//     data = data.replace(/\<tab +lvl *= *9 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
//     data = data.replace(/\<tab +lvl *= *10 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");

//     // Remove < and > that have been escaped
//     data = data.replace(/\\</g, "<");
//     data = data.replace(/\\>/g, ">");

//     // decode html entities like &nbsp; &lt; &gt; etc.
//     data = decode(data);

//     // Trime whitespace that might otherwise mess up spacing around the rendered rubric
//     data = data.trim();

//     let formattedData = data;//hljs.highlight(codeLanguage, data).value;
//     ids.forEach((id, i) => {
//       let icon = scores ? (scores[i] === this.rubric[i].points ? CHECK_ICON : scores[i] === 0 ? RED_X_ICON : YELLOW_X_ICON) + " " : "";
//       formattedData = formattedData.replace(id, `<span class="examma-ray-fitb-blank">${icon}${submission[i]}</span>`)
//     });
//     formattedData = formattedData.replace(/\n\n/g, '\n<div class="examma-ray-fitb-spacer"></div>');
//     return formattedData;
//   }


}

function FITBRubricItemMatch(rubricItem: FITBRegexRubricItem, submission: string) {
  return rubricItem.patterns.find(p => {
    if (p.pattern instanceof RegExp) {
      return p.pattern.test(submission);
    }
    else {
      return p.pattern.indexOf(submission) !== -1;
    }
    
  });
}



