import { ExamGenerator, ExamUtils, } from 'examma-ray';
import { readFileSync } from 'fs';

// Note the import from our previous exam-spec file
import { EXAM } from '../exam-spec';

let gen = new ExamGenerator(EXAM, {
  student_ids: "uuidv5",
  uuidv5_namespace: readFileSync("secret", "utf-8"),
  students: ExamUtils.loadCSVRoster("roster.csv"),
  frontend_js_path: "js/frontend.js"
});

gen.writeAll();