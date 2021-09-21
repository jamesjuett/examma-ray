import { Exam } from "examma-ray";
import { readFileSync } from "fs";
import { Section_Sample_MC } from "../content/sample_mc";

export const EXAM = new Exam({
  id: "sample_exam",
  title: "Examma Ray Sample Exam",
  mk_intructions: readFileSync("instructions.md", "utf8"),
  mk_questions_message: readFileSync("questions.html", "utf8"),
  sections: [
    Section_Sample_MC
  ],
});