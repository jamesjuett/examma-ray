import minimist from "minimist";
import { EXAM } from "../exam-spec";
import { GRADERS, EXCEPTIONS} from "../grader-spec";
import { IndividualizedNormalCurve } from "examma-ray/dist/ExamCurve";
import { ExamGrader } from "examma-ray";
import { readFileSync } from "fs";

const grader = new ExamGrader(EXAM, {
  student_ids: "uuidv5",
  uuidv5_namespace: readFileSync("secret", "utf-8"),
  frontend_js_path: "js/frontend-graded.js",
}, GRADERS, EXCEPTIONS);



function parseCurve(curve_arg: string | undefined) {

  if (!curve_arg) {
    return;
  } 

  let curve: [number, number];
  if (curve_arg) {
    try {
      curve = JSON.parse(curve_arg);
    }
    catch(e) {
      throw new Error("Error: Curve argument must be in format [mean, stddev].");
    }

    if (
      Array.isArray(curve) && curve.length === 2 &&
      typeof curve[0] === "number" && typeof curve[1] === "number"
    ) {
      return curve;
    }
  }
  throw new Error("Error: Curve argument must be in format [mean, stddev].");
}

function main() {

  let argv = minimist(process.argv, {
    alias: {
      "r": "reports",
      "c": "curve"
    },
    default: {
      // "no_reports": false
    }
  });
  
  let reports: string = argv["reports"];
  let curve = parseCurve(argv["curve"]);

  // Load and verify answers
  console.log("loading submissions...");
  grader.loadAllSubmissions();

  console.log("grading submissions...");
  grader.gradeAll();
  
  if (curve) {
    console.log(`Curving to mean ${curve[0]}, stddev ${curve[1]}.`);
    grader.applyCurve(new IndividualizedNormalCurve(grader.stats, curve[0], curve[1]));
  }

  grader.writeScoresCsv();
  grader.writeOverview();
  grader.writeStats();
  if (reports) { grader.writeReports(); }
  
}

main();
