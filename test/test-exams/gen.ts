import path from "path";
import { ExamGenerator } from "../../src/ExamGenerator";
import { CUSTOMIZE, QuestionSpecification } from "../../src/specification";
import { Test_Question_MC_Multiple, Test_Question_MC_Single } from "./content/mc";
import { Test_Question_Fitb_Drop } from "./content/fitb-drop";
import { Question_Simple_Test_1, Question_Simple_Test_2 } from "./content/simple/test";
import { renderFITBDropBank } from "../../src/response/fitb-drop";
import { Exam } from "../../src/exam_components";

function makeTestExam(id: string, questions: readonly QuestionSpecification[]) {
  return Exam.create({
    exam_id: id,
    title: "[Title]",
    mk_intructions: "[Instructions]",
    mk_questions_message: "[Questions Message]",
    mk_bottom_message: "[Bottom Message]",
    sections: [
      {
        section_id: "section",
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
  CUSTOMIZE(Test_Question_Fitb_Drop, {question_id: "fitb_drop_test_1"}),
  CUSTOMIZE(Test_Question_Fitb_Drop, {question_id: "fitb_drop_test_2"}),
  CUSTOMIZE(Test_Question_Fitb_Drop, {question_id: "fitb_drop_test_3"}),
]));

genTestExam(Exam.create({
  exam_id: "fitb-drop-reference",
  title: "[Title]",
  mk_intructions: "[Instructions]",
  mk_questions_message: "[Questions Message]",
  mk_bottom_message: "[Bottom Message]",
  sections: [
    {
      section_id: "section",
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
        CUSTOMIZE(Test_Question_Fitb_Drop, {question_id: "fitb_drop_test_1"}),
        CUSTOMIZE(Test_Question_Fitb_Drop, {question_id: "fitb_drop_test_2"}),
        CUSTOMIZE(Test_Question_Fitb_Drop, {question_id: "fitb_drop_test_3"}),
      ]
    }
  ]
}));

genTestExam(Exam.create({
  exam_id: "multi_section_test_exam",
  title: "[Title]",
  mk_intructions: "[Instructions]",
  mk_questions_message: "[Questions Message]",
  mk_bottom_message: "[Bottom Message]",
  sections: [
    {
      section_id: "section1",
      title: "[Section Title 1]",
      mk_description: "[Section Description 1]",
      mk_reference: "[Section Reference 1]",
      reference_width: 20,
      questions: [
        CUSTOMIZE(Test_Question_MC_Single, {question_id: "test_question_mc_single_1"}),
      ]
    },
    {
      section_id: "section2",
      title: "[Section Title 2]",
      mk_description: "[Section Description 2]",
      mk_reference: "[Section Reference 2]",
      reference_width: 40,
      questions: [
        CUSTOMIZE(Test_Question_MC_Single, {question_id: "test_question_mc_single_2"}),
      ]
    },
    {
      section_id: "section3",
      title: "[Section Title 3]",
      mk_description: "[Section Description 3]",
      mk_reference: "[Section Reference 3]",
      reference_width: 60,
      questions: [
        CUSTOMIZE(Test_Question_MC_Single, {question_id: "test_question_mc_single_3"}),
      ]
    }
  ]
}));