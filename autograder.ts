
import csv from 'csv-parser';
import stringify from 'csv-stringify';
import { createReadStream, writeFileSync, readFileSync, mkdir, mkdirSync, writeFile } from 'fs';
import showdown from 'showdown';
import { encode, decode } from "he";
import hljs from 'highlight.js';
import showdownHighlight from 'showdown-highlight'
import $ from 'jquery';
import 'colors';
import chroma from 'chroma-js'
import {average, max, mean, min, standardDeviation, sum} from 'simple-statistics'
import minimist from 'minimist';
import { exception } from 'console';
import { RandomSeed, create as createRNG } from 'random-seed';

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

function assert(condition: any, message: string = "") : asserts condition {
  if (!condition) {
    throw new Error(message);
  }
};

export function asMutable<T>(obj: T) : Mutable<T> {
    return <Mutable<T>>obj;
}

export type QuestionKind =
 "multiple_choice" |
 "code_fitb" |
 "select_a_statement";

// type Response =
//   MCResponse |
//   FITBResponse |
//   SASResponse;

type MCResponse = {
  kind: "multiple_choice",
  radio: boolean,
  selections: string[],
  maxSelections: number
};

type FITBResponse = {
  kind: "code_fitb",
  text: string
};

type SASResponse = {
  kind: "select_a_statement",
  language: string,
  lines: {
    required: boolean,
    text: string
  }[]
};

type QuestionResponse<QT extends QuestionKind> =
  QT extends "multiple_choice" ? MCResponse :
  QT extends "code_fitb" ? FITBResponse :
  QT extends "select_a_statement" ? SASResponse :
  never;

type MCSubmission = readonly number[] | typeof BLANK_SUBMISSION;
type FITBSubmission = readonly string[] | typeof BLANK_SUBMISSION;
type SASSubmission = readonly number[] | typeof BLANK_SUBMISSION;

type SubmissionType<QT extends QuestionKind> =
  QT extends "multiple_choice" ? MCSubmission :
  QT extends "code_fitb" ? FITBSubmission :
  QT extends "select_a_statement" ? SASSubmission :
  never;

export const MALFORMED_SUBMISSION = Symbol("malformed_submission");
export const BLANK_SUBMISSION = Symbol("blank_submission");

function isNumericArray(x: any) : x is readonly number[] {
  return Array.isArray(x) && x.every(elem => typeof elem === "number");
}

function isStringArray(x: any) : x is readonly string[] {
  return Array.isArray(x) && x.every(elem => typeof elem === "string");
}

function DEFAULT_MC_PARSER(rawSubmission: string | null | undefined) : MCSubmission | typeof MALFORMED_SUBMISSION {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  let parsed = JSON.parse(rawSubmission);
  if (isNumericArray(parsed)) {
    return parsed.length > 0 ? parsed : BLANK_SUBMISSION;
  }
  else {
    return MALFORMED_SUBMISSION;
  }
}

function DEFAULT_CODE_FITB_PARSER(rawSubmission: string | null | undefined) : FITBSubmission | typeof MALFORMED_SUBMISSION {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  let parsed = JSON.parse(rawSubmission);
  if (isStringArray(parsed)) {
    return parsed.length > 0 ? parsed : BLANK_SUBMISSION;
  }
  else {
    return MALFORMED_SUBMISSION;
  }
}

function DEFAULT_SAS_PARSER(rawSubmission: string | null | undefined) : SASSubmission | typeof MALFORMED_SUBMISSION {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  let parsed = JSON.parse(rawSubmission);
  if (isNumericArray(parsed)) {
    return parsed.length > 0 ? parsed : BLANK_SUBMISSION;
  }
  else {
    return MALFORMED_SUBMISSION;
  }
}

export const SUBMISSION_PARSERS : {
  [QT in QuestionKind]: (rawSubmission: string | null | undefined) => SubmissionType<QT> | typeof MALFORMED_SUBMISSION
} = {
  "multiple_choice": DEFAULT_MC_PARSER,
  "code_fitb": DEFAULT_CODE_FITB_PARSER,
  "select_a_statement": DEFAULT_SAS_PARSER,
}

function parse_submission<QT extends QuestionKind>(questionKind: QT, rawSubmission: string | null | undefined) : SubmissionType<QT> {
  return <SubmissionType<QT>>SUBMISSION_PARSERS[questionKind](rawSubmission);
}


export type QuestionSpecification<QT extends QuestionKind = QuestionKind> = {
  id: string,
  points: number,
  mk_description: string,
  kind: QT,
  response: QuestionResponse<QT>,
  codeLanguage: string,
  tags?: readonly string[]
};

export class Question<QT extends QuestionKind = QuestionKind> {

  // public readonly raw_description: string;
  // public readonly description: string;
  // public readonly section: Section;
  public readonly id: string;
  public readonly tags: readonly string[];
  public readonly pointsPossible : number;
  public readonly html_description: string;
  public readonly kind: QT;
  public readonly response : QuestionResponse<QT>;
  public readonly codeLanguage: string;

  public constructor (spec: QuestionSpecification<QT>) {
    this.id = spec.id;
    this.tags = spec.tags ?? [];
    this.pointsPossible = spec.points;
    this.codeLanguage = spec.codeLanguage;
    this.kind = spec.kind;
    this.response = spec.response;
    this.html_description = mk2html(spec.mk_description);
  }

};

export interface Student {
  readonly uniqname: string;
  readonly name: string;
}

export class AssignedQuestion<QT extends QuestionKind = QuestionKind> {

  public readonly pointsEarned?: number;
  public readonly nonExceptionPoints?: number;
  public readonly gradedBy?: Grader<QT>
  public readonly exception?: Exception;

  public readonly submission: SubmissionType<QT>;

  public readonly unifiedIndex;

  public constructor(
    public readonly exam: Exam,
    public readonly question: Question<QT>,
    public readonly sectionIndex : number,
    public readonly partIndex : number,
    public readonly rawSubmission: string,
  ) {
    this.unifiedIndex = sectionIndex + "." + partIndex;
    this.submission = parse_submission(question.kind, rawSubmission);
  }

  public grade(student: AssignedExam, grader: Grader<QT>) {
    this.setPointsEarned(grader.grade(
      this.question,
      this.submission
    ));
    (<Mutable<this>>this).gradedBy = grader;

    this.checkForException(student);
  }

  private setPointsEarned(points: number) {
    (<Mutable<this>>this).pointsEarned = Math.min(this.question.pointsPossible, Math.max(points, 0));
  }

  private checkForException(ex: AssignedExam) {
    let studentExMap = this.exam.exceptionMap[ex.student.uniqname];
    let questionEx = studentExMap && studentExMap[this.unifiedIndex];
    if (questionEx) {
      this.addException(questionEx);
    }
  }

  private addException(exception: Exception) {
    (<Mutable<this>>this).exception = exception;
    (<Mutable<this>>this).nonExceptionPoints = this.pointsEarned;
    this.setPointsEarned(exception.adjustedScore);
  }

  public renderQuestion() {

    let header_html = `<b>${this.unifiedIndex}</b>${renderPointsWorthBadge(this.question.pointsPossible)}`
    
    return `
    <div class="card-group">
      <div class="card examma-ray-question">
        <div class="card-header">
          ${header_html}
        </div>
        <div class="card-body">
          <div class="examma-ray-question-description">
            ${this.question.html_description}
          </div>
        </div>
      </div>
    </div>`
  }

  public renderReport() {

    let question_header_html = `<b>${this.unifiedIndex}</b>
      ${this.isGraded() ? renderScoreBadge(this.pointsEarned, this.question.pointsPossible): renderUngradedBadge(this.question.pointsPossible)}`

    let graded_html: string;
    let exception_html = "";
    
    if (this.isGraded()) {
      graded_html = this.gradedBy.renderReport(this.question, this.submission);
      exception_html = this.renderExceptionIfPresent();
    }
    else {
      graded_html = `
      <div class="alert alert-danger" role="alert">
        NOT GRADED
      </div>`; 
    }

    return renderQuestion(this.question, question_header_html, exception_html, graded_html);
  }

  private renderExceptionIfPresent() {
    if (!this.exception) {
      return "";
    }

    return `<div class="alert alert-warning">
      <p><strong>An exception was applied when grading this question.</strong></p>
      <p>Your score on this question was adjusted from <strong>${this.nonExceptionPoints}</strong> to <strong>${this.pointsEarned}</strong>.</p>
      ${mk2html(this.exception.explanation)}
    </div>`;
  }

  public isGraded() : this is GradedQuestion<QT> {
    return !!this.gradedBy;
  }

  // public toString() {
  //   return `${this.unifiedIndex} (${this.pointsEarned ?? "?"}/${this.question.points} pts): ${this.question.questionType}`;
  // }
}

interface GradedQuestion<QT extends QuestionKind> extends AssignedQuestion<QT> {
  readonly pointsEarned: number;
  readonly gradedBy: Grader<QT>
}

interface Grader<QT extends QuestionKind = QuestionKind> {
  readonly questionType: QT;
  grade(question: Question<QT>, submission: SubmissionType<QT>): number;
  renderReport(question: Question<QT>, submission: SubmissionType<QT>): string;
  renderStats(question: Question<QT>, submissions: readonly SubmissionType<QT>[]): string;
  renderOverview(question: Question<QT>, submissions: readonly SubmissionType<QT>[]): string;

};

function isGrader<QT extends QuestionKind>(grader: Grader, questionType: QT) : grader is Grader<QT> {
  return grader.questionType === questionType;
}


const converter = new showdown.Converter({extensions: [showdownHighlight]});
function mk2html(mk: string) {
  // if (mk.startsWith("`")) {
    return converter.makeHtml(mk);
  // }
  // else {
  //   return mk;
  // }
}

export function renderQuestion(question: Question, header: string, exception: string, gradingReport: string) {
  return `
  <div class="card-group">
    <div class="card">
      <div class="card-header">
        ${header}
      </div>
      <div class="card-body">
        <div class="examma-ray-question-description">
          ${question.html_description}
        </div>
        <div class="examma-ray-question-exception">
          ${exception}
        </div>
        <div class="examma-ray-grading-report">
          ${gradingReport}
        </div>
      </div>
    </div>
  </div>`;
}

export class FreebieGrader<QT extends QuestionKind> implements Grader<QT>{

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
      ${question.response.selections.map((item,i) => `
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
      ${hist.map((count, i) => `<div class="examma-ray-mc-option">${renderNumBadge(count)} ${i === this.correctIndex ? CHECK_ICON : RED_X_ICON} ${mk2html(question.response.selections[i])}</div>`).join("")}
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
      ${question.response.selections.map((item,i) => {
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

        let elem_id = `question-${question.id}-item-${i}`;

        return `
        <tr>
          <td class="examma-ray-sas-rubric-item">
            <div id="${elem_id}" class="card rubric-item-card">
              <div class="card-header">
                <a class="nav-link" data-toggle="collapse" data-target="#${elem_id}-details" role="button" aria-expanded="false" aria-controls="${elem_id}-details">${renderScoreBadge(riScore, rubricItem.points)} ${mk2html(rubricItem.title)}</a>
              </div>
              <div class="collapse" id="${elem_id}-details">
                <div class="card-body">
                  ${mk2html(rubricItem.description)}
                </div>
              </div>
            </div>
          </td>
          <td>${included.length === 0 ? `<pre style="font-style: italic">${rubricItem.required.length === 0 ? CHECK_ICON : RED_X_ICON} (no selection)</pre>` : (included.map(line => `<pre>${rubricItem.required.indexOf(line) !== -1 ? CHECK_ICON : RED_X_ICON} <code>${hljs.highlight(question.codeLanguage, question.response.lines[line].text.replace(/^\n+|\n+$/g, "")).value}</code></pre>`).join('<br style="font-size: 0.3rem"/>'))}</td>
          <td>${rubricItem.required.map(line => `<pre><code>${hljs.highlight(question.codeLanguage, question.response.lines[line].text.replace(/^\n+|\n+$/g, "")).value}</code></pre>`).join('<br style="font-size: 0.3rem"/>')}</td>
        </tr>`
      }).join("")}
    </table>`;
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

export class FITBRegexGrader implements Grader<"code_fitb">{

  public readonly questionType = "code_fitb";
  private solutionWords: ReadonlySet<string>;
  private minRubricItemPoints: number;

  public constructor(
    public readonly rubric: readonly FITBRegexRubricItem[]
  ) {

    this.solutionWords = identifyCodeWords(rubric.map(ri => ri.solution));
    this.minRubricItemPoints = min(this.rubric.map(ri => ri.points));
  }

  public grade(question: Question<"code_fitb">, orig_submission: FITBSubmission) {
    if (orig_submission === BLANK_SUBMISSION || orig_submission.length === 0) {
      return 0;
    }
    let submission = orig_submission.slice();

    if (submission.length !== this.rubric.length) {
      console.log(`WARNING: Mismatched number of answers in FITB grader submission vs. rubric for ${question.id}`.yellow);
    }
    while (submission.length < this.rubric.length) {
      submission.push("");
    }
    assert(submission.length === this.rubric.length);

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

  public renderReport(question: Question<"code_fitb">, submission: FITBSubmission) {
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return "Your answer for this question was blank.";
    }

    let overallScore = this.grade(question, submission);
    let scores = this.rubric.map((rubricItem, i) => {
      let riMatch = FITBRubricItemMatch(rubricItem, submission[i])
      return riMatch?.points ?? 0;
    });
    
    let data = question.response.text;
    
    let studentFilled = this.createFilledFITB(question.codeLanguage, submission.map(s => encode(s)), data, scores);
    let solutionFilled = this.createFilledFITB(question.codeLanguage, this.rubric.map(ri => encode(ri.solution)), data, undefined);

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

  public renderStats(question: Question<"code_fitb">, submissions: readonly FITBSubmission[]) {
    let gradedBlankSubmissions = this.getGradedBlanksSubmissions(submissions);

    let solutionFilled = this.createFilledFITB(question.codeLanguage, this.rubric.map(ri => encode(ri.solution)), question.response.text, undefined);


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
            ${blankSubs.map(s => `<div style="white-space: pre"><input type="checkbox" data-blank-num="${i}" data-blank-submission="${encode(s.sub)}"> ${renderScoreBadge(s.points, this.rubric[i].points)} ${renderNumBadge(s.num)} "<code style="white-space: pre">${hljs.highlight(question.codeLanguage, s.sub).value}</code>"</li>`).join("")}
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

  public renderOverview(question: Question<"code_fitb">, submissions: readonly FITBSubmission[]) {
    let gradedBlankSubmissions = this.getGradedBlanksSubmissions(submissions);

    let blankAverages = gradedBlankSubmissions.map(
      gradedSubmissions => sum(gradedSubmissions.map(s => s.points * s.num)) / sum(gradedSubmissions.map(s => s.num)));
    let blankPoints = this.rubric.map(ri => ri.points);
    let blankSolutions = this.rubric.map(ri => encode(ri.solution));
    let percents = blankAverages.map((avg, i) => Math.floor(100 * (avg/blankPoints[i])));

    let blankBars = blankAverages.map((avg, i) => renderPointsProgressBar(avg, blankPoints[i], `${percents[i]}% ${blankSolutions[i]}`));

    let solutionFilled = this.createFilledFITB(question.codeLanguage, blankBars, question.response.text, undefined);
    return `<pre><code>${solutionFilled}</code></pre>`;
  }

  private createFilledFITB(codeLanguage: string, submission: string[], data: string, scores: number[] | undefined) {
    let ids = submission.map(response => "aslkjfalskdfjhahflkdsj");
    ids.forEach(id => data = data.replace(/\< *blank.*?\>.*?\< *\/blank *\>/, id));

    // lollllll
    let indentSpaces = "";
    data = data.replace(/\<tab +lvl *= *1 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
    data = data.replace(/\<tab +lvl *= *2 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
    data = data.replace(/\<tab +lvl *= *3 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
    data = data.replace(/\<tab +lvl *= *4 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
    data = data.replace(/\<tab +lvl *= *5 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
    data = data.replace(/\<tab +lvl *= *6 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
    data = data.replace(/\<tab +lvl *= *7 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
    data = data.replace(/\<tab +lvl *= *8 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
    data = data.replace(/\<tab +lvl *= *9 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");
    data = data.replace(/\<tab +lvl *= *10 *\>.*?\< *\/tab *\>/g, indentSpaces += "  ");

    // Remove < and > that have been escaped
    data = data.replace(/\\</g, "<");
    data = data.replace(/\\>/g, ">");

    // decode html entities like &nbsp; &lt; &gt; etc.
    data = decode(data);

    // Trime whitespace that might otherwise mess up spacing around the rendered rubric
    data = data.trim();

    let formattedData = hljs.highlight(codeLanguage, data).value;
    ids.forEach((id, i) => {
      let icon = scores ? (scores[i] === this.rubric[i].points ? CHECK_ICON : scores[i] === 0 ? RED_X_ICON : YELLOW_X_ICON) + " " : "";
      formattedData = formattedData.replace(id, `<span class="examma-ray-fitb-blank">${icon}${submission[i]}</span>`)
    });
    formattedData = formattedData.replace(/\n\n/g, '\n<div class="examma-ray-fitb-spacer"></div>');
    return formattedData;
  }
}

export interface GraderMap {
  [index: string]: Grader | undefined;
}

export interface Exception {
  adjustedScore: number,
  explanation: string
}

export interface ExceptionMap {
  [index: string]: { // uniqname
    [index: string]: // question id
      Exception
  };
}



export class Section {

  // public readonly raw_description: string;
  // public readonly description: string;
  // public readonly section: Section;
  public readonly id: string;
  public readonly title: string;
  public readonly html_description: string;
  public readonly html_reference?: string;
  public readonly builder: SectionBuilder;

  public constructor (spec: SectionSpecification) {

    this.id = spec.id;
    this.title = spec.title;
    this.html_description = mk2html(spec.mk_description);
    this.html_reference = spec.mk_reference && mk2html(spec.mk_reference);
    this.builder = spec.builder;

    // let json = JSON.parse(readFileSync(`sections/${sectionIndex}.json`, 'utf8'));
    // let question = (<any[]>json["questions"]).find(q => parseInt(q.index) === partIndex) ?? json["questions"][partIndex-1];
    // assert(question, `Missing question ${partIndex} in section ${sectionIndex}.json`);
    // this.data = question["data"];
    // // this.raw_description = question["questionDescription"] ?? "";


    // this.section = {
    //   index: this.sectionIndex,
    //   title: <string>json["title"],
    //   raw_description: <string>json["sectionDescription"],
    //   description: mk2html(<string>json["sectionDescription"]),
    //   raw_referenceMaterial: <string>json["referenceMaterial"],
    //   referenceMaterial: mk2html(<string>json["referenceMaterial"]),
    // }
  }

}


export class AssignedSection {

  public readonly pointsPossible: number;
  public readonly pointsEarned?: number;
  public readonly isFullyGraded: boolean = false;

  public constructor(
    public readonly section: Section, 
    public readonly sectionIndex : number,
    public readonly assignedQuestions: readonly AssignedQuestion[]) {
    this.pointsPossible = assignedQuestions.reduce((p, q) => p + q.question.pointsPossible, 0);
  }

  public gradeAllQuestions(ex: AssignedExam, graders: GraderMap) {
    this.assignedQuestions.forEach(aq => {
      let grader = graders[aq.unifiedIndex];
      if (grader) {
        assert(isGrader(grader, aq.question.kind), `Grader for type "${grader.questionType}" cannot be used for question ${aq.unifiedIndex}, which has type "${aq.question.kind}".`);
        aq.grade(ex, grader);
      }
    });
    asMutable(this).pointsEarned = <number>this.assignedQuestions.reduce((prev, aq) => prev + aq.pointsEarned!, 0);
    asMutable(this).isFullyGraded =this.assignedQuestions.every(aq => aq.isGraded());
  }

  public renderReport() {
    let scoreBadge = this.assignedQuestions.every(aq => aq.isGraded()) ?
      renderScoreBadge(this.assignedQuestions.reduce((prev, aq) => prev + aq.pointsEarned!, 0), this.pointsPossible) :
      renderUngradedBadge(this.pointsPossible);
    return `
      <div id="section${this.sectionIndex}" class="badge badge-primary examma-ray-section-heading">${scoreBadge} ${this.sectionIndex}: ${this.section.title}</div>
      <div class="examma-ray-section-container">
        <div class="examma-ray-section-description">${this.section.html_description}</div>
        <h6>Reference Material</h6>
        <div class="examma-ray-section-reference">${this.section.html_reference}</div>
        ${this.assignedQuestions.map(aq => aq.renderReport()).join("<br />")}
      </div>
    `;
  }
}

export class AssignedExam {

  public readonly pointsPossible: number;
  public readonly pointsEarned?: number;
  public readonly isFullyGraded: boolean = false;

  public constructor(
    public readonly exam: Exam,
    public readonly student: Student,
    public readonly assignedSections: readonly AssignedSection[]
  ) {
    this.pointsPossible = assignedSections.reduce((p, s) => p + s.pointsPossible, 0);
  }

  public gradeAll(graders: GraderMap) {
    console.log(`Grading exam for: ${this.student.uniqname}...`);
    this.assignedSections.forEach(s => s.gradeAllQuestions(this, graders));
    asMutable(this).pointsEarned = <number>this.assignedSections.reduce((prev, s) => prev + s.pointsEarned!, 0);
    asMutable(this).isFullyGraded =this.assignedSections.every(s => s.isFullyGraded);
  }

  public renderGrade() {
    return this.isFullyGraded ?
      +(this.pointsEarned!.toFixed(2)) + "/" + this.pointsPossible :
      "?/" + this.pointsPossible;
  }

  public renderNav() {
    return `
      <ul class = "nav" style="display: unset; font-weight: 500">
        ${this.assignedSections.map(s => {
          let sectionAssignedQuestions = s.assignedQuestions;
          let scoreBadge = sectionAssignedQuestions.every(aq => aq.isGraded()) ?
            renderScoreBadge(sectionAssignedQuestions.reduce((prev, aq) => prev + aq.pointsEarned!, 0), s.pointsPossible) :
            renderUngradedBadge(s.pointsPossible);
          return `<li class = "nav-item"><a class="nav-link text-truncate" style="padding: 0.1rem" href="#section${s.sectionIndex}">${scoreBadge} ${s.sectionIndex + ": " + s.section.title}</a></li>`
        }).join("")}
      </ul>`
  }

  public renderReport() {
    return `<div class="container-fluid">
      <div class="row">
        <div class="bg-light" style="position: fixed; width: 200px; top: 0; left: 0; bottom: 0; padding-left: 5px; z-index: 10; overflow-y: auto; border-right: solid 1px #dedede; font-size: 85%">
          <h3 class="text-center pb-1 border-bottom">
            ${this.renderGrade()}
          </h3>
          ${this.renderNav()}
        </div>
        <div style="margin-left: 210px; width: calc(100% - 220px);">
          <div class="text-center mb-3 border-bottom">
            <h2>${this.exam.title}</h2>
            <h6>${this.student.name} (${this.student.uniqname})</h6>
            <div class="alert alert-warning alert-dismissible fade show" style="display: inline-block; max-width: 40rem;" role="alert">
              <strong>Important!</strong> The section/question indices you see here will not be consecutive. 
              They reflect the randomized questions you received when you took the exam, which were drawn from
              a much larger question bank.
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
          ${this.renderAllSectionReports()}
        </div>
      </div>
    </div>`;
  }

  public renderAllSectionReports() {
    return this.assignedSections.map(section => section.renderReport()).join("<br />");
  }

}

export class Randomizer {

  private rng: RandomSeed;

  public constructor(seed: string) {
    this.rng = createRNG(seed);
  }

  public float() {
    return this.rng.random;
  }

  public range(n: number) {
    return this.rng.range(n);
  };

  public choose<T>(choices: readonly T[]) {
    assert(choices.length > 0);
    return choices[this.rng.range(choices.length)];
  };
  
  public chooseN<T>(choices: readonly T[], n: number) {
    assert(choices.length >= n);
    return choices
      .slice()
      .map(c => ({i: this.rng.random(), c: c}))
      .sort((a, b) => a.i - b.i)
      .map(x => x.c)
      .slice(0,n);
  }

}

export type SectionBuilder = (exam: Exam, student: Student, rand: Randomizer) => readonly Question[];

export type SectionSpecification = {
  readonly id: string;
  readonly title: string;
  readonly mk_description: string;
  readonly mk_reference?: string;
  readonly builder: SectionBuilder;
}

export function RANDOM_BY_TAG(tag: string, n: number) {
  return (exam: Exam, student: Student, rand: Randomizer) => {
    return rand.chooseN(exam.getQuestionsByTag(tag), n);
  }
}

const NUM_META_ROWS = 6;

export class Exam {

  public readonly title: string;
  public readonly graderMap: GraderMap;
  public readonly exceptionMap: ExceptionMap;

  private readonly questionBank: Question[] = [];
  private readonly questionsById: {[index: string] : Question | undefined } = {};
  private readonly questionsByTag: {[index: string] : Question[] | undefined } = {};

  public readonly sections: Section[] = [];

  public readonly pointsPossible: number;
  public readonly submissions: AssignedExam[] = [];
  public readonly submissionsByUniqname: {[index:string]: AssignedExam | undefined} = {};

  public constructor(title: string, pointsPossible: number, graderMap: GraderMap = {}, exceptionMap: ExceptionMap = {}) {
    this.title = title;
    this.pointsPossible = pointsPossible;
    this.graderMap = graderMap;
    this.exceptionMap = exceptionMap;
  }

  public addGraders(graderMap: GraderMap) {
    Object.assign(this.graderMap, graderMap);
  }

  public registerQuestion(q: Question<QuestionKind>) {
    this.questionBank.push(q);
    this.questionsById[q.id] = q;
    q.tags.forEach(tag => 
      (this.questionsByTag[tag] ??= []).push(q)
    );
  }

  public getQuestionById(id: string) {
    return this.questionsById[id];
  }

  public getQuestionsByTag(tag: string) {
    return this.questionsByTag[tag] ?? [];
  }

  public addExceptions(exceptionMap: ExceptionMap) {
    Object.assign(this.exceptionMap, exceptionMap);
  }

  public addException(uniqname: string, question_id: string, exception: Exception) {
    if (!this.exceptionMap[uniqname]) {
      this.exceptionMap[uniqname] = {};
    }
    this.exceptionMap[uniqname][question_id] = exception;
  }

  public addSection(section: Section) {
    this.sections.push(section);
  }

  public buildAssignedExam(student: Student) {
    let ae = new AssignedExam(this, student,
      this.sections.map((section, s_i) => new AssignedSection(
        section, s_i,
        section.builder(this, student, new Randomizer(student.uniqname + "_" + section.id)).map(
          (question, q_i) => new AssignedQuestion(this, question, s_i, q_i, "")
        )
      ))
    );
    this.submissions.push(ae);
    return ae;
  }

  // public loadRandomizedStudent(submissionsFilename: string) {
  //   let randomizedSubmission : string[];
  //   return new Promise<void>((resolve, reject) => {
  //     let rowIndex = 0;
  //     let randomizedSubmissionComplete = false;
  //     createReadStream(submissionsFilename)
  //     .pipe(csv({ headers: false }))
  //     .on('data', (rawRow: { [index: number]: string }) => {
  //       if (rowIndex < NUM_META_ROWS) {
  //         // First rows contain meta-information about questions
  //         this.readMetaRow(rawRow);
  //       }
  //       else if (rowIndex === NUM_META_ROWS) {
  //         assert(rawRow[0] === "Uniqname" && rawRow[1] === "Name", "CSV format not as expected (2)");
  //       }
  //       else {
  //         // Each row contains the responses for a particular student
  //         // each column is a different question
  //         assert(rawRow[2] === "", "CSV format not as expected (1)");

  //         let preferred = (a: string, b: string) => {
  //           if (a === "NOT ASSIGNED") {
  //             return b;
  //           }
  //           else if (a === BLANK_SUBMISSION && b !== "NOT ASSIGNED") {
  //             return b;
  //           }
  //           else {
  //             return a;
  //           }
  //         }

  //         let submission = Object.values(rawRow).slice(3);
  //         assert(submission.length === this.questions.length, "Mismatch between # of submissions and # of questions for " + rawRow[0]);
  //         if (!randomizedSubmission) {
  //           randomizedSubmission = submission;
  //         }
  //         else if (!randomizedSubmissionComplete) {
  //           // Fill in missing parts of randomized submission
  //           randomizedSubmission = randomizedSubmission.map((q, i) => preferred(q, submission[i]));
  //           // console.log(JSON.stringify(randomizedSubmission));
  //           if (!randomizedSubmission.some(q => q === "NOT ASSIGNED" || q === "BLANK")) {
  //             randomizedSubmissionComplete = true;
  //           }
  //         }
  //         else {
  //           return;
  //         }
  //         // let assignedQuestions = submissions
  //         //   .map((s,i) => <[string,number]>[s,i])
  //         //   .filter(([s,i]) => s !== "NOT ASSIGNED")
  //         //   .map(([s,i]) => new AssignedQuestion(this.questions[i], s));
  //       }
  //       ++rowIndex;
  //     })
  //     .on('end', () => {
  //       this.addStudent("rando", "Rando", randomizedSubmission);
  //       resolve();
  //     })
  //     .on('error', error => reject(error));
  //   });
    

  // }

  // public loadSubmissions(submissionsFilename: string) {
  //   return new Promise<void>((resolve, reject) => {
  //     let rowIndex = 0;
  //     createReadStream(submissionsFilename)
  //     .pipe(csv({ headers: false }))
  //     .on('data', (rawRow: { [index: number]: string }) => {
  //       if (rowIndex < NUM_META_ROWS) {
  //         // First rows contain meta-information about questions
  //         this.readMetaRow(rawRow);
  //       }
  //       else if (rowIndex === NUM_META_ROWS) {
  //         assert(rawRow[0] === "Uniqname" && rawRow[1] === "Name", "CSV format not as expected (2)");
  //       }
  //       else {
  //         // Each row contains the responses for a particular student
  //         // each column is a different question
  //         assert(rawRow[2] === "", "CSV format not as expected (1)");

  //         let submissions = Object.values(rawRow).slice(3);
  //         assert(submissions.length === this.questions.length, "Mismatch between # of submissions and # of questions for " + rawRow[0]);
  //         // let assignedQuestions = submissions
  //         //   .map((s,i) => <[string,number]>[s,i])
  //         //   .filter(([s,i]) => s !== "NOT ASSIGNED")
  //         //   .map(([s,i]) => new AssignedQuestion(this.questions[i], s));

  //         this.addStudent(rawRow[0], rawRow[1], submissions);
  //       }
  //       ++rowIndex;
  //     })
  //     .on('end', () => resolve())
  //     .on('error', error => reject(error));
  //   });
    

  // }

  // public addStudent(uniqname: string, name: string, submissions: readonly string[]) {
    
  //   let assignedQuestions: AssignedQuestion[] = [];
  //   let notAssignedQuestions: Question[] = [];
  //   this.questionBank.forEach((q, i) => {
  //     let submission = submissions[i];
  //     if (submission === "NOT ASSIGNED") {
  //       notAssignedQuestions.push(q);
  //     }
  //     else {
  //       let section = this.sections[q.sectionIndex];
  //       assert(section, `Question ${q.unifiedIndex}: Corresponding section ${q.sectionIndex} not found!`);
  //       assignedQuestions.push(new AssignedQuestion(this, section, q, submission));
  //     }
  //   });

  //   if (assignedQuestions.every(aq => aq.submission === BLANK_SUBMISSION)) {
  //     // console.log(`Discarding blank submission for ${uniqname}`.yellow);
  //     return; // discard completely blank submissions
  //   }

  //   if (!this.submissionsByUniqname[uniqname]) {
  //     // if no previous student with this name
  //     let student = new AssignedExam(this, uniqname, name, assignedQuestions, notAssignedQuestions);
  //     this.submissions.push(student);
  //     this.submissionsByUniqname[uniqname] = student;
  //   }
  //   else {
  //     console.log(`Warning: Duplicate exam submission for ${uniqname}`.bgRed);
  //   }

  // }

  public gradeAllStudents() {
    this.submissions.forEach(s => s.gradeAll(this.graderMap));
  }

  public renderReports() {
    mkdirSync("out/students/", {recursive: true});
    [...this.submissions].sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
      // .filter(s => s.pointsEarned)
      .forEach((s, i, arr) => {
        console.log(`${i}/${arr.length} Rendering full exam report for: ${s.student.uniqname}...`);

        
        writeAGFile(`out/students/${s.student.uniqname}.html`, s.renderReport());
      });

  }

  // public writeScoresCsv() {
  //   mkdirSync("out/", {recursive: true});
  //   let data = [...this.submissions].sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
  //     .filter(s => s.pointsEarned)
  //     .map(s => {
  //       let student_data : {[index:string]: any} = {};
  //       student_data["uniqname"] = s.student.uniqname;
  //       student_data["total"] = s.pointsEarned;
  //       s.assignedQuestions.forEach(aq => student_data[aq.unifiedIndex] = aq.pointsEarned);
  //       return student_data;
  //     });
      
  //   stringify(
  //     data,
  //     {
  //       header: true,
  //       columns: ["uniqname", "total", ...this.questionBank.map(q => q.unifiedIndex)]
  //     },
  //     function (err, output) {
  //       writeFileSync('out/scores.csv', output);
  //     }
  //   );
  // }

}

export function writeAGFile(filename: string, body: string) {
  writeFileSync(filename, `
      <!DOCTYPE html>
    <html>
    <meta charset="UTF-8">
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/@popperjs/core@2" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.4.1/styles/default.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.4.1/highlight.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/he/1.2.0/he.min.js" integrity="sha512-PEsccDx9jqX6Dh4wZDCnWMaIO3gAaU0j46W//sSqQhUQxky6/eHZyeB3NrXD2xsyugAKd4KPiDANkcuoEa2JuA==" crossorigin="anonymous"></script>
    <script>
      $(function() {
        $('button.examma-ray-blank-saver').on("click", function() {
          let blank_num = $(this).data("blank-num");
          let checked = $("input[type=checkbox]:checked").filter(function() {
            return $(this).data("blank-num") === blank_num;
          }).map(function() {
            return '"'+$(this).data("blank-submission").replace('"','\\\\"')+'"';
          }).get().join(",\\n");
          $(".checked-submissions-content").html(he.encode(checked));
          $(".checked-submissions-modal").modal("show")
        })
      });
    </script>
    <style>
      html {
        scroll-behavior: smooth;
      }

      .examma-ray-sas-diff pre {
        margin-right: 0;
        margin-top: 0;
        margin-bottom: 0;
        margin-left: 1em;
      }
      .examma-ray-sas-diff pre > code {
        display: inline-block;
        vertical-align: middle;
      }
      .examma-ray-sas-diff pre > svg {
        display: inline-block;
        vertical-align: middle;
      }
      .examma-ray-sas-diff .card-header p {
        display: inline;
        margin-bottom: 0;
      }

      .examma-ray-sas-diff {
        font-size: 0.8rem;
      }

      .examma-ray-fitb-diff tr > *:first-child,
      .examma-ray-sas-diff tr > *:first-child {
        position: sticky;
        left: 0;
        background-color: white;
      }

      .examma-ray-sas-rubric-item {
        width: 250px;
      }

      .examma-ray-sas-rubric-item .badge {
        vertical-align: middle;
      }

      .examma-ray-mc-option > p {
        display: inline-block; margin: 0;
      }
      .examma-ray-incorrect > * {
        // color: red;
        // text-decoration: line-through !important;
      }
      .examma-ray-correct > * {
        // color: green;
        // font-weight: bold;
      }
      
      .examma-ray-mc-option {
        vertical-align: top;
      }
      
      .examma-ray-mc-option pre {
        display: inline-block;
        vertical-align: text-top;
        margin-bottom: 0;
      }

      .examma-ray-mc-option pre code {
        font-size: 0.8rem;
      }

      .card-header {
        padding: 0.2rem 0.75rem;
      }
      .card-body {
        padding: 0 0.75rem;
        padding-top: 0.25rem;
      }

      .examma-ray-grading-annotation {
        font-size: 0.8rem;
        color: blue;
        font-style: italic;
      }
      code {
        color: unset;
      }

      .examma-ray-fitb-diff {
        font-size: 0.8rem;
      }

      .examma-ray-fitb-blank {
        border: solid 1px #333;
        padding: 0.2em;
      }

      .examma-ray-fitb-spacer {
        height: 0.5em;
        width: 1px;
      }

      .examma-ray-section-heading {
        font-size: 1.2em;
        margin-bottom: 10px;
      }

      .examma-ray-section-container {
        margin-left: 7px;
      }

      .examma-ray-section-description,
      .examma-ray-section-reference {
        font-size: 75%;
      }

      .examma-ray-section-container .h1,
      .examma-ray-section-container .h2,
      .examma-ray-section-container .h3,
      .examma-ray-section-container .h4,
      .examma-ray-section-container .h5,
      .examma-ray-section-container .h6,
      .examma-ray-section-container h1,
      .examma-ray-section-container h2,
      .examma-ray-section-container h3,
      .examma-ray-section-container h4,
      .examma-ray-section-container h5,
      .examma-ray-section-container h6 {
        font-size: 1rem;
    }

      .examma-ray-question-description {
        font-size: 75%;
      }

      .examma-ray-question-description h1,
      .examma-ray-question-description h2,
      .examma-ray-question-description h3,
      .examma-ray-question-description h4,
      .examma-ray-question-description h5,
      .examma-ray-question-description h6,
      .examma-ray-question-description h7 {
        font-size: initial;
      }

      .examma-ray-question-description p {
        margin-bottom: 1em;
      }

      .examma-ray-grading-report {
        overflow-x: auto;
        max-height: 70vh;
      }

      .examma-ray-grading-report form {
        margin-bottom: 0;
      }

      .examma-ray-grading-report .btn-link {
        font-size: 0.8rem;
      }

      .nav .examma-ray-score-badge {
        width: 5em;
      }

      .rubric-item-card {
        width: 17em;
      }

      .rubric-item-card .card-header {
        padding: 0.25rem;
      }

      .rubric-item-card .card-body {
        overflow-x: auto;
      }

      .rubric-item-card a.nav-link {
        font-weight: 500;
        padding: 0;
      }



      .examma-ray-mc-option .hljs {
          background: unset;
          padding: unset;
      }
      
      .examma-ray-summation-grader .examma-ray-point-adjustment-badge {
        width: 3em;
        margin-left: 0.5em;
        margin-right: 0.5em;
        vertical-align: text-top;
      }

      .examma-ray-summation-grader label {
        margin-bottom: 0;
      }

      .examma-ray-summation-grader .examma-ray-mc-option {
        vertical-align: text-top;
      }

      .examma-ray-summation-grader .examma-ray-mc-option pre {
        vertical-align: text-top;
      }

      .examma-ray-question-overview {
        margin: 0.3em;
      }
      
      .examma-ray-question-overview .card-header {
        padding: 0.25rem;
      }

      .examma-ray-question-overview a.nav-link {
        display: inline-block;
        font-weight: 500;
        padding: 0;
      }

      .examma-ray-question-overview .progress {
        width: 7em;
        background-color: #c8c8c8;
      }
      
      .examma-ray-question-overview pre code .progress {
        width: 35em;
        background-color: #c8c8c8;
      }

      .examma-ray-question-overview .progress-bar {
        padding-left: 0.4em;
        padding-right: 0.4em;
        font-weight: 600;
        text-align: left;
      }

      
      .examma-ray-students-overview .progress {
        width: 7em;
        background-color: #c8c8c8;
      }


    </style>
    <body>
      ${body}
      <div class="checked-submissions-modal modal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Selected Answers</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <pre><code class="checked-submissions-content"></code></pre>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>`, { encoding: "utf-8" });
    // pdf.create(`<html><body>${s.renderAllReports(graderMap)}</body></html>`, { format: 'Letter' }).toFile('test.pdf', function(err, res) {
    //   if (err) return console.log(err);
    //   console.log(res); // { filename: '/app/businesscard.pdf' }
    // });
}


// export function renderStatsToFile(exam: Exam, problemIndex: string) {
//   mkdirSync("out/questions/", {recursive: true});
//   let question = exam.questionBank.find(q => q.unifiedIndex === problemIndex);
//   assert(question, `Error: Can't find question ${problemIndex}.`);
//   let out_filename = `out/questions/${problemIndex}.html`;
//   console.log(`Writing details for question ${problemIndex} to ${out_filename}.`);
  
//   let grader = exam.graderMap[problemIndex];
//   if (!grader) {
//       return;
//   }

//   let statsReport = grader.renderStats(
//       question!,
//       exam.submissions.map(
//           s => (<AssignedQuestion<"code_fitb">>s.assignedQuestions.find(aq => aq.unifiedIndex === problemIndex))?.submission
//       ).filter(sub => sub)
//   );

//   let header = `<div style="margin: 2em">${renderQuestion(question, "Question " + question.unifiedIndex,"", "")}</div>`

//   writeAGFile(out_filename, `
//       ${header}
//       ${statsReport}
//   `);
// }

// export function renderOverview(exam: Exam) {
//   mkdirSync("out/", {recursive: true});
//   let out_filename = `out/overview.html`;

//   let main_overview = `<div>
//     <div>Mean: ${mean(exam.submissions.map(s => s.pointsEarned!))}</div>
//     <div>Std Dev: ${standardDeviation(exam.submissions.map(s => s.pointsEarned!))}</div>
//   </div>`

//   let students_overview = exam.submissions.sort((a, b) => (b.pointsEarned ?? 0) - (a.pointsEarned ?? 0)).map(ex => {
//     let score = ex.pointsEarned ?? 0;
//     return `<div>${renderPointsProgressBar(score, exam.pointsPossible)} <a href="students/${ex.student.uniqname}.html">${ex.student.uniqname}</a></div>`
//   }).join("");

//   let questions_overview = exam.questionBank.map(question => {
//     let grader = exam.graderMap[question.unifiedIndex];

//     let header: string;
//     let question_overview: string;
//     let avg: number | undefined;
//     let count: number | undefined;
//     if (!grader) {
//       header = `<h4>${question.unifiedIndex}</h4>`;
//       question_overview = "No grader for this question.";
//     }
//     else {
//       let assignedQuestions = exam.submissions.map(
//         s => s.assignedQuestions.find(aq => aq.unifiedIndex === question.unifiedIndex)! // ! is confirmed by filter below
//       ).filter(aq => aq);
//       count = assignedQuestions.length;

//       avg = average(assignedQuestions.map(aq => aq.pointsEarned!));
//       header = `<b>${question.unifiedIndex}</b> Details`;

//       let submissions = assignedQuestions.map(aq => aq.submission);
//       question_overview = `<div>
//         ${grader?.renderOverview(question, submissions)}
//       </div>`;
//     }

    
//     let overview_id = `question-overview-${question.sectionIndex}-${question.partIndex}`;
//     return `<div class="examma-ray-question-overview">
//       <div id="${overview_id}" class="card">
//         <div class="card-header">
//           ${renderNumBadge(count ?? "n/a")}
//           ${renderPointsProgressBar(avg ?? 0, question.pointsPossible)}
//           <a class="nav-link" data-toggle="collapse" data-target="#${overview_id}-details" role="button" aria-expanded="false" aria-controls="${overview_id}-details">${header}</a>
//         </div>
//         <div class="collapse" id="${overview_id}-details">
//           <div class="card-body">
//             <div><a href="questions/${question.unifiedIndex}.html">Question Analysis Page</a></div>
//             ${question.html_description}
//             ${question_overview}
//           </div>
//         </div>
//       </div>
//     </div>`;
//   }).join("");

//   let overview = `
//     ${main_overview}
//     <div class="examma-ray-students-overview">
//       ${students_overview}
//     <div>
//     ${questions_overview}
//   `;

//   writeAGFile(out_filename, overview);
// }

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

function renderScoreBadge(pointsEarned: number, pointsPossible: number) {
  let text = `${+pointsEarned.toFixed(2)}/${+pointsPossible.toFixed(2)}`;
  return `<span class="badge ${pointsPossible === 0 ? "badge-secondary" :
      pointsEarned === 0 ? "badge-danger" :
      pointsEarned < pointsPossible ? "badge-warning" :
      "badge-success"
    } examma-ray-score-badge">${text}</span>`;
}

function renderUngradedBadge(pointsPossible: number) {
  return `<span class="badge badge-secondary examma-ray-score-badge">?/${pointsPossible}</span>`;
}

function renderNumBadge(num: number | string) {
  return `<span class="badge badge-secondary" style="width: 2.5em">${num}</span>`
}

function renderPointsWorthBadge(num: number) {
  return `<span class="badge badge-secondary">${num} points</span>`
}

let percentCorrectScale = chroma.scale(["#dc3545", "#ffc107", "#28a745"]).mode("lab");

function renderPercentCorrectBadge(percent: number) {
  return `<span class="badge" style="background-color: ${percentCorrectScale(percent).hex()}; color: white;">${Math.floor(percent * 100)}%</span>`
}

function renderDynamicColoredScoreBadge(pointsEarned: number, pointsPossible: number) {
  // Note the unary + below drops extra .00 from the number because it implicitly converts
  // the string from .toFixed() back into a number
  return `<span class="badge" style="background-color: ${percentCorrectScale(pointsEarned/pointsPossible).hex()}; color: white;">${+pointsEarned.toFixed(2)}/${+pointsPossible.toFixed(2)}</span>`
}

function renderPointsProgressBar(pointsEarned: number, pointsPossible: number, text?: string) {
  // Note the unary + below drops extra .00 from the number because it implicitly converts
  // the string from .toFixed() back into a number
  let progressPercent = pointsPossible === 0 ? 100 : Math.max(1, Math.floor(100 * (pointsEarned/pointsPossible)));
  let color = progressPercent < 50 ? "white" : "white";
  text = text ?? `${+pointsEarned.toFixed(2)}/${+pointsPossible.toFixed(2)}`;
  return `<div style="display: inline-block; vertical-align: middle;"><div class="progress">
    <div class="progress-bar" role="progressbar"
      style="width: ${progressPercent}%; background-color: ${percentCorrectScale(pointsEarned/pointsPossible).hex()}; color: ${color};
      overflow: visible;"
      aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
        ${text}
    </div>
  </div></div>`;
}

// export function run_autograder(exam: Exam) {
//   let argv = minimist(process.argv.slice(2), {
//     alias : {
//         "a": "all_questions",
//         "n": "no_reports"
//     },
//     default : {
//       "no_reports": false
//     }
//     });
      
//     let isAllQuestions: string = argv["all_questions"];
//     let isRenderReports: boolean = !argv["no_reports"];
    
//     (async () => {
    
//         if (isAllQuestions) {
//             console.log("Creating one exam with all questions with answers drawn from random students...");
//             await exam.loadRandomizedStudent("matlab_exam_w21_answerkey.csv");
//         }
//         else {
//             console.log("Loading submissions for all students...");
//             await exam.loadSubmissions("matlab_exam_w21_morning.csv");
//             await exam.loadSubmissions("matlab_exam_w21_evening.csv");
//             await exam.loadSubmissions("matlab_exam_w21_makeup.csv");
//             await exam.loadSubmissions("matlab_exam_w21_nacosw.csv");
//         }
        
//         console.log("Grading exam...");
//         exam.gradeAllStudents();
    
//         console.log("Rendering question details...");
//         exam.questions.forEach(q => renderStatsToFile(exam, q.unifiedIndex));

//         console.log("Rendering overview...");
//         renderOverview(exam);

//         if (isRenderReports) {
//             console.log("Rendering student reports...");
//             exam.renderReports();
//         }
    
    
//         console.log("Writing scores csv...");
//         exam.writeScoresCsv();
//     })();
// }

// export function run_autograder(exam: Exam) {
//   let argv = minimist(process.argv.slice(2), {
//     alias : {
//         "a": "all_questions",
//         "n": "no_reports"
//     },
//     default : {
//       "no_reports": false
//     }
//     });
      
//     let isAllQuestions: string = argv["all_questions"];
//     let isRenderReports: boolean = !argv["no_reports"];
    
//     (async () => {
    
//         if (isAllQuestions) {
//             console.log("Creating one exam with all questions with answers drawn from random students...");
//             await exam.loadRandomizedStudent("matlab_exam_w21_answerkey.csv");
//         }
//         else {
//             console.log("Loading submissions for all students...");
//             await exam.loadSubmissions("matlab_exam_w21_morning.csv");
//             await exam.loadSubmissions("matlab_exam_w21_evening.csv");
//             await exam.loadSubmissions("matlab_exam_w21_makeup.csv");
//             await exam.loadSubmissions("matlab_exam_w21_nacosw.csv");
//         }
        
//         console.log("Grading exam...");
//         exam.gradeAllStudents();
    
//         console.log("Rendering question details...");
//         exam.questions.forEach(q => renderStatsToFile(exam, q.unifiedIndex));

//         console.log("Rendering overview...");
//         renderOverview(exam);

//         if (isRenderReports) {
//             console.log("Rendering student reports...");
//             exam.renderReports();
//         }
    
    
//         console.log("Writing scores csv...");
//         exam.writeScoresCsv();
//     })();
// }
