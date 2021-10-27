/**
 * ## Fill-In-The-Blank Regular Expression Graders
 * 
 * For the FITB Regex grader, you'll need to be familiar with javascript regular expression syntax.
 * - Tutorial/Documentation at [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
 * - Interactive tool for testing out regexes, really neat. [https://regex101.com/](https://regex101.com/) Make sure to select the "ECMAScript/Javascript" flavor on the left side.
 * - Tip: Normally, the regex will match against any substring of what the student entered. If you want it to only match the WHOLE thing, use `^` and `$`. For example, if you're looking to match any decimal number `/[\d\.]+` will match `6.2` and `My answer is 6.2`, whereas `^[\d\.]+$` will only match `6.2`. Essentially `^` means "beginning of string" and `$` means "end of string".
 * 
 * For now, refer to examples of existing graders. More thorough documentation coming.
 * 
 * @module
 */


import { encode } from "he";
import { min, sum } from "simple-statistics";
import { applySkin, mk2html } from "../core/render";
import { AssignedQuestion, GradedQuestion } from "../core/assigned_exams";
import { BLANK_SUBMISSION, ResponseKind } from "../response/common";
import { FITBSubmission } from "../response/fitb";
import { createFilledFITB } from "../response/util-fitb";
import { assert } from "../core/util";
import { QuestionGrader, ImmutableGradingResult } from "./QuestionGrader";
import { renderMultilinePointsProgressBar, renderNumBadge, renderScoreBadge } from "../core/ui_components";


export type FITBRegexGradingResult = ImmutableGradingResult & {
  readonly itemResults: readonly {
    matched: boolean,
    pointsEarned: number,
    explanation?: string
  }[]
};

export type FITBRegexMatcher = {
  pattern: RegExp | readonly string[] | ((s:string)=>boolean);
  points: number;
  explanation: string;
};

export type FITBRegexRubricItem = {
  blankIndex: number;
  points: number;
  title: string;
  description: string;
  patterns: FITBRegexMatcher[];
};

function identifyCodeWords(blanks: readonly string[]) {
  let result = new Set<string>();
  blanks.forEach(code => code.split(/[^a-zA-Z0-9_]/).forEach(w => result.add(w)));
  return result;
}

function replaceWordInSubmission(submission: string[], word: string, replacement: string) {
  return submission.map(blankStr => blankStr.replace(word, replacement));
}

export class FITBRegexGrader implements QuestionGrader<"fill_in_the_blank"> {

  private minRubricItemPoints: number;

  public constructor(
    public readonly rubric: readonly FITBRegexRubricItem[]
  ) {

    this.minRubricItemPoints = min(this.rubric.map(ri => ri.points));
  }

  public isGrader<T extends ResponseKind>(responseKind: T): this is QuestionGrader<T> {
    return responseKind === "fill_in_the_blank";
  };

  public prepare() { }

  public grade(aq: AssignedQuestion<"fill_in_the_blank">) : FITBRegexGradingResult {
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

    // if (aq.question.sampleSolution) {
    //   let sampleSolution = aq.question.sampleSolution;
    //   assert(sampleSolution.length === this.rubric.length, `Error: Mismatched number of answers in FITB sample solution vs. rubric for ${aq.question.question_id}`.red)
    //   let mutableSubmission = submission.slice();
    //   let solutionWords = identifyCodeWords(sampleSolution);
  
    //   let submissionWords = identifyCodeWords(mutableSubmission);
    //   submissionWords.forEach(subWord => solutionWords.forEach(solWord => {
    //     let newResult = this.grade_helper(replaceWordInSubmission(mutableSubmission, subWord, solWord));
    //     if (newResult.pointsEarned > result.pointsEarned + this.minRubricItemPoints) {
    //       // console.log(`HEYYYYY, might be double jeopardy here. ${aq.question.question_id} Replace ${subWord} with ${solWord}! ${result.pointsEarned} --> ${newResult.pointsEarned}`);
    //     }
    //   }));
    // }


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

  public renderReport(aq: GradedQuestion<"fill_in_the_blank", FITBRegexGradingResult>) {
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
    
    let itemResults = gr.itemResults;
    assert(itemResults.length === this.rubric.length);

    let rubricItemsHtml = `<table style="position: sticky; top: 0;">${itemResults.map((itemResult, i) => {
      let rubricItem = this.rubric[i];

      let explanation: string = mk2html(itemResult.explanation ?? "Your response for this blank was incomplete or incorrect.", skin);

      let elem_id = `question-${aq.uuid}-item-${i}`;

      return `
        <tr><td><div id="${elem_id}" class="card rubric-item-card">
          <div class="card-header">
            <a class="nav-link" style="font-weight: 500;" data-toggle="collapse" data-target="#${elem_id}-details" role="button" aria-expanded="false" aria-controls="${elem_id}-details">${renderScoreBadge(itemResult.pointsEarned, rubricItem.points)} Blank ${i + 1}<br />${mk2html(rubricItem.title, skin)}</a>
          </div>
          <div class="collapse" id="${elem_id}-details">
            <div class="card-body">
              ${mk2html(rubricItem.description, skin)}
              <p>Your response for this blank was: <code style="border: solid 1px #333; padding: 0.2em; white-space: pre;">${encode(submission[i])}</code></p>
              ${explanation}
            </div>
          </div>
        </div></td></tr>`;
    }).join("")}</table>`;


    let sampleSolution = aq.question.sampleSolution;
    let solutionFilled = sampleSolution && createFilledFITB(applySkin(content, skin), sampleSolution.map(s => applySkin(s, skin)));

    return `
    <table class="table table-sm examma-ray-fitb-diff">
      <tr><th>Rubric</th><th>Your Submission</th><th>Sample Solution</th></tr>
      <tr>
        <td>${rubricItemsHtml}</td>
        <td>${studentFilled}</td>
        ${sampleSolution ? `<td>${solutionFilled}</td>` : ""}
      </tr>
    </table>`;
  }

  public renderStats(aqs: readonly AssignedQuestion<"fill_in_the_blank">[]) {
    let question = aqs[0].question;
    let submissions = aqs.map(aq => aq.submission);
    let gradedBlankSubmissions = this.getGradedBlanksSubmissions(submissions);

    let sampleSolution = question.sampleSolution;
    let solutionFilled = createFilledFITB(question.response.content, sampleSolution);


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
            ${blankSubs.slice().sort((a,b)=>b.num - a.num).map(s => `<div style="white-space: pre"><input type="checkbox" data-blank-num="${i}" data-blank-submission="${encode(s.sub)}"> ${renderScoreBadge(s.points, this.rubric[i].points)} ${renderNumBadge(s.num)} "<code style="white-space: pre">${encode(s.sub)}</code>"</li>`).join("")}
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

  public renderOverview(gqs: readonly GradedQuestion<"fill_in_the_blank">[]) {
    let question = gqs[0].question;
    let submissions = gqs.map(aq => aq.submission);
    let gradedBlankSubmissions = this.getGradedBlanksSubmissions(submissions);
    let blankAverages = gradedBlankSubmissions.map(
      gradedSubmissions => sum(gradedSubmissions.map(s => s.points * s.num)) / sum(gradedSubmissions.map(s => s.num)));
    let blankPoints = this.rubric.map(ri => ri.points);
    let blankSolutions : string[] = question.sampleSolution?.map(s => encode(s)) ?? [];
    let percents = blankAverages.map((avg, i) => Math.floor(100 * (avg/blankPoints[i])));
    let blankBars = blankAverages.map((avg, i) => renderMultilinePointsProgressBar(avg, blankPoints[i], `${percents[i]}% ${blankSolutions[i] ?? ""}`));
    let solutionFilled = createFilledFITB(question.response.content, blankBars, s=>s, s=>s, s=>s);
    return solutionFilled;
  }

}
function FITBRubricItemMatch(rubricItem: FITBRegexRubricItem, submission: string) {
  return rubricItem.patterns.find(p => {
    if (typeof p.pattern === "function") {
      return p.pattern(submission);
    }
    if (p.pattern instanceof RegExp) {
      return p.pattern.test(submission);
    }
    else {
      return p.pattern.indexOf(submission) !== -1;
    }

  });
}
