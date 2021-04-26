import { encode } from "he";
import { min } from "simple-statistics";
import { applySkin, mk2html } from "../render";
import { AssignedQuestion, GradedQuestion, Question } from "../exams";
import { BLANK_SUBMISSION, ResponseKind } from "../response/common";
import { createFilledFITB, FITBSubmission } from "../response/fitb";
import { assert, assertFalse } from "../util";
import { QuestionGrader, ImmutableGradingResult } from "../QuestionGrader";
import { renderNumBadge, renderScoreBadge } from "../ui_components";
import { QuestionSkin } from "../skins";


export type FITBRegexGradingResult = ImmutableGradingResult & {
  readonly itemResults: readonly {
    matched: boolean,
    pointsEarned: number,
    explanation?: string
  }[]
};

export type FITBRegexMatcher = {
  pattern: RegExp | readonly string[];
  points: number;
  explanation: string;
};

export type FITBRegexRubricItem = {
  blankIndex: number;
  points: number;
  title: string;
  description: string;
  solution: string;
  patterns: FITBRegexMatcher[];
};

function identifyCodeWords(blanks: string[]) {
  let result = new Set<string>();
  blanks.forEach(code => code.split(/[^a-zA-Z0-9_]/).forEach(w => result.add(w)));
  return result;
}

function replaceWordInSubmission(submission: string[], word: string, replacement: string) {
  return submission.map(blankStr => blankStr.replace(word, replacement));
}

export class FITBRegexGrader implements QuestionGrader<"fitb"> {

  private solutionWords: ReadonlySet<string>;
  private minRubricItemPoints: number;

  public constructor(
    public readonly rubric: readonly FITBRegexRubricItem[]
  ) {

    this.solutionWords = identifyCodeWords(rubric.map(ri => ri.solution));
    this.minRubricItemPoints = min(this.rubric.map(ri => ri.points));
  }

  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return responseKind === "fitb";
  };

  public grade(aq: AssignedQuestion<"fitb">) : FITBRegexGradingResult {
    let submission = aq.submission;
    if (submission === BLANK_SUBMISSION || submission.length === 0) {
      return {
        wasBlankSubmission: true,
        pointsEarned: 0,
        itemResults: []
      };
    }

    
    assert(submission.length === this.rubric.length, `Error: Mismatched number of answers in FITB grader submission vs. rubric for ${aq.question.question_id}`.red);
    
    let result = this.grade_helper(submission);

    let mutableSubmission = submission.slice();

    let submissionWords = identifyCodeWords(mutableSubmission);
    submissionWords.forEach(subWord => this.solutionWords.forEach(solWord => {
      let newResult = this.grade_helper(replaceWordInSubmission(mutableSubmission, subWord, solWord));
      if (newResult.pointsEarned > result.pointsEarned + this.minRubricItemPoints) {
        console.log(`HEYYYYY, might be double jeopardy here. ${aq.question.question_id} Replace ${subWord} with ${solWord}! ${result.pointsEarned} --> ${newResult.pointsEarned}`);
      }
    }));

    return result;
  }

  private grade_helper(submission: readonly string[]) : FITBRegexGradingResult {

    let itemResults = this.rubric.map((rubricItem, i) => {
      assert(rubricItem.blankIndex === i + 1, "Mismatched blank index on FITB rubric.");

      let match = FITBRubricItemMatch(rubricItem, submission[i]);
      return {
        matched: !!match,
        pointsEarned: match?.points ?? 0,
        explanation: match?.explanation
      };
    });

    return {
      wasBlankSubmission: false,
      pointsEarned: itemResults.reduce((p, r) => p + r.pointsEarned, 0),
      itemResults: itemResults
    };
  }

  public pointsEarned(gr: FITBRegexGradingResult) {
    return gr.pointsEarned;
  }

  public renderReport(aq: GradedQuestion<"fitb", FITBRegexGradingResult>) {
    let gr = aq.gradingResult;
    let question = aq.question;
    let orig_submission = aq.submission;
    let skin = aq.skin;
    let submission: readonly string[];
    if (gr.wasBlankSubmission) {
      return "Your answer for this question was blank.";
    }
    else {
      assert(orig_submission !== BLANK_SUBMISSION);
      submission = orig_submission;
    }

    let content = question.response.content;

    let studentFilled = createFilledFITB(applySkin(content, skin), submission.map(s => s)); //, content, scores);
    let solutionFilled = createFilledFITB(applySkin(content, skin), this.rubric.map(ri => ri.solution)); //, content, undefined);

    let itemResults = gr.itemResults;
    assert(itemResults.length === this.rubric.length);

    let rubricItemsHtml = `<table style="position: sticky; top: 0;">${itemResults.map((itemResult, i) => {
      let rubricItem = this.rubric[i];

      let explanation: string = itemResult.explanation ?? "Your response for this blank was incomplete or incorrect.";

      let elem_id = `question-${question.question_id}-item-${i}`;

      return `
        <tr><td><div id="${elem_id}" class="card rubric-item-card">
          <div class="card-header">
            <a class="nav-link" style="font-weight: 500;" data-toggle="collapse" data-target="#${elem_id}-details" role="button" aria-expanded="false" aria-controls="${elem_id}-details">${renderScoreBadge(itemResult.pointsEarned, rubricItem.points)} Blank ${i + 1}<br />${rubricItem.title}</a>
          </div>
          <div class="collapse" id="${elem_id}-details">
            <div class="card-body">
              ${mk2html(rubricItem.description, skin)}
              <p>Your response for this blank was: <code style="border: solid 1px #333; padding: 0.2em; white-space: pre;">${encode(submission[i])}</code></p>
              ${mk2html(explanation, skin)}
            </div>
          </div>
        </div></td></tr>`;
    }).join("")}</table>`;

    return `
    <table class="table table-sm examma-ray-fitb-diff">
      <tr><th>Rubric</th><th>Your Submission</th><th>Sample Solution</th></tr>
      <tr>
        <td>${rubricItemsHtml}</td>
        <td>${studentFilled}</td>
        <td>${solutionFilled}</td>
      </tr>
    </table>`;
  }

  public renderStats(aqs: readonly AssignedQuestion<"fitb">[]) {
    let question = aqs[0].question;
    let submissions = aqs.map(aq => aq.submission);
    let gradedBlankSubmissions = this.getGradedBlanksSubmissions(submissions);

    let solutionFilled = createFilledFITB(question.response.content, this.rubric.map(ri => ri.solution));


    return `<table class="table" style="border-collapse: separate; border-spacing: 0;">
      <tr>
        <th style="position: sticky; left: 0; top: 0; z-index: 11; background-color: white; border-bottom: 1px solid #dee2e6; border-top: 1px solid #dee2e6; border-right: 1px solid #dee2e6;">Sample Solution</th>
        ${this.rubric.map(ri => `<th style="position: sticky; top: 0; z-index: 10; background: white; z-index: 10; border-bottom: 1px solid #dee2e6; border-top: 1px solid #dee2e6;">Blank ${ri.blankIndex} <button class="examma-ray-blank-saver btn btn-primary" data-blank-num="${ri.blankIndex - 1}">Copy</button></th>`).join("")}
      </tr>
      <tr>
      <td style="position: sticky; left: 0; background-color: white; border-top: none; border-right: 1px solid #dee2e6;">
        <div style="position: sticky; top: 65px; white-space: pre; font-size: 0.8rem; max-height: 90vh; overflow: auto;">${solutionFilled}</div>
      </td>
        ${gradedBlankSubmissions.map((blankSubs, i) => `<td style="vertical-align: top; border-top: none;">
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

  public renderOverview(aqs: readonly AssignedQuestion<"fitb">[]) {
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
