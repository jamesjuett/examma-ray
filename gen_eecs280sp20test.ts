import { readFileSync } from 'fs';
import { ExamGenerator } from "./src/ExamGenerator";
import { exam } from "./eecs280sp20test"
import { ExamUtils } from "./src/ExamUtils";


let gen = new ExamGenerator(exam, {
  filenames: "uuidv5",
  uuidv5_namespace: readFileSync("secret", "utf-8")
});

let students = ExamUtils.loadRoster("roster/roster.csv");

gen.assignRandomizedExams(students);

gen.writeAll();
