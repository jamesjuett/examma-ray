import minimist from "minimist";

import { EXAM_GENERATOR, EXAM_GENERATOR_ALL } from '../exam-spec';
import { ExamUtils } from "examma-ray/dist/ExamUtils";


const argv = minimist(process.argv, {
  alias: {
    "a": "all-questions"
  },
  default: {
    // "no_reports": false
  }
});

const all_questions: string = argv["all-questions"];

if (all_questions) {
  EXAM_GENERATOR_ALL.assignExams(ExamUtils.loadCSVRoster("roster.csv")),
  EXAM_GENERATOR_ALL.writeAll();
}
else {
  EXAM_GENERATOR.assignExam({
    name: "All Questions Preview",
    uniqname: "preview"
  });
  EXAM_GENERATOR.writeAll();
}


