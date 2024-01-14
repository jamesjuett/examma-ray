import { sum } from 'simple-statistics';
import { Exception, GraderMap } from '../ExamGrader';
import { GradingResult, QuestionGrader } from '../graders/QuestionGrader';
import { ResponseKind } from '../response/common';
import { SubmissionType, parse_submission } from '../response/responses';
import { AppliedCurve, ExamCurve } from './ExamCurve';
import { Exam, Question, Section } from './exam_components';
import { StudentInfo, isValidID } from './exam_specification';
import { ExamComponentSkin, createCompositeSkin } from './skins';
import { ExamManifest, OpaqueExamManifest, TransparentExamManifest, TrustedExamSubmission } from './submissions';
import { maxPrecisionString } from "./ui_components";
import { Mutable, asMutable, assert, assertFalse } from './util';




export class AssignedQuestion<QT extends ResponseKind = ResponseKind> {

  public readonly gradedBy?: QuestionGrader<QT>
  public readonly gradingResult?: GradingResult;
  public readonly exception?: Exception;

  public readonly submission: SubmissionType<QT>;

  public readonly displayIndex;

  public readonly html_description: string;
  public readonly html_postscript: string;

  public constructor(
    public readonly uuid: string,
    public readonly exam: Exam,
    public readonly student: StudentInfo,
    public readonly question: Question<QT>,
    public readonly skin: ExamComponentSkin,
    public readonly sectionIndex : number,
    public readonly partIndex : number,
    public readonly rawSubmission: string,
  ) {
    this.displayIndex = (sectionIndex+1) + "." + (partIndex+1);
    this.submission = parse_submission(question.kind, rawSubmission);

    this.html_description = question.renderDescription(this.skin);
    this.html_postscript = question.renderPostscript(this.skin);
  }

  public setRawSubmission(raw_submission: string) {
    (<Mutable<this>>this).rawSubmission = raw_submission;
    (<Mutable<this>>this).submission = parse_submission(this.question.kind, raw_submission);
    delete (<Mutable<this>>this).gradedBy;
    delete (<Mutable<this>>this).gradingResult;
  }

  public grade(grader: QuestionGrader<QT>) {
    (<Mutable<this>>this).gradingResult = grader.grade(this);
    if (this.gradingResult) {
      (<Mutable<this>>this).gradedBy = grader;
    }
  }

  public addException(exception: Exception) {
    (<Mutable<this>>this).exception = exception;
  }

  public get pointsEarned() : number | undefined {
    if (this.exception?.adjustedScore) {
      return this.exception.adjustedScore;
    }
    
    if (!this.isGraded()) {
      return undefined;
    }

    let points = this.gradedBy.pointsEarned(this.gradingResult);
    if (this.exception?.pointAdjustment) {
      points += this.exception.pointAdjustment;
    }

    return Math.max(0, Math.min(this.question.pointsPossible, points));
  }

  public get pointsEarnedWithoutExceptions() : number | undefined {
    return this.isGraded()
        ? Math.max(0, Math.min(this.question.pointsPossible, this.gradedBy.pointsEarned(this.gradingResult)))
        : undefined;
  }

  public isGraded() : this is GradedQuestion<QT> {
    return !!this.gradingResult;
  }
  
  public wasGradedBy<GR extends GradingResult>(grader: QuestionGrader<QT, GR>) : this is GradedQuestion<QT,GR> {
    return this.gradedBy === grader;
  };

}

export function wereGradedBy<QT extends ResponseKind, GR extends GradingResult>(
  questions: readonly AssignedQuestion<QT>[],
  grader: QuestionGrader<QT, GR>) : questions is readonly GradedQuestion<QT, GR>[]
{
  return questions.every(q => q.wasGradedBy(grader));
}

export interface GradedQuestion<QT extends ResponseKind, GR extends GradingResult = GradingResult> extends AssignedQuestion<QT> {
  readonly pointsEarned: number;
  readonly pointsEarnedWithoutExceptions: number;
  readonly gradedBy: QuestionGrader<QT>;
  readonly gradingResult: GR;
}


export function areAllGradedQuestions<QT extends ResponseKind>(exams: AssignedQuestion[]) : exams is GradedQuestion<QT>[];
export function areAllGradedQuestions<QT extends ResponseKind>(exams: readonly AssignedQuestion[]) : exams is readonly GradedQuestion<QT>[];
export function areAllGradedQuestions<QT extends ResponseKind>(exams: readonly AssignedQuestion[]) : exams is readonly GradedQuestion<QT>[] {
  return exams.every(ex => ex.isGraded());
}

export function isGradedQuestion<QT extends ResponseKind>(aq: AssignedQuestion<QT>) : aq is GradedQuestion<QT> {
  return aq.isGraded();
} 








export class AssignedSection {

  public readonly displayIndex: string;

  public readonly pointsPossible: number;
  public readonly pointsEarned?: number;

  private _isFullyGraded: boolean = false;
  
  public readonly html_description: string;
  public readonly html_reference?: string;

  public constructor(
    public readonly uuid: string,
    public readonly section: Section, 
    public readonly sectionIndex : number,
    public readonly skin: ExamComponentSkin,
    public readonly assignedQuestions: readonly AssignedQuestion[])
  {
    this.displayIndex = "" + (sectionIndex+1);
    this.pointsPossible = assignedQuestions.reduce((p, q) => p + q.question.pointsPossible, 0);

    this.html_description = section.renderDescription(this.skin);
    this.html_reference = section.renderReference(this.skin);
  }

  public gradeAllQuestions(ex: AssignedExam, graders: GraderMap) {
    this.assignedQuestions.forEach(aq => {
      let grader = graders[aq.question.question_id] ?? aq.question.defaultGrader;
      if (grader) {
        // console.log(`Grading ${aq.question.question_id}`);
        assert(grader.isGrader(aq.question.kind), `Grader ${grader} cannot be used for question ${aq.displayIndex}, which has type "${aq.question.kind}".`);
        aq.grade(grader);
      }
      else {
        // console.log(`No grader found for ${aq.question.question_id}`);
      }
    });
    
    // Only assign a total points earned if all questions have been graded
    if (areAllGradedQuestions(this.assignedQuestions)) {
      this._isFullyGraded = true;
      asMutable(this).pointsEarned = sum(this.assignedQuestions.map(aq => aq.pointsEarned));
    }
  }
  
  public isGraded() : this is GradedSection {
    return this._isFullyGraded;
  }
}

export interface GradedSection extends AssignedSection {
  readonly pointsEarned: number;
}

export function areAllGradedSections(sections: AssignedSection[]) : sections is GradedSection[];
export function areAllGradedSections(sections: readonly AssignedSection[]) : sections is readonly GradedSection[];
export function areAllGradedSections(sections: readonly AssignedSection[]) : sections is readonly GradedSection[] {
  return sections.every(s => s.isGraded());
}

export class AssignedExam {

  public readonly uuid: string;
  public readonly exam: Exam;
  public readonly student: StudentInfo;

  public readonly pointsPossible: number;
  public readonly pointsEarned?: number;
  private _isFullyGraded: boolean = false;

  public readonly curve?: AppliedCurve;

  private assignedQuestionById: {
    [index: string]: AssignedQuestion | undefined;
  } = {};

  public readonly assignedSections: readonly AssignedSection[];
  public readonly assignedQuestions: readonly AssignedQuestion[];

  public constructor(
    uuid: string,
    exam: Exam,
    student: StudentInfo,
    assignedSections: readonly AssignedSection[],
    allowDuplicates: boolean
  ) {
    this.uuid = uuid;
    this.exam = exam;
    this.student = student;
    assert(isValidID(student.uniqname), `Invalid student uniqname: ${student.uniqname}`);
    this.assignedSections = assignedSections;
    this.assignedQuestions = assignedSections.flatMap(s => s.assignedQuestions);
    this.assignedQuestions.forEach(q => this.assignedQuestionById[q.question.question_id] = q);
    
    this.pointsPossible = assignedSections.reduce((p, s) => p + s.pointsPossible, 0);

    if (!allowDuplicates) {
      let sectionIds = assignedSections.map(s => s.section.section_id);
      assert(new Set(sectionIds).size === sectionIds.length, `This exam contains a duplicate section. Section IDs are:\n  ${sectionIds.sort().join("\n  ")}`);
      let questionIds = assignedSections.flatMap(s => s.assignedQuestions.map(q => q.question.question_id));
      assert(new Set(questionIds).size === questionIds.length, `This exam contains a duplicate question. Question IDs are:\n  ${questionIds.sort().join("\n  ")}`);
    }
  }

  public static createFromSubmission(exam: Exam, submission: TrustedExamSubmission) {
    let student = submission.student;
    return new AssignedExam(
      submission.exam_id,
      exam,
      student,
      submission.sections.flatMap((s, s_i) => {
        let section = exam.getSectionById(s.section_id) ?? assertFalse(`No matching section found id: ${s.section_id}`);
        let sectionSkins = [
          section.skin.component_kind !== "chooser"
            ? section.skin
            : section.skin.all_choices.find(skin => skin.skin_id === s.skin_id) ?? assertFalse(`No matching skin found for id: ${s.skin_id}`)
        ];
        return sectionSkins.map(sectionSkin => new AssignedSection(
          s.uuid,
          section,
          s_i,
          sectionSkin,
          s.questions.flatMap((q, q_i) => {
            let question = exam.getQuestionById(q.question_id) ?? assertFalse(`No matching question found id: ${q.question_id}`);
            let questionSkins = [
              question.skin.component_kind !== "chooser"
                ? question.skin
                : question.skin.all_choices.find(skin => skin.skin_id === q.skin_id) ?? assertFalse(`No matching skin found for id: ${s.skin_id}`)
            ].map(
              qSkin => createCompositeSkin(sectionSkin, qSkin)
            );
            return questionSkins.map(questionSkin => new AssignedQuestion(
              q.uuid,
              exam,
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

  public getAssignedQuestionById(question_id: string) {
    return this.assignedQuestionById[question_id];
  }

  public gradeAll(graders: GraderMap) {
    // console.log(`Grading exam for: ${this.student.uniqname}...`);
    this.assignedSections.forEach(s => s.gradeAllQuestions(this, graders));
    asMutable(this).pointsEarned = <number>this.assignedSections.reduce((prev, s) => prev + s.pointsEarned!, 0);
    this._isFullyGraded = areAllGradedSections(this.assignedSections);
  }
  
  public isGraded() : this is GradedExam {
    return this._isFullyGraded;
  }

  public applyCurve(this: GradedExam, curve: ExamCurve) {
    (<Mutable<GradedExam>>this).curve = curve.applyTo(this);
  }

  public renderGrade() : string {
    return this.isGraded() ?
      maxPrecisionString(this.curve?.adjustedScore ?? this.pointsEarned, 2) + "/" + this.pointsPossible :
      "?/" + this.pointsPossible;
  }

  public createManifest() : TransparentExamManifest {
    return {
      exam_id: this.exam.exam_id,
      uuid: this.uuid,
      student: this.student,
      timestamp: Date.now(),
      trusted: true,
      transparent: true,
      saverId: 0,
      sections: this.assignedSections.map(s => ({
        section_id: s.section.section_id,
        skin_id: s.skin.non_composite_skin_id ?? s.skin.skin_id,
        uuid: s.uuid,
        display_index: s.displayIndex,
        questions: s.assignedQuestions.map(q => ({
          question_id: q.question.question_id,
          skin_id: q.skin.non_composite_skin_id ?? q.skin.skin_id,
          uuid: q.uuid,
          display_index: q.displayIndex,
          kind: q.question.kind,
        }))
      }))
    };
  }


}

export function areAllGradedExams(exams: AssignedExam[]) : exams is GradedExam[];
export function areAllGradedExams(exams: readonly AssignedExam[]) : exams is readonly GradedExam[];
export function areAllGradedExams(exams: readonly AssignedExam[]) : exams is readonly GradedExam[] {
  return exams.every(ex => ex.isGraded());
}

export interface GradedExam extends AssignedExam {
  readonly pointsEarned: number;
}





// <script>
//       $(function() {
//         $('button.examma-ray-blank-saver').on("click", function() {
//           let blank_num = $(this).data("blank-num");
//           let checked = $("input[type=checkbox]:checked").filter(function() {
//             return $(this).data("blank-num") === blank_num;
//           }).map(function() {
//             return '"'+$(this).data("blank-submission").replace('"','\\\\"')+'"';
//           }).get().join(",\\n");
//           $(".checked-submissions-content").html(he.encode(checked));
//           $(".checked-submissions-modal").modal("show")
//         })
//       });

//     </script>

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
