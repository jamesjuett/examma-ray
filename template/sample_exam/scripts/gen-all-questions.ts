import { ExamGenerator } from 'examma-ray';

// Note the import from our previous exam-spec file
import { EXAM } from '../exam-spec';

let gen = new ExamGenerator(EXAM, {
  student_ids: "uniqname",
  students: [{
    name: "Full Exam",
    uniqname: "fullexam"
  }],
  allow_duplicates: true,
  choose_all: true
});

gen.writeAll();