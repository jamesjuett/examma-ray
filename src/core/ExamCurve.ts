import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { sum } from "simple-statistics";
import { Exam } from "../core";
import { ExamGrader } from "../ExamGrader";
import { GradedExam } from "./assigned_exams";
import { GradedStats } from "./GradedStats";
import { maxPrecisionString } from "./ui_components";
import { assert } from "./util";

type IndividualCurvingParameters = {
  individual_exam_mean: number,
  individual_exam_stddev: number
};

export type AppliedCurve = {
  adjustedScore: number;
  report_html: string;
  parameters: { [index: string]: string | number };
};

export abstract class ExamCurve {

  public abstract applyTo(ex: GradedExam) : AppliedCurve;
  public abstract initialize(grader: ExamGrader): void;
  public abstract lock(grader: ExamGrader): void;

};

export class IndividualizedNormalCurve extends ExamCurve {
  
  public readonly targetMean: number;
  public readonly targetStddev: number;
  public readonly locked: boolean;

  private curving_parameters? : {[index: string]: IndividualCurvingParameters | undefined };

  public constructor(stats: GradedStats, targetMean: number, targetStddev: number, locked: boolean = false) {
    super();
    this.targetMean = targetMean;
    this.targetStddev = targetStddev;
    this.locked = locked;
  }

  private getLockfileName(exam: Exam) {
    return `data/${exam.exam_id}/curve/individual-curve-lock.json`;
  }

  public initialize(grader: ExamGrader) {
    assert(!this.curving_parameters, "Individualized curve may not be initialized more than once.");
    if (this.locked) {
      const lockfile = this.getLockfileName(grader.exam);
      this.curving_parameters = existsSync(lockfile) ? JSON.parse(readFileSync(lockfile, "utf8")) : {};
    }
    else {
      this.curving_parameters = {};
    }

    // Safe since it's definitely assigned above
    const curving_parameters = this.curving_parameters!;

    grader.submittedExams.forEach(ex => {
      if (!ex.isGraded()) {
        return;
      }

      // Get whatever set of parameters (computed or from a curve lock file) is best
      // for the student.
      let computedParams = this.computeIndividualCurvingParameters(ex, grader.stats);
      let lockedParams = curving_parameters[ex.student.uniqname];
      let bestParams = lockedParams ? this.mostFavorable(
        ex.pointsEarned, computedParams, lockedParams
      ) : computedParams;

      // Set parameters back into the overall map
      curving_parameters[ex.student.uniqname] = bestParams;
    });
  }

  private computeIndividualCurvingParameters(ex: GradedExam, stats: GradedStats) : IndividualCurvingParameters {
    
    // find hypothetical mean/stddev curving parameters for the individual exam
    // Note that if question means or covariances are not available, we assume 0.
    
    let indExamMean = sum(ex.assignedSections.flatMap(s => s.assignedQuestions.map(q => stats.questionMean(q.question.question_id) ?? 0)));
        
    let indExamVar = 0;
    let assignedQuestionIds = ex.assignedQuestions.map(q => q.question.question_id);
    assignedQuestionIds.forEach(q1Id =>
      assignedQuestionIds.forEach(q2Id =>
        indExamVar += stats.questionCovariance(q1Id, q2Id) ?? 0
      )
    );
    let indExamStddev = Math.sqrt(indExamVar);

    return {
      individual_exam_mean: indExamMean,
      individual_exam_stddev: indExamStddev
    };
  }

  private mostFavorable(rawScore: number, p1: IndividualCurvingParameters, p2: IndividualCurvingParameters) {

    // Whichever set of individual curving parameters yields the highest zscore
    // is the one that is better for the student, so we return that one.
    const zScore1 = (rawScore - p1.individual_exam_mean) / p1.individual_exam_stddev;
    const zScore2 = (rawScore - p2.individual_exam_mean) / p2.individual_exam_stddev;
    return zScore1 > zScore2 ? p1 : p2;
  }

  public lock(grader: ExamGrader) {
    assert(this.curving_parameters, "Individualized curve must be initialized before it is locked.");
    const lockfile = this.getLockfileName(grader.exam);
    if (this.locked) {
      mkdirSync(dirname(lockfile), { recursive: true });
      writeFileSync(lockfile, JSON.stringify(this.curving_parameters, null, 2), "utf8");
    }
  }

  public applyTo(ex: GradedExam) : AppliedCurve {
    assert(this.curving_parameters, "Individualized curve must be initialized before it is applied to exams.");
    
    const curving_params = this.curving_parameters[ex.student.uniqname];
    assert(curving_params, `Individualized curve cannot be applied to the exam for ${ex.student.uniqname} because their exam was not present in the data from which the curve was initialized.`);

    let zScore = (ex.pointsEarned - curving_params.individual_exam_mean) / curving_params.individual_exam_stddev;
    let curvedScore = zScore * this.targetStddev + this.targetMean;
    let adjustedScore = Math.max(ex.pointsEarned, curvedScore);

    return {
      adjustedScore: adjustedScore,
      report_html: `
        <h2>Exam Curve</h2>
        <div class="alert alert-primary">
          <p>Due to randomization, your exam was different from everyone else's. However, because each individual question was still taken by a large number of students, we are able to statistically compute what the overall score distribution would have been if everyone had taken your exam. Then, we curve all exams individually to the same target distribution. Students who took more difficult exams will have a more generous curve.</p>

          <p>Please note that this curving mechanism does not guarantee a boost to every students' score. In fact, the literal adjustment may bring most high scores down, given a smaller target standard deviation. In this case, we use the raw score rather than the curved score.</p>

          <p>If everyone had taken your version of the exam, the mean raw score would have been <b>${maxPrecisionString(curving_params.individual_exam_mean, 5)}</b> with a standard deviation of <b>${maxPrecisionString(curving_params.individual_exam_stddev, 5)}</b>.</p>

          <p>Your raw score on this exam was <b>${maxPrecisionString(ex.pointsEarned, 5)}</b>, which corresponds to a z-score of <b>${maxPrecisionString(zScore, 5)}</b> ( (${maxPrecisionString(ex.pointsEarned, 5)} - ${maxPrecisionString(curving_params.individual_exam_mean, 5)}) / ${maxPrecisionString(curving_params.individual_exam_stddev, 5)} ) given this distribution.</p>
          
          <p>We curved the exam to a target mean of <b>${maxPrecisionString(this.targetMean, 5)}</b> and standard deviation of <b>${maxPrecisionString(this.targetStddev, 5)}</b>. Applying your z-score yields a curved score of <b>${maxPrecisionString(curvedScore, 5)}</b> (${this.targetMean} + ${maxPrecisionString(zScore, 5)} * ${this.targetStddev}).</p>

          <p>Your final score is the higher of your raw/curved score: <b>${maxPrecisionString(adjustedScore, 5)}</b></p>

        </div>
      `,
      parameters: curving_params
    };
  }

};