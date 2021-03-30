import { readFileSync } from "fs";
import { S1_true_false } from "./sections/1_true_false";
import { S2_1_containers } from "./sections/2_1_containers";
import { S2_2_containers } from "./sections/2_2_containers";
import { S3_operator_overloading } from "./sections/3_operator_overloading copy";
import { S5_dynamic_memory } from "./sections/5_dynamic_memory";
import { S6_primes } from "./sections/6_primes";
import { S7_1_galley } from "./sections/7_big_three_1";
import { S7_2_gallery } from "./sections/7_big_three_2";
import { S7_3_galleria } from "./sections/7_big_three_3";
import { Exam } from "./src/exams";
import { RANDOM_SECTION } from "./src/specification";

// Create exam
export const exam = new Exam({
  id: "eecs280sp20test",
  title: "EECS 280 Test Exam",
  mk_intructions: readFileSync("instructions.md", "utf8"),
  frontend_js_path: "../../../js/frontend.js",
  frontend_graded_js_path: "../../../js/frontend-graded.js",
  sections: [
    S1_true_false,
    RANDOM_SECTION(1, [
      S2_1_containers,
      S2_2_containers
    ]),
    S3_operator_overloading,
    S5_dynamic_memory,
    S6_primes,
    RANDOM_SECTION(1, [
      S7_1_galley,
      S7_2_gallery,
      S7_3_galleria
    ]),
  ]
});