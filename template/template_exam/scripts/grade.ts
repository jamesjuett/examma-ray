import minimist from "minimist";

import { CURVE, EXAM_GRADER } from "../grader-spec";

// function parseCurve(curve_arg: string | undefined) {

//   if (!curve_arg) {
//     return;
//   } 

//   let curve: [number, number];
//   if (curve_arg) {
//     try {
//       curve = JSON.parse(curve_arg);
//     }
//     catch(e) {
//       throw new Error("Error: Curve argument must be in format [mean, stddev].");
//     }

//     if (
//       Array.isArray(curve) && curve.length === 2 &&
//       typeof curve[0] === "number" && typeof curve[1] === "number"
//     ) {
//       return curve;
//     }
//   }
//   throw new Error("Error: Curve argument must be in format [mean, stddev].");
// }

function main() {

  let argv = minimist(process.argv, {
    alias: {
      "r": "reports",
      // "c": "curve"
    },
    default: {
      // "no_reports": false
    }
  });
  
  let reports: string = argv["reports"];
  // let curve = parseCurve(argv["curve"]);

  // Load and verify answers
  console.log("loading submissions...");
  EXAM_GRADER.loadAllSubmissions();

  console.log("grading submissions...");
  EXAM_GRADER.gradeAll();
  
  if (CURVE) {
    EXAM_GRADER.applyCurve(CURVE);
  }

  EXAM_GRADER.writeScoresCsv();
  EXAM_GRADER.writeOverview();
  EXAM_GRADER.writeStats();
  
  if (reports) {
    EXAM_GRADER.writeReports();
  }
  
}

main();
