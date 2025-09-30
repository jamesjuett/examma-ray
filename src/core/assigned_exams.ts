import { sum } from 'simple-statistics';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import type { Exception, GraderMap } from '../ExamGrader';
import { GradingResult, QuestionGrader } from '../graders/QuestionGrader';
import { ResponseKind } from '../response/common';
import { BLANK_SUBMISSION, ValidSubmission } from '../response/responses';
import { parse_submission, validate_submission } from "../response/handlers";
import { AppliedCurve, ExamCurve } from './ExamCurve';
import { Exam, Question, Section } from './exam_components';
import { StudentInfo, chooseQuestions, chooseSections, chooseSkins, isValidID, realizeQuestions, realizeSections } from './exam_specification';
import { Randomizer, createQuestionChoiceRandomizer, createQuestionSkinRandomizer, createSectionChoiceRandomizer, createSectionSkinRandomizer } from './randomization';
import { ExamComponentSkin, createCompositeSkin } from './skins';
import { ExamManifest, questionAnswerHasResponse, TransparentExamManifest, TrustedExamSubmission } from './submissions';
import { maxPrecisionString } from "./ui_components";
import { Mutable, asMutable, assert, assertFalse, assertNever } from './util';

export type UUID_Strategy = "plain" | "uuidv4" | "uuidv5";

export type UUID_Options = {
  strategy: "uuidv5",
  v5_namespace: string,
} | {
  strategy: Exclude<UUID_Strategy, "uuidv5">,
};

/**
 * Takes an ID for an exam, section, or question and creates a uuid
 * for a particular student's instance of that entity. The uuid is
 * created based on the policy specified in the `ExamGenerator`'s
 * options when it is created, which may depend on the provided
 * student uniqname.
 * @param uniqname 
 * @param id 
 * @returns 
 */
export function createStudentUuid(options: UUID_Options, uniqname: string, id: string) {
  if(options.strategy === "plain") {
    return uniqname + "-" + id;
  }
  else if (options.strategy === "uuidv4") {
    return uuidv4();
  }
  else if (options.strategy === "uuidv5") {
    return uuidv5(uniqname + "-" + id, options.v5_namespace!);
  }
  else {
    assertNever(options.strategy);
  }
}

export function createStudentExamUuid(options: UUID_Options, uniqname: string, exam_id: string) {
  return createStudentUuid(options, uniqname, exam_id);
}

export function createStudentSectionUuid(options: UUID_Options, uniqname: string, exam_id: string, section_id: string) {
  return createStudentUuid(options, uniqname, exam_id + "-s-" + section_id);
}

export function createStudentQuestionUuid(options: UUID_Options, uniqname: string, exam_id: string, question_id: string) {
  return createStudentUuid(options, uniqname, exam_id + "-q-" + question_id);
}

export class AssignedQuestion<QT extends ResponseKind = ResponseKind> {

  public readonly gradedBy?: QuestionGrader<QT>
  public readonly gradingResult?: GradingResult;
  public readonly exception?: Exception;

  public readonly submission: ValidSubmission<QT>;

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
    public readonly rawSubmission: string | undefined,
  ) {
    this.displayIndex = (sectionIndex+1) + "." + (partIndex+1);

    this.submission = BLANK_SUBMISSION();
    if (rawSubmission !== undefined) {
      this.setRawSubmission(rawSubmission);
    }

    this.html_description = question.renderDescription(this.skin);
    this.html_postscript = question.renderPostscript(this.skin);
  }

  public setRawSubmission(raw_submission: string) {
    const parsed = parse_submission(this.question.kind, raw_submission);
    if (parsed.validity === "malformed") {
      throw new Error(`Malformed submission for question ${this.question.question_id}`);
    }
    const sub = validate_submission(this.question.response, parsed);
    if (sub.validity === "invalid") {
      throw new Error(`Invalid submission for question ${this.question.question_id}`);
    }
    (<Mutable<this>>this).rawSubmission = raw_submission;
    (<Mutable<this>>this).submission = sub;
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
  
  public isKind<RK extends QT>(kind: RK) : this is AssignedQuestion<RK> {
    return this.question.kind === kind;
  }

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

  public static createFromManifest(exam: Exam, manifest: TransparentExamManifest) {
    return this.createFromSubmission_impl(exam, manifest);
  }

  public static createFromSubmission(exam: Exam, submission: TrustedExamSubmission) {
    return this.createFromSubmission_impl(exam, submission);
  }

  private static createFromSubmission_impl(exam: Exam, submission: TransparentExamManifest | TrustedExamSubmission) {
    let student = submission.student;
    return new AssignedExam(
      submission.uuid,
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
              questionAnswerHasResponse(q) ? q.response : undefined
            ));
          })
        ));
      }),
      false
    );
  }

  public static createRandomized(
    exam: Exam, student: StudentInfo,
    uuid_options: UUID_Options, seed: string,
    allow_duplicates: boolean = false,
    rand: Randomizer = createSectionChoiceRandomizer(seed, exam)
  ) {
    let ae = new AssignedExam(
      createStudentUuid(uuid_options, student.uniqname, exam.exam_id),
      exam,
      student,
      exam.sections
        .flatMap(chooser => realizeSections(chooseSections(chooser, exam, student, rand)))
        .flatMap((s, sectionIndex) => this.createRandomizedSection(exam, s, student, sectionIndex, uuid_options, seed, allow_duplicates)),
      allow_duplicates
    );

    return ae;
  }

  private static createRandomizedSection(
    exam: Exam, section: Section, student: StudentInfo, sectionIndex: number,
    uuid_options: UUID_Options, seed: string, allow_duplicates: boolean = false,
    rand: Randomizer = createQuestionChoiceRandomizer(seed, exam, section),
    skinRand: Randomizer = createSectionSkinRandomizer(seed, exam, section)
  ) {
    let sectionSkins = chooseSkins(section.skin, exam, student, skinRand);
    assert(allow_duplicates || sectionSkins.length === 1, "Generating multiple skins per section is only allowed if an exam allows duplicate sections.")
    return sectionSkins.map(sectionSkin => new AssignedSection(
      createStudentUuid(uuid_options, student.uniqname, exam.exam_id + "-s-" + section.section_id),
      section,
      sectionIndex,
      sectionSkin,
      section.questions
        .flatMap(chooser => realizeQuestions(chooseQuestions(chooser, exam, student, rand)))
        .flatMap((q, partIndex) => this.createRandomizedQuestion(exam, q, student, sectionIndex, partIndex, sectionSkin, uuid_options, seed, allow_duplicates))
    ));
  }

  private static createRandomizedQuestion(
    exam: Exam, question: Question, student: StudentInfo, sectionIndex: number, partIndex: number, sectionSkin: ExamComponentSkin,
    uuid_options: UUID_Options, seed: string, allow_duplicates: boolean = false,
    rand: Randomizer = createQuestionSkinRandomizer(seed, exam, question)
  ) {

    let questionSkins = chooseSkins(question.skin, exam, student, rand).map(qSkin => createCompositeSkin(sectionSkin, qSkin));
    assert(allow_duplicates || questionSkins.length === 1, "Generating multiple skins per question is only allowed if an exam allows duplicate sections.")
    return questionSkins.map(questionSkin => new AssignedQuestion(
      createStudentUuid(uuid_options, student.uniqname, exam.exam_id + "-q-" + question.question_id),
      exam,
      student,
      question,
      questionSkin,
      sectionIndex,
      partIndex,
      undefined
    )
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
