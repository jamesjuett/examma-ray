import path from "path";
import { ExamGenerator } from "../../src/ExamGenerator";
import { Exam } from "../../src/exams";
import { Section_Simple_Test } from "./content/simple/test";

let exam = new Exam({
  id: "simple_test",
  title: "Simple Test Exam",
  mk_intructions: "[Instructions]",
  mk_questions_message: "[Questions Message]",
  mk_bottom_message: "[Bottom Message]",
  sections: [
    Section_Simple_Test
  ]
});

let gen = new ExamGenerator(exam, {
  student_ids: "uniqname",
  students: [
    {
      name: "Test Student",
      uniqname: "test"
    }
  ],
  frontend_js_path: "js/frontend.js"
});

gen.writeAll(path.join(__dirname, "out"), path.join(__dirname, "out"));
