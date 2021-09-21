import { BLANK_SUBMISSION } from "examma-ray/dist/response/common";
import { grader } from "../grader-spec";

// Load and verify answers
grader.loadAllSubmissions();

let blanks = grader.allAssignedQuestions.filter(aq => aq.submission === BLANK_SUBMISSION);
blanks = blanks.filter(b => b.question.question_id.indexOf("or_not") === -1);
console.log(grader.submittedExams.length);
console.log(grader.allAssignedQuestions.length);
console.log(blanks.length);
console.log(blanks.map(blank => blank.question.question_id));
console.log(blanks.map(blank => blank.student.uniqname));

// grader.gradeAll();

// grader.writeAll();
