import { readFileSync } from 'fs';
import Papa from "papaparse";
import { BY_ID, Exam, ExamGenerator, Question, QuestionBank, RANDOM_BY_TAG, RANDOM_SECTION, RenderMode, Section } from "./autograder";
import { FITB_QUESTIONS } from "./questions/fitb";
import { SAS_QUESTIONS } from './questions/sas';
import { S1_true_false } from './sections/1_true_false';
import { Section_7_1 as S7_galley } from './sections/7_big_three_1';
import { S6_primes } from './sections/6_primes';


// Create exam
let exam = new Exam({
  id: "engr101w21matlab",
  title: "ENGR 101 W21 MATLAB Exam",
  pointsPossible: 100,
  mk_intructions: readFileSync("instructions.md", "utf8"),
  sections: [
    S1_true_false,
    S6_primes,
    RANDOM_SECTION(1, [
      S7_galley
    ])
  ]
});

let students = Papa.parse<{uniqname: string, name: string}>(readFileSync("roster/roster.csv", "utf8"), {header: true}).data;

let gen = new ExamGenerator(exam);
students.forEach(student => gen.assignRandomizedExam(student));

gen.writeAll(RenderMode.ORIGINAL);
