import { grader } from "../grader-spec";
import minimist from "minimist";
import { ExamUtils } from "examma-ray";
import { exam } from "../exam-spec";
import { GradingAssignmentSpecification, GradingGroup, GradingSubmission } from "examma-ray/dist/grading/common";
import { GradingResult } from "examma-ray/dist/QuestionGrader";

// // Load and verify answers
// grader.loadAllSubmissions();

// let assns = grader.prepareManualGrading();

function main() {
  let exam_id = exam.exam_id;

  let argv = minimist(process.argv.slice(2), {
    alias: {
      "q": "question-id",
      "n": "num-chunks"
    },
    default: {
      // "no_reports": false
    }
  });
  
  let question_id: string = argv["question-id"];
  let num_chunks: number = argv["num-chunks"];
  
  if (!question_id || !Number.isInteger(num_chunks)) {
    console.log("Invalid arguments");
    return;
  }
  
  grader.loadAllSubmissions();
  let assignedQuestions = grader.getAllAssignedQuestionsById(question_id)
  
  if (!assignedQuestions) {
    console.log(`No submissions found for question id: ${question_id}`);
    return;
  }

  let prevAssns = ExamUtils.readGradingAssignments(exam_id, question_id);

  let existingSubs = prevAssns.flatMap(assn => assn.groups.flatMap(g => g.submissions.map(sub => ({sub: sub, result: g.grading_result}))));
  let existingSubsMap : {[index: string]: {sub:GradingSubmission, result?: GradingResult}} = {};
  existingSubs.forEach(exSub => existingSubsMap[exSub.sub.student.uniqname] = exSub);

  let assn : GradingAssignmentSpecification = {
    question_id: question_id,
    exam_id: exam_id,
    groups: Object.values(existingSubsMap).map((exSub, i) => <GradingGroup>{
      name: "group_" + i,
      grading_result: exSub.result,
      submissions: [exSub.sub],
      representative_index: 0
    })
  };
  
  let newAssns = ExamUtils.rechunkGradingAssignments([assn], num_chunks);

  ExamUtils.clearGradingAssignments(exam_id, question_id);
  ExamUtils.writeGradingAssignments(newAssns);
  
}

main();
