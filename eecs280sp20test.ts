import { readFileSync } from 'fs';
import Papa from "papaparse";
import { Exam, ExamGenerator, RANDOM_SECTION, RenderMode } from "./autograder";
import { FITB_QUESTIONS } from './questions/fitb';
import { S1_true_false } from './sections/1_true_false';
import { S2_1_min_queue } from './sections/2_1_min_queue';
import { S2_2_min_queue } from './sections/2_2_min_queue';
import { S6_primes } from './sections/6_primes';
import { S7_1_galley } from './sections/7_big_three_1';
import { S7_2_gallery } from './sections/7_big_three_2';
import { S7_3_galleria } from './sections/7_big_three_3';


// Create exam
let exam = new Exam({
  id: "eecs280sp20test",
  title: "EECS 280 Test Exam",
  pointsPossible: 100,
  mk_intructions: readFileSync("instructions.md", "utf8"),
  sections: [
    S1_true_false,
    RANDOM_SECTION(1, [
      S2_1_min_queue,
      S2_2_min_queue
    ]),
    S6_primes,
    RANDOM_SECTION(1, [
      S7_1_galley,
      S7_2_gallery,
      S7_3_galleria
    ]),
  ]
});

let students = Papa.parse<{uniqname: string, name: string}>(readFileSync("roster/roster.csv", "utf8"), {header: true}).data;

let gen = new ExamGenerator(exam);
students.forEach(student => gen.assignRandomizedExam(student));

gen.writeAll();
