import path from "path";
import { ExamGenerator } from "../../src/ExamGenerator";
import { Exam } from "../../src/exams";
import { QuestionSpecification } from "../../src/specification";
import { Question_Fitb_Drop_Test } from "./content/simple/fitb-drop";
import { Question_Simple_Test_1, Question_Simple_Test_2 } from "./content/simple/test";

function makeTestExam(questions: readonly QuestionSpecification[]) {
  return new Exam({
    id: "full_test_exam",
    title: "Test Exam: All Response Types",
    mk_intructions: "[Instructions]",
    mk_questions_message: "[Questions Message]",
    mk_bottom_message: "[Bottom Message]",
    sections: [
      {
        id: "section",
        title: "[Section Title]",
        mk_description: "[Section Description]",
        mk_reference: "[Section Reference]",
        questions: questions
      }
    ]
  });
}

function genTestExam(exam: Exam) {
  new ExamGenerator(exam, {
    student_ids: "uniqname",
    students: [
      {
        name: "Test Student",
        uniqname: "test"
      }
    ],
    frontend_js_path: "js/frontend.js"
  }).writeAll(path.join(__dirname, "out"), path.join(__dirname, "out"));
}


genTestExam(makeTestExam([
  Question_Simple_Test_1,
  Question_Simple_Test_2]
));

genTestExam(makeTestExam([
  Question_Fitb_Drop_Test]
));