import { Exam } from "examma-ray";
import { ExamGenerator } from "examma-ray/dist/ExamGenerator";
import { ExamPreview } from "examma-ray/dist/ExamPreview";
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
  uuid_strategy: "uuidv5",
  uuidv5_namespace: readFileSync("secret", "utf-8"),
});

export const EXAM_PREVIEW = new ExamPreview(EXAM);