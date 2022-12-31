import minimist from "minimist";

import { EXAM_GENERATOR, EXAM_PREVIEW } from '../exam-spec';
import { ExamUtils } from "examma-ray/dist/ExamUtils";
import { OriginalExamRenderer, SampleSolutionExamRenderer } from "examma-ray";

function main() {
  const argv = minimist(process.argv, {
    alias: {
      "a": "all-questions",
      "p": "preview",
      "s": "sample-solution",
      "q": "spec-only"
    },
    default: {
      
    }
  });
  
  const all_questions: string = argv["all-questions"];
  const preview: string = argv["preview"];
  const sample_solution: string = argv["sample-solution"];
  const spec_only: string = argv["spec-only"];
  
  if (spec_only) {
    // Render exam specification only, not individual exams
    EXAM_GENERATOR.writeExamSpec();
    return;
  }
  
  
  if (all_questions || preview) {
    EXAM_PREVIEW.writeAll();
  }
  else {
    const exam_renderer = sample_solution ? new SampleSolutionExamRenderer() : new OriginalExamRenderer();
    EXAM_GENERATOR.assignExams(ExamUtils.loadCSVRoster("roster.csv")),
    EXAM_GENERATOR.writeAll(exam_renderer);
  }
  
}

main();
