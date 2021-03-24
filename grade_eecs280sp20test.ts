import { readdirSync, readFileSync } from 'fs';
import Papa from "papaparse";
import { ExamGenerator } from "./src/generator";
import { exam } from "./eecs280sp20test"
import { ExamGrader } from './src/grader';
import { ExamAnswers, fillManifest } from './src/common';
import { TF_Graders } from './rubric/mc';
import { S7_3_grader } from './rubric/7_big_three';
import { S2_1_graders } from './sections/2_1_containers';
import { S5_Dynamic_Memory_Graders } from './sections/5_dynamic_memory';
import { S6_primes_graders } from './sections/6_primes';
import { TEST_FITB_graders } from './questions/fitb';

let students = Papa.parse<{uniqname: string, name: string}>(readFileSync("roster/roster.csv", "utf8"), {header: true}).data;

let grader = new ExamGrader(exam);
grader.registerGraders(TF_Graders);
grader.registerGraders(TEST_FITB_graders);
grader.registerGraders(S2_1_graders);
grader.registerGraders(S5_Dynamic_Memory_Graders)
grader.registerGraders(S6_primes_graders);
grader.registerGraders(S7_3_grader);


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
