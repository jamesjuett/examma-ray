import { exam } from "./eecs280sp20test"
import { ExamGrader } from './src/grader';
import { TF_Graders } from './rubric/mc';
import { S7_3_grader } from './rubric/7_big_three';
import { S2_1_graders } from './sections/2_1_containers';
import { S5_Dynamic_Memory_Graders } from './sections/5_dynamic_memory';
import { S6_primes_graders } from './sections/6_primes';
import { TEST_FITB_graders } from './questions/fitb';
import { ExamUtils } from './src/ExamUtils';

let grader = new ExamGrader(exam, [
  TF_Graders,
  TEST_FITB_graders,
  S2_1_graders,
  S5_Dynamic_Memory_Graders,
  S6_primes_graders,
  S7_3_grader
]);

// Load and verify answers
grader.addSubmissions(ExamUtils.loadTrustedSubmissions("data/manifests", "data/submissions"));

grader.gradeAll();

grader.writeAll();
