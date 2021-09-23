import { sum } from "simple-statistics";
import { GradedExam } from "./exams";
import { GradedStats } from "./GradedStats";
import { maxPrecisionString } from "./ui_components";

export type AppliedCurve = {
  adjustedScore: number;
  report_html: string;
  parameters: { [index: string]: string | number };
};

export abstract class ExamCurve {

  public abstract applyTo(ex: GradedExam) : AppliedCurve;

};

export class IndividualizedNormalCurve extends ExamCurve {
  
  public readonly stats: GradedStats;
  public readonly targetMean: number;
  public readonly targetStddev: number;

  public constructor(stats: GradedStats, targetMean: number, targetStddev: number) {
    super();
    this.stats = stats;
    this.targetMean = targetMean;
    this.targetStddev = targetStddev;
  }

  public applyTo(ex: GradedExam) : AppliedCurve {

    // find hypothetical mean/stddev curving parameters for the individual exam
    // Note that if question means or covariances are not available, we assume 0.
    let indExamMean = sum(ex.assignedSections.flatMap(s => s.assignedQuestions.map(q => this.stats.questionMean(q.question.question_id) ?? 0)));
      
    let indExamVar = 0;
    let assignedQuestionIds = ex.assignedQuestions.map(q => q.question.question_id);
    assignedQuestionIds.forEach(q1Id =>
      assignedQuestionIds.forEach(q2Id =>
        indExamVar += this.stats.questionCovariance(q1Id, q2Id) ?? 0
      )
    );
    let indExamStddev = Math.sqrt(indExamVar);
    
    let zScore = (ex.pointsEarned - indExamMean) / indExamStddev;
    let curvedScore = zScore * this.targetStddev + this.targetMean;
    let adjustedScore = Math.max(ex.pointsEarned, curvedScore);

    return {
      adjustedScore: adjustedScore,
      report_html: `
        <h2>Exam Curve</h2>
        <div>
          <p>Due to randomization, your exam was different from everyone else's. However, because each individual question was still taken by a large number of students, we are able to statistically compute what the overall score distribution would have been if everyone had taken your exam. Then, we curve all exams individually to the same target distribution. Students who took more difficult exams will have a more generous curve.</p>

          <p>Please note that this curving mechanism does not guarantee a boost to every students' score. In fact, the literal adjustment may bring most high scores down, given a smaller target standard deviation. In this case, we use the raw score rather than the curved score.</p>

          <p>If everyone had taken your version of the exam, the mean raw score would have been <b>${maxPrecisionString(indExamMean, 5)}</b> with a standard deviation of <b>${maxPrecisionString(indExamStddev, 5)}</b>.</p>

          <p>Your raw score on this exam was <b>${maxPrecisionString(ex.pointsEarned, 5)}</b>, which corresponds to a z-score of <b>${maxPrecisionString(zScore, 5)}</b> given this distribution.</p>
          
          <p>We curved the exam to a target mean of <b>${maxPrecisionString(this.targetMean, 5)}</b> and standard deviation of <b>${maxPrecisionString(this.targetStddev, 5)}</b>. Applying your z-score yields a curved score of <b>${maxPrecisionString(curvedScore, 5)}</b> (${`${this.targetMean} + ${maxPrecisionString(zScore, 5)} * ${this.targetStddev}`}).</p>

          <p>Your final score is the higher of your raw/curved score: <b>${maxPrecisionString(adjustedScore, 5)}</b></p>

        </div>
      `,
      parameters: {
        "individual_exam_mean": indExamMean,
        "individual_exam_stddev": indExamStddev
      }
    };
  }

};
