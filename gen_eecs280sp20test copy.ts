import { readFileSync } from 'fs';
import { ExamGenerator } from "./src/ExamGenerator";
import { exam } from "./eecs280sp20test"
import { ExamUtils } from "./src/ExamUtils";
import { AssignedExam, AssignedSection } from './src/exams';
import { v4 } from 'uuid';


let gen = new ExamGenerator(exam, {
  student_ids: "uuidv5",
  uuidv5_namespace: readFileSync("secret", "utf-8")
});

let students = ExamUtils.loadCSVRoster("roster/roster.csv");

gen.assignRandomizedExams(students);

gen.writeAll();
