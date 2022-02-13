import { ExamCurve } from "examma-ray/dist/core/ExamCurve";
import { ExamGrader, GraderSpecificationMap } from "examma-ray/dist/ExamGrader";
import { readFileSync } from "fs";
import { EXAM } from "./exam-spec";
import { EXCEPTIONS } from "./exceptions";

export const GRADERS : GraderSpecificationMap[] = [
  // Specify graders here by question ID if the question
  // doesn't have a default grader or if you want to
  // override it
];

export const EXAM_GRADER = new ExamGrader(EXAM, {
  uuid_strategy: "uuidv5",
  uuidv5_namespace: readFileSync("secret", "utf-8"),
  frontend_js_path: "js/",
}, GRADERS, EXCEPTIONS);


export const CURVE : ExamCurve | undefined = undefined; //new IndividualizedNormalCurve(EXAM_GRADER.stats, 84, 9, true);