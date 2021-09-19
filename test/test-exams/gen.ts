import path from "path";
import { ExamGenerator } from "../../src/ExamGenerator";
import { Exam } from "../../src/exams";
import { CUSTOMIZE, QuestionSpecification } from "../../src/specification";
import { Test_Question_MC_Multiple, Test_Question_MC_Single } from "./content/mc";
import { Test_Question_Fitb_Drop } from "./content/fitb-drop";
import { Question_Simple_Test_1, Question_Simple_Test_2 } from "./content/simple/test";
import { renderFITBDropBank } from "../../src/response/fitb-drop";

function makeTestExam(id: string, questions: readonly QuestionSpecification[]) {
  return new Exam({
    id: id,
    title: "[Title]",
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


genTestExam(makeTestExam("simple_test", [
  Question_Simple_Test_1,
  Question_Simple_Test_2,
]));

genTestExam(makeTestExam("full_test_exam", [
  Test_Question_MC_Single,
  Test_Question_MC_Multiple,
  Test_Question_Fitb_Drop,
]));

genTestExam(makeTestExam("fitb-drop-multiple", [
  CUSTOMIZE(Test_Question_Fitb_Drop, {id: "fitb_drop_test_1"}),
  CUSTOMIZE(Test_Question_Fitb_Drop, {id: "fitb_drop_test_2"}),
  CUSTOMIZE(Test_Question_Fitb_Drop, {id: "fitb_drop_test_3"}),
]));

genTestExam(new Exam({
  id: "fitb-drop-reference",
  title: "[Title]",
  mk_intructions: "[Instructions]",
  mk_questions_message: "[Questions Message]",
  mk_bottom_message: "[Bottom Message]",
  sections: [
    {
      id: "section",
      title: "[Section Title]",
      mk_description: "[Section Description]",
      mk_reference:
`[Section Reference]

\`fitb_drop_test_1\`
${renderFITBDropBank("fitb_drop_test_1")}
<br />
<br />
\`fitb_drop_test_2\`
${renderFITBDropBank("fitb_drop_test_2")}
<br />
<br />
\`fitb_drop_test_3\`
${renderFITBDropBank("fitb_drop_test_3")}
`,
      questions: [
        CUSTOMIZE(Test_Question_Fitb_Drop, {id: "fitb_drop_test_1"}),
        CUSTOMIZE(Test_Question_Fitb_Drop, {id: "fitb_drop_test_2"}),
        CUSTOMIZE(Test_Question_Fitb_Drop, {id: "fitb_drop_test_3"}),
      ]
    }
  ]
}));