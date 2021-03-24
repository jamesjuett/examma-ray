import { readdirSync, readFileSync } from 'fs';
import Papa from "papaparse";
import { ExamGenerator } from "./src/generator";
import { exam } from "./eecs280sp20test"
import { ExamGrader } from './src/grader';
import { ExamAnswers, fillManifest } from './src/common';
import { TF_Graders } from './rubric/mc';
import { S5_Dynamic_Memory_Graders } from './rubric/5_dynamic_memory';

let students = Papa.parse<{uniqname: string, name: string}>(readFileSync("roster/roster.csv", "utf8"), {header: true}).data;

let grader = new ExamGrader(exam);
grader.registerGraders(TF_Graders);
grader.registerGraders(S5_Dynamic_Memory_Graders)


// Load and verify answers
readdirSync("submissions/").forEach(filename => {
  let submitted = <ExamAnswers>JSON.parse(readFileSync(`submissions/${filename}`, "utf8"))
  let manifest = <ExamAnswers>JSON.parse(readFileSync(`out/eecs280sp20test/assigned/manifests/${filename}`, "utf8"))
  let trusted = fillManifest(manifest, submitted);
  grader.addSubmission(trusted);
});

grader.gradeAll();
// students.forEach(student => grader.addSubmission(student));

grader.writeAll();
