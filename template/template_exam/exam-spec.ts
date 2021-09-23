import { Exam, ExamGenerator, ExamUtils } from "examma-ray";
import { readFileSync } from "fs";
import { Section_Sample_MC } from "../content/sample_mc";

export const EXAM = Exam.create({
  exam_id: "template_exam",
  title: "Examma Ray Template Exam",
  mk_intructions: readFileSync("instructions.md", "utf8"),
  mk_questions_message: readFileSync("questions.md", "utf8"),
  sections: [
    Section_Sample_MC
  ],
});

export const EXAM_GENERATOR = new ExamGenerator(EXAM, {
  student_ids: "uuidv5",
  uuidv5_namespace: readFileSync("secret", "utf-8"),
  students: ExamUtils.loadCSVRoster("roster.csv"),
  frontend_js_path: "js/frontend.js"
});

export const EXAM_GENERATOR_ALL = new ExamGenerator(EXAM, {
  student_ids: "uniqname",
  students: [{
    name: "All Questions Preview",
    uniqname: "preview"
  }],
  allow_duplicates: true,
  choose_all: true
});