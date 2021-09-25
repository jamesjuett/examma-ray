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
 *   "sp20_7_3_assn_op": new StandardSASGrader([
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
 * @module
 */

import { writeFileSync, mkdirSync } from 'fs';
import { TrustedExamSubmission } from './core/submissions';
import { AssignedExam, RenderMode, AssignedQuestion, AssignedSection, isGradedQuestion } from './core/assigned_exams';
import { QuestionGrader } from './core/QuestionGrader';
import { chooseQuestions, chooseSections, StudentInfo } from './core/exam_specification';
import { asMutable, assert, assertFalse, Mutable } from './core/util';
import { unparse } from 'papaparse';
import { createStudentUuid, ExamUtils, writeFrontendJS } from './ExamUtils';
import { createCompositeSkin, DEFAULT_SKIN } from './core/skins';
import del from 'del';
import { average } from 'simple-statistics';
import { renderGradingProgressBar, renderPointsProgressBar } from './core/ui_components';
import { GradedStats } from "./core/GradedStats";
import { ExamCurve } from "./core/ExamCurve";
import { Exam, Question, Section } from './core/exam_components';
import { CHOOSE_ALL } from './core/randomization';
import { UUID_Strategy } from './ExamGenerator';



export type ExamGraderOptions = {
  frontend_js_path: string,
  uuid_strategy: UUID_Strategy,
  uuidv5_namespace?: string,
};

const DEFAULT_OPTIONS = {
  frontend_js_path: "js/frontend.js",
  uuid_strategy: "plain",
};

function verifyOptions(options: Partial<ExamGraderOptions>) {
  assert(options.uuid_strategy !== "uuidv5" || options.uuidv5_namespace, "If uuidv5 filenames are selected, a uuidv5_namespace option must be specified.");
  assert(!options.uuidv5_namespace || options.uuidv5_namespace.length >= 16, "uuidv5 namespace must be at least 16 characters.");
}

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

  public constructor(exam: Exam, options: Partial<ExamGraderOptions> = {}, graders?: GraderMap | readonly GraderMap[], exceptions?: ExceptionMap | readonly ExceptionMap[]) {
    this.exam = exam;
    verifyOptions(options);
    this.options = Object.assign(DEFAULT_OPTIONS, options);

    graders && this.registerGraders(graders);
    exceptions && this.registerExceptions(exceptions);
    let ignore: StudentInfo = { uniqname: "", name: "" };

    this.allSections = exam.sections.flatMap(chooser => chooseSections(chooser, exam, ignore, CHOOSE_ALL));
    this.allSections.forEach(section => this.sectionsMap[section.section_id] = section);

    this.allQuestions = this.allSections.flatMap(s => s.questions).flatMap(chooser => chooseQuestions(chooser, exam, ignore, CHOOSE_ALL));
    this.allQuestions.forEach(question => this.questionsMap[question.question_id] = question);

    this.allQuestions.forEach(question => {
      if (!this.getGrader(question)) {
        console.log(`WARNING: No grader registered for question: ${question.question_id}`);
      }
    });

    this.stats = new GradedStats(this);
  }

  public getGrader(question: Question) {
    return this.graderMap[question.question_id] ?? question.defaultGrader;
  }

  public addSubmission(answers: TrustedExamSubmission) {
    let ex = this.createExamFromSubmission(answers);
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
      `data/${this.exam.exam_id}/submissions/`,
      `data/${this.exam.exam_id}/trusted-submissions/`));
  }

  private createExamFromSubmission(submission: TrustedExamSubmission) {
    let student = submission.student;
    return new AssignedExam(
      submission.exam_id,
      this.exam,
      student,
      submission.sections.flatMap((s, s_i) => {
        let section = this.sectionsMap[s.section_id] ?? assertFalse(`No matching section found id: ${s.section_id}`);
        let sectionSkins = [
          section.skin.component_kind !== "chooser"
            ? section.skin
            : section.skin.getById(s.skin_id) ?? assertFalse(`No matching skin found for id: ${s.skin_id}`)
        ];
        return sectionSkins.map(sectionSkin => new AssignedSection(
          s.uuid,
          section,
          s_i,
          sectionSkin,
          s.questions.flatMap((q, q_i) => {
            let question = this.questionsMap[q.question_id] ?? assertFalse(`No matching question found id: ${q.question_id}`);
            let questionSkins = [
              question.skin.component_kind !== "chooser"
                ? question.skin
                : question.skin.getById(q.skin_id) ?? assertFalse(`No matching skin found for id: ${s.skin_id}`)
            ].map(
              qSkin => createCompositeSkin(sectionSkin, qSkin)
            );
            return questionSkins.map(questionSkin => new AssignedQuestion(
              q.uuid,
              this.exam,
              submission.student,
              question,
              questionSkin,
              s_i,
              q_i,
              q.response
            )); 
          })
        ));
      }),
      false
    );
  }

  public registerGraders(graderMap: GraderMap | readonly GraderMap[]) {
    if (Array.isArray(graderMap)) {
      (<readonly GraderMap[]>graderMap).forEach(gm => this.registerGraders(gm));
    }
    else {
      for(let question_id in <GraderMap>graderMap) {
        (<GraderMap>graderMap)[question_id]!.prepare(this.exam.exam_id, question_id);
      }
      Object.assign(this.graderMap, <GraderMap>graderMap);
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

    // Apply any exceptions to individual questions
    this.submittedExams.forEach(
      ex => ex.assignedSections.forEach(
        s => s.assignedQuestions.forEach(
          q => this.addAppropriateExceptions(q, ex.student)
        )
      )
    );

    this.submittedExams.forEach(s => s.gradeAll(this.graderMap));

    (<Mutable<this>>this).stats = new GradedStats(this);
  }

  public applyCurve(curve: ExamCurve) {
    this.submittedExams.forEach(ex => ex.isGraded() && ex.applyCurve(curve));
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
    let questionEx = studentExMap && studentExMap[aq.question.question_id];
    if (questionEx) {
      aq.addException(questionEx);
    }
  }



  public writeStats() {
    writeFrontendJS("out/js", "stats-fitb.js");

    console.log("Rendering question stats files...");
    this.allQuestions.forEach(q => this.renderStatsToFile(q));
  }

  public writeReports() {
    const examDir = `out/${this.exam.exam_id}/graded/exams`;

    // Create output directories and clear previous contents
    mkdirSync(examDir, { recursive: true });
    del.sync(`${examDir}/*`);

    writeFrontendJS(`${examDir}/js`, "frontend-graded.js");

    // Write out graded exams for all, sorted by uniqname
    [...this.submittedExams]
      .sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
      .forEach((ex, i, arr) => {
        let filenameBase = this.createGradedFilenameBase(ex);
        console.log(`${i + 1}/${arr.length} Rendering graded exam html for: ${ex.student.uniqname}...`);
        writeFileSync(`out/${this.exam.exam_id}/graded/exams/${filenameBase}.html`, ex.renderAll(RenderMode.GRADED, this.options.frontend_js_path), {encoding: "utf-8"});
      });
  }

  public writeAll() {

    this.writeStats();
    this.writeOverview();
    this.writeScoresCsv();
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
        student_data["total"] = ex.pointsEarned;
        ex.assignedSections.forEach(s => s.assignedQuestions.forEach(q => student_data[q.question.question_id] = q.pointsEarned));

        if (ex.curve) {
          Object.assign(student_data, ex.curve.parameters);
        }

        return student_data;
      });

    
    writeFileSync(`out/${this.exam.exam_id}/graded/scores.csv`, unparse({
      fields: ["uniqname", "total", "individual_exam_mean", "individual_exam_stddev", ...this.allQuestions.map(q => q.question_id)],
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

    let header = `
      <div style="margin: 2em">
          ${question.question_id}
      </div>`;

    this.writeStatsFile(out_filename, `
      ${header}
      ${statsReport}
    `);
  }

  private writeStatsFile(filename: string, body: string) {
    writeFileSync(filename, `
      <!DOCTYPE html>
      <html>
      <meta charset="UTF-8">
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
      <script src="https://unpkg.com/@popperjs/core@2" crossorigin="anonymous"></script>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
      <script src="../../../js/stats-fitb.js"></script>
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
      </html>`,
      { encoding: "utf-8" }
    );
  }

  
  public writeOverview() {

    writeFrontendJS("out/js", "overview.js");

    mkdirSync(`out/${this.exam.exam_id}/graded/`, {recursive: true});
    let out_filename = `out/${this.exam.exam_id}/graded/overview.html`;

    let main_overview = `<div>
      Out of ${this.stats.numFullyGraded} fully graded exams:
      <div>Mean: ${this.stats.mean}</div>
      <div>Std Dev: ${this.stats.stddev}</div>
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
        header = `<h4>${question.question_id}</h4>`;
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
      <div class="examma-ray-students-overview">
        ${students_overview}
      <div>
      ${questions_overview}
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
  [index: string]: QuestionGrader<any> | undefined;
}

/**
 * An exception including an adjusted score and an explanation
 * of why the exception was applied.
 */
export type Exception = {
  adjustedScore: number,
  explanation: string
}

/**
 * A mapping from (uniqname, question id) to any exceptions applied
 * for that student for that question. Only one exception may be
 * specified per student/question pair.
 */
export type ExceptionMap = {
  [index: string]: { // uniqname
    [index: string]: // question id
    Exception | undefined
  };
}