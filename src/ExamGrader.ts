/**
 * ## Grading Exams
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

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { TrustedExamSubmission } from './submissions';
import { Section, Question, Exam, AssignedExam, StudentInfo, RenderMode, AssignedQuestion, AssignedSection } from './exams';
import { createQuestionSkinRandomizer, createSectionSkinRandomizer } from "./randomization";
import { QuestionGrader } from './QuestionGrader';
import { chooseQuestions, chooseSections, CHOOSE_ALL } from './specification';
import { asMutable, assert, assertFalse } from './util';
import { unparse } from 'papaparse';
import { ExamUtils } from './ExamUtils';
import { createCompositeSkin } from './skins';
import del from 'del';
import { chunk } from 'simple-statistics';
import { GradingAssignmentSpecification } from "./grading/common";
import { stringify_response } from './response/responses';



export class ExamGrader {

  public readonly exam: Exam;
  public readonly submittedExams: AssignedExam[] = [];
  public readonly submittedExamsByUniqname: { [index: string]: AssignedExam | undefined; } = {};

  public readonly allSections: readonly Section[];
  public readonly allQuestions: readonly Question[];
  public readonly sectionsMap: { [index: string]: Section | undefined } = {};
  public readonly questionsMap: { [index: string]: Question | undefined } = {};

  public readonly allAssignedQuestions: readonly AssignedQuestion[] = [];
  public readonly assignedQuestionsMap: {
    [index: string]: readonly AssignedQuestion[] | undefined;
  } = {};

  public readonly graderMap: GraderMap = {};
  public readonly exceptionMap: ExceptionMap = {};

  public constructor(exam: Exam, graders?: GraderMap | readonly GraderMap[], exceptions?: ExceptionMap | readonly ExceptionMap[]) {
    this.exam = exam;
    graders && this.registerGraders(graders);
    exceptions && this.registerExceptions(exceptions);
    let ignore: StudentInfo = { uniqname: "", name: "" };

    this.allSections = exam.sections.flatMap(chooser => chooseSections(chooser, exam, ignore, CHOOSE_ALL));
    this.allSections.forEach(section => this.sectionsMap[section.section_id] = section);

    this.allQuestions = this.allSections.flatMap(s => s.questions).flatMap(chooser => chooseQuestions(chooser, exam, ignore, CHOOSE_ALL));
    this.allQuestions.forEach(question => this.questionsMap[question.question_id] = question);
  }

  public addSubmission(answers: TrustedExamSubmission) {
    let ex = this.createExamFromSubmission(answers);
    this.submittedExams.push(ex);
    ex.assignedSections.forEach(s => s.assignedQuestions.forEach(aq => {
      asMutable(this.allAssignedQuestions).push(aq);
      if (!this.assignedQuestionsMap[aq.question.question_id]) {
        this.assignedQuestionsMap[aq.question.question_id] = [aq];
      }
      else {
        asMutable(this.assignedQuestionsMap[aq.question.question_id]!).push(aq)
      }
    }));
  }

  public addSubmissions(answers: readonly TrustedExamSubmission[]) {
    answers.forEach(a => this.addSubmission(a));
  }

  public loadAllSubmissions() {
    this.addSubmissions(ExamUtils.loadTrustedSubmissions(
      `data/${this.exam.exam_id}/manifests/`,
      `data/${this.exam.exam_id}/submissions/`))
  }

  private createExamFromSubmission(submission: TrustedExamSubmission) {
    let student = submission.student;
    return new AssignedExam(
      submission.exam_id,
      this.exam,
      student,
      submission.sections.flatMap((s, s_i) => {
        let section = this.sectionsMap[s.section_id] ?? assertFalse();
        let sectionSkins = section.skins.generate(this.exam, student, createSectionSkinRandomizer(student, this.exam, section));
        return sectionSkins.map(sectionSkin => new AssignedSection(
          s.uuid,
          section,
          s_i,
          sectionSkin,
          s.questions.flatMap((q, q_i) => {
            let question = this.questionsMap[q.question_id] ?? assertFalse();
            let questionSkins = question.skins.generate(this.exam, student, createQuestionSkinRandomizer(student, this.exam, question))
              .map(qSkin => createCompositeSkin(sectionSkin, qSkin));
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
      })
    );
  }

  public registerGraders(graderMap: GraderMap | readonly GraderMap[]) {
    if (Array.isArray(graderMap)) {
      (<readonly GraderMap[]>graderMap).forEach(gm => this.registerGraders(gm));
    }
    else {
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

    this.submittedExams.forEach(s => s.gradeAll(this.graderMap));

    // Apply any exceptions to individual questions
    this.submittedExams.forEach(
      ex => ex.assignedSections.forEach(
        s => s.assignedQuestions.forEach(
          q => this.addAppropriateExceptions(q, ex.student)
        )
      )
    );
  }

  public prepareManualGrading() {
    for (let qid in this.graderMap) {
      let question = this.questionsMap[qid];
      let aqs = this.getAssignedQuestions(qid);
      assert(question && aqs);
      let grader = this.graderMap[qid];
      grader?.prepareManualGrading && grader.isGrader(question.kind) && grader.prepareManualGrading(aqs);
    }
  }

  private addAppropriateExceptions(aq: AssignedQuestion, student: StudentInfo) {
    let studentExMap = this.exceptionMap[student.uniqname];
    let questionEx = studentExMap && studentExMap[aq.question.question_id];
    if (questionEx) {
      aq.addException(questionEx);
    }
  }



  public writeAll() {
    const examDir = `out/${this.exam.exam_id}/graded/exams`;

    // Create output directories and clear previous contents
    mkdirSync(examDir, { recursive: true });
    del.sync(`${examDir}/*`);

    // Write out graded exams for all, sorted by uniqname
    [...this.submittedExams]
      .sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
      .forEach((ex, i, arr) => {
        console.log(`${i + 1}/${arr.length} Rendering graded exam html for: ${ex.student.uniqname}...`);
        writeFileSync(`out/${this.exam.exam_id}/graded/exams/${ex.student.uniqname}.html`, ex.renderAll(RenderMode.GRADED), {encoding: "utf-8"});
      });

    console.log("Rendering question stats files...");
    this.allQuestions.forEach(q => this.renderStatsToFile(q));
  }

  private writeScoresCsv() {
    mkdirSync("out/${this.exam.id}/graded/", {recursive: true});
    let data = this.submittedExams.slice().sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
      .map(ex => {
        let student_data : {[index:string]: any} = {};
        student_data["uniqname"] = ex.student.uniqname;
        student_data["total"] = ex.pointsEarned;
        ex.assignedSections.forEach(s => s.assignedQuestions.forEach(q => student_data[q.question.question_id] = q.pointsEarned));
        return student_data;
      });

    
    writeFileSync(`out/${this.exam.exam_id}/graded/scores.csv`, unparse({
      fields: this.allQuestions.map(q => q.question_id),
      data: data
    }));
  }

  private getAssignedQuestions(question_id: string) {
    return this.assignedQuestionsMap[question_id] ?? [];
  }

  private renderStatsToFile(question: Question) {

    let grader = this.graderMap[question.question_id];
    if (!grader) {
      return;
    }

    // Create output directories
    mkdirSync(`data/${this.exam.exam_id}/graded/questions/`, { recursive: true });
    let out_filename = `data/${this.exam.exam_id}/graded/questions/${question.question_id}.html`;
    // console.log(`Writing details for question ${question.id} to ${out_filename}.`);

    if (!grader || !grader.isGrader(question.kind)) {
      return;
    }

    let aqs = this.getAssignedQuestions(question.question_id);
    let statsReport = grader.renderStats(aqs);

    let header = `
      <div style="margin: 2em">
          ${question.question_id}
      </div>`;

    writeStatsFile(this.exam, out_filename, `
      ${header}
      ${statsReport}
    `);
  }
}



export function writeStatsFile(exam: Exam, filename: string, body: string) {
  writeFileSync(filename, `
      <!DOCTYPE html>
    <html>
    <meta charset="UTF-8">
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/@popperjs/core@2" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
    <script src="${exam.frontendGradedJsPath}"></script>
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
      


    </style>
    <body>
      ${body}


    </body>
    </html>`, { encoding: "utf-8" });
}






// export function renderOverview(exam: Exam) {
//   mkdirSync("data/", {recursive: true});
//   let out_filename = `data/overview.html`;

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