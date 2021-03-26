import { writeFileSync, mkdirSync } from 'fs';
import json_stable_stringify from "json-stable-stringify";
import { TrustedExamAnswers } from './common';
import { Section, Question, Exam, AssignedExam, StudentInfo, createBlankAnswers, writeAGFile, RenderMode, AssignedQuestion, AssignedSection, CHOOSE_ALL, renderQuestion, Randomizer } from './exams';
import { Grader } from './graders/common';
import { ResponseKind } from './response/common';
import { assert, assertFalse } from './util';

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

export class ExamGrader {

  public readonly exam: Exam;
  public readonly submittedExams: AssignedExam[] = [];
  public readonly submittedExamsByUniqname: { [index: string]: AssignedExam | undefined; } = {};

  public readonly allSections: readonly Section[];
  public readonly allQuestions: readonly Question[];
  public readonly sectionsMap: { [index: string]: Section | undefined } = {};
  public readonly questionsMap: { [index: string]: Question | undefined } = {};

  public readonly graderMap: GraderMap;
  public readonly exceptionMap: ExceptionMap;

  public constructor(exam: Exam, graders: GraderMap = {}, exceptions: ExceptionMap = {}) {
    this.exam = exam;
    this.graderMap = graders;
    this.exceptionMap = exceptions;
    let ignore: StudentInfo = { uniqname: "", name: "" };

    this.allSections = exam.sections.flatMap(chooser =>
      typeof chooser === "function" ? chooser(this.exam, ignore, CHOOSE_ALL) :
        chooser instanceof Section ? chooser :
          new Section(chooser)
    );
    this.allSections.forEach(section => this.sectionsMap[section.id] = section);

    this.allQuestions = this.allSections.flatMap(s => s.questions).flatMap(chooser =>
      typeof chooser === "function" ? chooser(exam, ignore, CHOOSE_ALL) :
        chooser instanceof Question ? [chooser] :
          new Question(chooser)
    );
    this.allQuestions.forEach(question => this.questionsMap[question.id] = question);
  }

  public addSubmission(answers: TrustedExamAnswers) {
    this.submittedExams.push(this.createExamFromSubmission(answers));
  }


  private createExamFromSubmission(submission: TrustedExamAnswers) {
    let student = submission.student;
    return new AssignedExam(
      this.exam,
      student,
      submission.sections.map((s, s_i) => {
        let section = this.sectionsMap[s.id] ?? assertFalse();
        let sSkin = section.skins?.generate(this.exam, student, new Randomizer(student.uniqname + "_" + this.exam.id + "_" + section.id));
        return new AssignedSection(
          section,
          s_i,
          sSkin,
          s.questions.map((q, q_i) => {
            let question = this.questionsMap[q.id] ?? assertFalse();
            let qSkin = question.skins?.generate(this.exam, student, new Randomizer(student.uniqname + "_" + this.exam.id + "_" + question.id));
            qSkin ??= sSkin;
            return new AssignedQuestion(
              this.exam,
              submission.student,
              question,
              qSkin,
              s_i,
              q_i,
              q.response
            ); 
          })
        );
      })
    );
  }

  public registerGraders(graderMap: GraderMap) {
    Object.assign(this.graderMap, graderMap);
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

  private addAppropriateExceptions(aq: AssignedQuestion, student: StudentInfo) {
    let studentExMap = this.exceptionMap[student.uniqname];
    let questionEx = studentExMap && studentExMap[aq.question.id];
    if (questionEx) {
      aq.addException(questionEx);
    }
  }



  public writeAll() {

    // Create output directories
    mkdirSync(`out/${this.exam.id}/graded/students/`, { recursive: true });

    // Write out manifests and exams for all, sorted by uniqname
    [...this.submittedExams]
      .sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
      .forEach((ex, i, arr) => {
        console.log(`${i + 1}/${arr.length} Rendering graded exam html for: ${ex.student.uniqname}...`);
        writeAGFile(RenderMode.GRADED, ex, `out/${this.exam.id}/graded/students/${ex.student.uniqname}.html`, ex.render(RenderMode.GRADED));
      });

    console.log("Rendering question stats files...");
    this.allQuestions.forEach(q => this.renderStatsToFile(q));
  }

  private getSubmissionsForQuestion<QT extends ResponseKind>(question: Question<QT>) {
    return this.submittedExams.flatMap(
      ex => ex.assignedSections.flatMap(
        s => s.assignedQuestions.filter(aq => aq.question.id === question.id).map(aq => aq.submission)
      )
    );
  }

  private renderStatsToFile(question: Question) {

    let grader = this.graderMap[question.id];
    if (!grader) {
      return;
    }

    // Create output directories
    mkdirSync(`out/${this.exam.id}/graded/questions/`, { recursive: true });
    let out_filename = `out/${this.exam.id}/graded/questions/${question.id}.html`;
    // console.log(`Writing details for question ${question.id} to ${out_filename}.`);

    if (!grader) {
      return;
    }

    let statsReport = grader.renderStats(question,this.getSubmissionsForQuestion(question));

    let header = `<div style="margin: 2em">${renderQuestion(question.id, "N/A", "", "", "", "")}</div>`

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