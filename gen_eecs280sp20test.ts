import { readFileSync } from 'fs';
import Papa from "papaparse";
import { ExamGenerator } from "./src/generator";
import { exam } from "./eecs280sp20test"
import { S1_true_false } from './sections/1_true_false';
import { S2_1_containers } from './sections/2_1_containers';
import { S2_2_containers } from './sections/2_2_containers';
import { S3_operator_overloading } from './sections/3_operator_overloading copy';
import { S5_dynamic_memory } from './sections/5_dynamic_memory';
import { S6_primes } from './sections/6_primes';
import { S7_1_galley } from './sections/7_big_three_1';
import { S7_2_gallery } from './sections/7_big_three_2';
import { S7_3_galleria } from './sections/7_big_three_3';
import { RANDOM_SECTION } from './src/exams';

let students = Papa.parse<{ uniqname: string, name: string }>(readFileSync("roster/roster.csv", "utf8"), { header: true }).data;

let gen = new ExamGenerator(exam);
students.forEach(student => gen.assignRandomizedExam(student));

gen.writeAll();
