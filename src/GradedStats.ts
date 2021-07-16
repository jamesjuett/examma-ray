import { mean, sampleCovariance, standardDeviation, sum } from "simple-statistics";
import { ExamGrader } from "./ExamGrader";
import { isGradedQuestion } from "./exams";
import { assert, assertFalse } from "./util";

export class GradedStats {

  public readonly numFullyGraded: number;
  public readonly mean: number;
  public readonly stddev: number;

  /**
   * Maps from question-id to mean grade on that question
   */
  private readonly gradedQuestionsMeans: {
    [index: string]: number | undefined;
  } = {};

  /**
   * Maps from question-id, question-id to covariance.
   * e.g. index at ["question_id_1"]["question_id_2"] to
   * get the covariance between grades on those questions.
   */
  private readonly gradedQuestionCovarianceMatrix: {
    [index: string]: {
      [index: string]: number | undefined;
    };
  } = {};

  public constructor(examGrader: ExamGrader) {

    let fullyGradedExams = examGrader.submittedExams.filter(ex => ex.isGraded());
    this.numFullyGraded = fullyGradedExams.length;
    this.mean = this.numFullyGraded > 0 ? mean(fullyGradedExams.map(ex => ex.pointsEarned!)) : 0;
    this.stddev = this.numFullyGraded > 0 ? standardDeviation(fullyGradedExams.map(ex => ex.pointsEarned!)) : 0;

    examGrader.allQuestions.forEach(question => {
      let assignedQuestions = examGrader.getAllAssignedQuestionsById(question.question_id);
      let gradedQuestions = assignedQuestions.filter(isGradedQuestion);
      if (gradedQuestions.length > 0) {
        this.gradedQuestionsMeans[question.question_id] = mean(gradedQuestions.map(aq => aq.pointsEarned));
      }
    });

    // Find covariance matrix for all questions
    examGrader.allQuestions.forEach(q1 => {

      this.gradedQuestionCovarianceMatrix[q1.question_id] = {};
      
      examGrader.allQuestions.forEach(q2 => {

        // console.log(`computing covariance for ${q1.question_id} and ${q2.question_id}`);
        // Only calculate covariance based on cases where the questions appeared together and are graded
        let q1Scores : number[] = [];
        let q2Scores : number[] = [];
        examGrader.submittedExams.forEach(ex => {
          let aq1 = ex.getAssignedQuestionById(q1.question_id);
          let aq2 = ex.getAssignedQuestionById(q2.question_id);
          if (aq1?.isGraded() && aq2?.isGraded()) {
            q1Scores.push(aq1.pointsEarned);
            q2Scores.push(aq2.pointsEarned);
          }
        });

        // Covariance can only be computed if there are at least 2 data points
        if (q1Scores.length >= 2) {
          let cov = sampleCovariance(q1Scores, q2Scores);
          assert(!isNaN(cov), q1.question_id + " " + q2.question_id + " has a NaN covariance");
          this.gradedQuestionCovarianceMatrix[q1.question_id][q2.question_id] = cov;
        }

      });
    });
  }

  public questionMean(question_id: string) {
    return this.gradedQuestionsMeans[question_id];
  }

  public questionStddev(question_id: string) {
    let variance = this.gradedQuestionCovarianceMatrix[question_id][question_id];
    return variance && Math.sqrt(variance);
  }

  public questionCovariance(question_id_1: string, question_id_2: string) {
    return this.gradedQuestionCovarianceMatrix[question_id_1][question_id_2];
  }
}