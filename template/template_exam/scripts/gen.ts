import minimist from "minimist";

import { EXAM_GENERATOR_INDIVIDUAL, EXAM_GENERATOR_PREVIEW } from '../exam-spec';
import { ExamUtils } from "examma-ray/dist/ExamUtils";
import { OriginalExamRenderer, SampleSolutionExamRenderer } from "examma-ray";


const argv = minimist(process.argv, {
  alias: {
    "a": "all-questions",
    "s": "sample-solution"
  },
  default: {
    // "no_reports": false
  }
});

const all_questions: string = argv["all-questions"];
const sample_solution: string = argv["sample-solution"];


const exam_renderer = sample_solution ? new SampleSolutionExamRenderer() : new OriginalExamRenderer();

if (all_questions) {
  EXAM_GENERATOR_PREVIEW.assignExam({
    name: "All Questions Preview",
    uniqname: "preview"
  });
  EXAM_GENERATOR_PREVIEW.writeAll(exam_renderer);
}
else {
  EXAM_GENERATOR_INDIVIDUAL.assignExams(ExamUtils.loadCSVRoster("roster.csv")),
  EXAM_GENERATOR_INDIVIDUAL.writeAll(exam_renderer);
}


