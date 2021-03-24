import { readFileSync } from 'fs';
import Papa from "papaparse";
import { ExamGenerator } from "./src/generator";
import { exam } from "./eecs280sp20test"

let students = Papa.parse<{ uniqname: string, name: string }>(readFileSync("roster/roster.csv", "utf8"), { header: true }).data;

let gen = new ExamGenerator(exam, {
  filenames: "uuidv5",
  uuidv5_namespace: readFileSync("test", "utf-8")
});
students.forEach(student => gen.assignRandomizedExam(student));

gen.writeAll();
