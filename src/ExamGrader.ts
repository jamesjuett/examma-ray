/**
 * ## TODO this documentation is old and needs to be updated Grading Exams
 * 
 * To start, you'll want to define some graders and a mapping from question IDs
 * for the questions you're using to those graders. You might put these in their own
 * files, or in the same file as the question definitions, or somewhere else.
 * Whatever organization you like is fine, as long as you can eventually import
 * the graders you define into your grading script.
 * 
 * The association between a question ID and the grader that handles that
 * question is done with a [[GraderMap]].
 * 
 * ### `src/rubric/tf.ts`
 * ```typescript
 * import { GraderMap, SimpleMCGrader } from "examma-ray";
 * export const TF_Graders : GraderMap = {
 *  "sp20_mc_time_complexity_1" : new SimpleMCGrader(0),
 *  "sp20_mc_time_complexity_2" : new SimpleMCGrader(0)
 * };
 * ```
 * 
 * ### `src/rubric/s7_3.ts`
 * ```typescript
 * import { GraderMap, SimpleMCGrader } from "examma-ray";
 * export const S7_3_Grader = {
 *   "sp20_7_3_assn_op": new StandardSLGrader([
 *     {
 *       title: "Function Header",
 *       description: `Function header has correct name, parameter, and return ...`,
 *       points: 1,
 *       required: [1],
 *       prohibited: [0]
 *     },
 *     {
 *       title: "Self-Assignment Check",
 *       description: "The function should compare the \`this\` pointer, which ...",
 *       points: 0.5,
 *       required: [3],
 *       prohibited: [2]
 *     },
 *     ...
 * ```
 * 
 * and so on...
 * 
 * Then, set up a top-level grading script to create an [[ExamGrader]], register
 * your graders with it, load exams, grade the exams, and write out reports:
 * 
 * ### `src/grade.ts`
 * ```typescript
 * import { ExamGrader } from "examma-ray";
 * import { exam } from "./exam-spec"
 * import { TF_Graders } from "./rubric/tf";
 * import { S7_3_Grader } from "./rubric/s7_3";
 * 
 * let grader = new ExamGrader(exam, [
 *   TF_Graders,
 *   S7_3_Grader
 * ]);
 * 
 * grader.loadAllSubmissions();
 * grader.gradeAll();
 * grader.writeAll();
 * ```
 * 
 * Note the import of `exam` in the example above. This comes from your exam
 * specification that you've created in a separate file. TODO link to that documentation.
 * 
 * You might also have some questions (e.g. open-ended code writing) that require
 * people to manually grade. Calling `gradeAll()` won't fully grade those, but
 * it will trigger the appropriate graders to create grading assignment files.
 * Once those are filled in, just run the grading script again and it will pick
 * up the human-generated results in those files.
 * 
 * 
 * Several graders are currently supported:

- `FreebieGrader` - Gives points to everyone (or, optionally, to all non-blank submissions)
- `SimpleMCGrader` - Grades an MC question with one right answer
- `SummationMCGrader` - Grades a multiple-select MC question where each selection is worth positive or negative points
- `FITBRegexGrader` - Uses regular expressions to grade each blank in an FITB question. Also comes with an interface for human review of unique answers
- `StandardSLGrader` - Grades SL ("select-a-statement") questions based on which lines should/shouldn't be included

The format for the graders looks like JSON, but it's actually typescript code defining an object literal, so autocomplete, etc. should be available in VS Code.

For the FITB Regex grader, you'll need to be familiar with javascript regular expression syntax.

- Tutorial/Documentation at [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- Interactive tool for testing out regexes, really neat. [https://regex101.com/](https://regex101.com/) Make sure to select the "ECMAScript/Javascript" flavor on the left side.
- Tip: Normally, the regex will match against any substring of what the student entered. If you want it to only match the WHOLE thing, use `^` and `$`. For example, if you're looking to match any decimal number `/[\d\.]+` will match `6.2` and `My answer is 6.2`, whereas `^[\d\.]+$` will only match `6.2`. Essentially `^` means "beginning of string" and `$` means "end of string".

For now, refer to examples of existing graders. More thorough documentation coming.


 * @module
 */

import del from 'del';
import { mkdirSync, writeFileSync } from 'fs';
import { unparse } from 'papaparse';
import path from 'path';
import { average, mean, sum } from 'simple-statistics';
import { AssignedExam, AssignedQuestion, isGradedQuestion } from './core/assigned_exams';
import { ExamCurve } from "./core/ExamCurve";
import { Exam, Question, Section } from './core/exam_components';
import { GradedExamRenderer, SubmittedExamRenderer } from './core/exam_renderer';
import { chooseAllQuestions, chooseAllSections, realizeQuestions, realizeSections, StudentInfo } from './core/exam_specification';
import { GradedStats } from "./core/GradedStats";
import { ICON_BOX_CHECK } from './core/icons';
import { TrustedExamSubmission } from './core/submissions';
import { renderGradingProgressBar, renderPointsProgressBar } from './core/ui_components';
import { asMutable, assert } from './core/util';
import { UUID_Strategy } from './ExamGenerator';
import { createStudentUuid, ExamUtils, writeFrontendJS } from './ExamUtils';
import { GraderSpecification, QuestionGrader, realizeGrader } from './graders/QuestionGrader';



export type ExamGraderOptions = {
  frontend_js_path: string,
  frontend_media_dir: string,
  uuid_strategy: UUID_Strategy,
  uuidv5_namespace?: string,
};

const DEFAULT_OPTIONS = {
  frontend_js_path: "js/",
  frontend_media_dir: "media",
  uuid_strategy: "plain",
};

function verifyOptions(options: Partial<ExamGraderOptions>) {
  assert(options.uuid_strategy !== "uuidv5" || options.uuidv5_namespace, "If uuidv5 filenames are selected, a uuidv5_namespace option must be specified.");
  assert(!options.uuidv5_namespace || options.uuidv5_namespace.length >= 16, "uuidv5 namespace must be at least 16 characters.");
}

export type ExamGraderSpecification = Partial<ExamGraderOptions>;

export class ExamGrader {

  public readonly exam: Exam;
  public readonly submittedExams: AssignedExam[] = [];
  public readonly submittedExamsByUniqname: { [index: string]: AssignedExam | undefined; } = {};

  public readonly allSections: readonly Section[];
  public readonly allQuestions: readonly Question[];
  public readonly allAssignedQuestions: readonly AssignedQuestion[] = [];

  public readonly stats: GradedStats;
  public readonly curve?: ExamCurve;
  
  private readonly sectionsMap: { [index: string]: Section | undefined } = {};
  private readonly questionsMap: { [index: string]: Question | undefined } = {};
  private readonly assignedQuestionsById: { [index: string]: readonly AssignedQuestion[] | undefined } = {};

  private readonly graderMap: GraderMap = {};
  private readonly exceptionMap: ExceptionMap = {};

  private options: ExamGraderOptions;

  private renderer = new GradedExamRenderer();
  private submission_renderer = new SubmittedExamRenderer();

  private onStatus?: (status: string) => void;

  public constructor(exam: Exam, options: Partial<ExamGraderOptions> = {}, graders?: GraderSpecificationMap | readonly GraderSpecificationMap[], exceptions?: ExceptionMap | readonly ExceptionMap[], onStatus?: (status: string) => void) {
    this.exam = exam;
    this.onStatus = onStatus;
    verifyOptions(options);
    this.options = Object.assign(DEFAULT_OPTIONS, options);

    graders && this.registerGraders(graders);
    exceptions && this.registerExceptions(exceptions);

    this.allSections = exam.sections.flatMap(chooser => realizeSections(chooseAllSections(chooser)));
    this.allSections.forEach(section => this.sectionsMap[section.section_id] = section);

    this.allQuestions = this.allSections.flatMap(s => s.questions).flatMap(chooser => realizeQuestions(chooseAllQuestions(chooser)));
    this.allQuestions.forEach(question => this.questionsMap[question.question_id] = question);

    this.stats = new GradedStats();
  }

  public getGrader(question: Question) {
    return this.graderMap[question.question_id] ?? question.defaultGrader;
  }

  public addSubmission(answers: TrustedExamSubmission) {
    let ex = AssignedExam.createFromSubmission(this.exam, answers);
    this.submittedExams.push(ex);
    ex.assignedSections.forEach(s => s.assignedQuestions.forEach(aq => {
      asMutable(this.allAssignedQuestions).push(aq);
      if (!this.assignedQuestionsById[aq.question.question_id]) {
        this.assignedQuestionsById[aq.question.question_id] = [aq];
      }
      else {
        asMutable(this.assignedQuestionsById[aq.question.question_id]!).push(aq)
      }
    }));
  }

  public addSubmissions(answers: readonly TrustedExamSubmission[]) {
    answers.forEach(a => this.addSubmission(a));
  }

  public loadAllSubmissions() {
    this.addSubmissions(ExamUtils.loadTrustedSubmissions(
      `data/${this.exam.exam_id}/manifests/`,
      `data/${this.exam.exam_id}/submissions/`));
  }

  public registerGraders(graderMap: GraderSpecificationMap | readonly GraderSpecificationMap[]) {
    if (Array.isArray(graderMap)) {
      (<readonly GraderSpecificationMap[]>graderMap).forEach(gm => this.registerGraders(gm));
    }
    else {
      for (const spec in graderMap) {
        this.graderMap[spec] = realizeGrader((<GraderSpecificationMap>graderMap)[spec]!);
      }
    }
  }

  public registerExceptions(exceptionMap: ExceptionMap | readonly ExceptionMap[]) {
    if (Array.isArray(exceptionMap)) {
      (<readonly ExceptionMap[]>exceptionMap).forEach(gm => this.registerExceptions(gm));
    }
    else {
      Object.assign(this.exceptionMap, <ExceptionMap>exceptionMap);
    }
  }

  public registerException(uniqname: string, question_id: string, exception: Exception) {
    if (!this.exceptionMap[uniqname]) {
      this.exceptionMap[uniqname] = {};
    }
    this.exceptionMap[uniqname][question_id] = exception;
  }

  public gradeAll() {

    // Prepare all graders (e.g. load manual grading data)
    this.allQuestions.forEach(question => {
      let grader = this.getGrader(question);
      if (grader) {
        let grading_data = this.prepareGradingData(question, grader);
        if (grading_data) {
          grader.prepare(this.exam.exam_id, question.question_id, grading_data);
        }
      }
      else {
        console.log(`WARNING: No grader registered for question: ${question.question_id}`);
      }
    });

    // Apply any exceptions to individual questions
    this.submittedExams.forEach(
      ex => ex.assignedSections.forEach(
        s => s.assignedQuestions.forEach(
          q => this.addAppropriateExceptions(q, ex.student)
        )
      )
    );

    this.submittedExams.forEach((s, i) => {
      this.onStatus && this.onStatus(`Grading exams... (${i + 1}/${this.submittedExams.length})`);
      s.gradeAll(this.graderMap)
    });

    this.stats.recompute(this);
  }

  protected prepareGradingData(question: Question, grader: QuestionGrader) : any {
    return {
      rubric: [],
      submission_results: []
    };
  }

  public applyCurve(curve: ExamCurve) {
    assert(!this.curve, "A grader may only apply one curve.");
    asMutable(this).curve = curve;
    curve.initialize(this);
    this.submittedExams.forEach(ex => ex.isGraded() && ex.applyCurve(curve));
    curve.lock(this);
  }

  // public prepareManualGrading() {
  //   for (let qid in this.graderMap) {
  //     let question = this.questionsMap[qid];
  //     let aqs = this.getAssignedQuestions(qid);
  //     assert(question && aqs);
  //     let grader = this.graderMap[qid];
  //     grader?.prepareManualGrading && grader.isGrader(question.kind) && grader.prepareManualGrading(aqs);
  //   }
  // }

  private addAppropriateExceptions(aq: AssignedQuestion, student: StudentInfo) {
    let studentExMap = this.exceptionMap[student.uniqname];
    if (studentExMap) {
      let questionEx = studentExMap[aq.question.question_id] ?? studentExMap[aq.displayIndex];
      if (questionEx) {
        aq.addException(questionEx);
      }
    }
  }

  private writeMedia(outDir: string) {
    let mediaOutDir = path.join(outDir, this.options.frontend_media_dir);
    ExamUtils.writeExamMedia(mediaOutDir, this.exam, <Section[]>Object.values(this.sectionsMap), <Question[]>Object.values(this.questionsMap));
  }

  public writeGraderPages() {
    writeFrontendJS(`out/${this.exam.exam_id}/graded/js`, "grader-page-fitb.js");

    this.onStatus && this.onStatus(`Rendering grader pages...`);
    console.log("Rendering grader pages...");
    this.allQuestions.forEach(q => this.renderStatsToFile(q));
  }

  public writeReports() {
    const examDir = `out/${this.exam.exam_id}/graded/exams`;

    // Create output directories and clear previous contents
    mkdirSync(examDir, { recursive: true });
    del.sync(`${examDir}/*`);

    writeFrontendJS(`${examDir}/js`, "frontend-graded.js");
    this.writeMedia(`${examDir}`);

    // Write out graded exams for all, sorted by uniqname
    [...this.submittedExams]
      .sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
      .forEach((ex, i, arr) => {
        let filenameBase = this.createGradedFilenameBase(ex);
        this.onStatus && this.onStatus(`Rendering graded exam reports... (${i + 1}/${this.submittedExams.length})`);
        console.log(`${i + 1}/${arr.length} Rendering graded exam html for: ${ex.student.uniqname}...`);
        writeFileSync(`out/${this.exam.exam_id}/graded/exams/${filenameBase}.html`, this.renderer.renderAll(ex, this.options.frontend_js_path), {encoding: "utf-8"});
      });
  }

  public writeSubmissions() {
    const examDir = `out/${this.exam.exam_id}/submitted/`;

    // Create output directories and clear previous contents
    mkdirSync(examDir, { recursive: true });
    del.sync(`${examDir}/*`);

    writeFrontendJS(`${examDir}/js`, "frontend-solution.js");
    this.writeMedia(`${examDir}`);

    // Write out graded exams for all, sorted by uniqname
    [...this.submittedExams]
      .sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
      .forEach((ex, i, arr) => {
        // let filenameBase = this.createGradedFilenameBase(ex);
        let filenameBase = ex.student.uniqname + "-" + ex.uuid;
        this.onStatus && this.onStatus(`Rendering submitted exams... (${i + 1}/${this.submittedExams.length})`);
        console.log(`${i + 1}/${arr.length} Rendering submitted exam html for: ${ex.student.uniqname}...`);
        writeFileSync(`${examDir}/${filenameBase}.html`, this.submission_renderer.renderAll(ex, this.options.frontend_js_path), {encoding: "utf-8"});
      });
  }

  public writeAll() {
    this.writeScoresCsv();
    this.writeOverview();
    this.writeGraderPages();
  }

  private createGradedFilenameBase(ex: AssignedExam) {
    return ex.student.uniqname + "-" + createStudentUuid(this.options, ex.student, this.exam.exam_id + "-graded");
  }

  public writeScoresCsv() {
    mkdirSync(`out/${this.exam.exam_id}/graded/`, {recursive: true});
    let data = this.submittedExams.slice().sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
      .map(ex => {
        let student_data : {[index:string]: any} = {};
        student_data["uniqname"] = ex.student.uniqname;
        student_data["raw_total"] = ex.pointsEarned;
        if (ex.curve) {
          student_data["curved_total"] = ex.curve.adjustedScore;
        }
        ex.assignedSections.forEach(s => s.assignedQuestions.forEach(q => student_data[q.question.question_id] = q.pointsEarned));

        if (ex.curve) {
          Object.assign(student_data, ex.curve.parameters);
        }

        return student_data;
      });

    
    writeFileSync(`out/${this.exam.exam_id}/graded/scores.csv`, unparse({
      fields: [
        "uniqname",
        "raw_total",
        ...(this.curve ? ["curved_total"] : []),
        "individual_exam_mean",
        "individual_exam_stddev",
        ...this.allQuestions.map(q => q.question_id)],
      data: data
    }));
  }

  public getAllAssignedQuestionsById(question_id: string) {
    return this.assignedQuestionsById[question_id] ?? [];
  }

  private renderStatsToFile(question: Question) {

    let grader = this.getGrader(question);
    if (!grader) {
      return;
    }

    // Create output directories
    mkdirSync(`out/${this.exam.exam_id}/graded/questions/`, { recursive: true });
    let out_filename = `out/${this.exam.exam_id}/graded/questions/${question.question_id}.html`;
    // console.log(`Writing details for question ${question.id} to ${out_filename}.`);

    if (!grader || !grader.isGrader(question.kind)) {
      return;
    }

    let aqs = this.getAllAssignedQuestionsById(question.question_id);
    let statsReport = grader.renderStats(aqs);

    writeFileSync(out_filename, statsReport, "utf8");
  }

  
  public writeOverview() {

    writeFrontendJS("out/js", "overview.js");

    mkdirSync(`out/${this.exam.exam_id}/graded/`, {recursive: true});
    let out_filename = `out/${this.exam.exam_id}/graded/overview.html`;

    // Predict an overall mean based on an assumption that each
    // individual student exam scored the question mean on its questions
    let predicted_mean = this.submittedExams.length === 0 ? 0 : mean(this.submittedExams.map(
      ex => sum(ex.assignedQuestions.map(q => this.stats.questionMean(q.question.question_id) ?? NaN))
    ));

    let main_overview = `<div>
      <p>
        Out of ${this.stats.numFullyGraded} fully graded exams:<br />
        Mean: ${this.stats.mean}<br />
        Std Dev: ${this.stats.stddev}<br />
      </p>
      <p>
        Predicted Mean: ${predicted_mean}
      </p>
    </div>`


    let students_overview = this.submittedExams.slice().sort((a, b) => (b.pointsEarned ?? 0) - (a.pointsEarned ?? 0)).map(ex => {
      let score = ex.pointsEarned ?? 0;
      return `<div>${renderPointsProgressBar(score, ex.pointsPossible)} <a href="exams/${this.createGradedFilenameBase(ex)}.html">${ex.student.uniqname}</a></div>`
    }).join("");

    let questions_overview = this.allQuestions.map(question => {

      let grader = this.getGrader(question);
      let assignedQuestions = this.getAllAssignedQuestionsById(question.question_id);

      if (assignedQuestions.length === 0) {
        return "";
      }


      let gradedQuestions = assignedQuestions.filter(isGradedQuestion);

      let header: string;
      let question_overview: string;
      let avg: number | undefined;
      if (!grader) {
        header = `<b>${question.question_id}</b> (No grader registered)`;
        question_overview = "No grader for this question.";
      }
      else {
        avg = gradedQuestions.length === 0 ? 0 : average(gradedQuestions.map(aq => aq.pointsEarned));
        header = `<b>${question.question_id}</b> Details`;
        question_overview = `<div>
          ${grader?.renderOverview(gradedQuestions)}
        </div>`;
      }


      let overview_id = `question-overview-${question.question_id}`;
      return `<div class="examma-ray-question-overview">
        <div id="${overview_id}" class="card">
          <div class="card-header">
            <span ${gradedQuestions.length < assignedQuestions.length ? 'style="visibility: hidden;"' : ""}>${ICON_BOX_CHECK}</span>
            ${renderGradingProgressBar(gradedQuestions.length, assignedQuestions.length)}
            ${renderPointsProgressBar(avg ?? 0, question.pointsPossible)}
            <a class="nav-link" data-toggle="collapse" data-target="#${overview_id}-details" role="button" aria-expanded="false" aria-controls="${overview_id}-details">${header}</a>
          </div>
          <div class="collapse" id="${overview_id}-details">
            <div class="card-body">
              <div><a href="questions/${question.question_id}.html">Question Analysis Page</a></div>
              ${question.renderDescription(assignedQuestions[0].skin)}
              ${question_overview}
            </div>
          </div>
        </div>
      </div>`;
    }).join("");

    let overview = `
      ${main_overview}
      ${questions_overview}
      <div class="examma-ray-students-overview">
        ${students_overview}
      <div>
    `;

    writeFileSync(out_filename, `
      <!DOCTYPE html>
      <html>
      <meta charset="UTF-8">
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
      <script src="https://unpkg.com/@popperjs/core@2" crossorigin="anonymous"></script>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
      <script src="../../js/overview.js"></script>
      <body>
        ${overview}
      </body>
      </html>`,
      { encoding: "utf-8" }
    );
  }
}













/**
 * A mapping of question ID to grader.
 */
export type GraderMap = {
  [index: string]: QuestionGrader<any, any> | undefined;
}

/**
 * A mapping of question ID to grader specification.
 */
export type GraderSpecificationMap = {
  [index: string]: GraderSpecification | undefined;
}

/**
 * An exception including an adjusted score and an explanation
 * of why the exception was applied.
 */
 export declare type Exception = {
  adjustedScore?: number;
  pointAdjustment?: number;
  explanation: string;
};

/**
 * A mapping from (uniqname, question id) to any exceptions applied
 * for that student for that question. The question's display index
 * (e.g. "3.2") may be used in place of the question ID.
 * Only one exception may be specified per student/question pair.
 */
export type ExceptionMap = {
  [index: string]: { // uniqname
    [index: string]: // question id
    Exception | undefined
  };
}