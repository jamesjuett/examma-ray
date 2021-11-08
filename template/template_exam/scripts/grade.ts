import minimist from "minimist";

import { CURVE, EXAM_GRADER } from "../grader-spec";

function main() {

  let argv = minimist(process.argv, {
    alias: {
      "r": "reports",
    },
    default: {

    }
  });
  
  let reports: string = argv["reports"];

  // Load and verify answers
  console.log("loading submissions...");
  EXAM_GRADER.loadAllSubmissions();

  console.log("grading submissions...");
  EXAM_GRADER.gradeAll();
  
  if (CURVE) {
    EXAM_GRADER.applyCurve(CURVE);
  }

  EXAM_GRADER.writeAll();
  
  if (reports) {
    EXAM_GRADER.writeReports();
  }
  
}

main();
