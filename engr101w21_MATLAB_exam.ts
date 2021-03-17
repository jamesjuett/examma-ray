import { AssignedExam, AssignedQuestion, Exam, Question, RANDOM_BY_TAG, Section } from "./autograder";
import { TF_QUESTIONS } from "./questions/tf";

// Create exam
let exam = new Exam("ENGR 101 W21 MATLAB Exam", 100);

// Add sections/content
exam.addSection(new Section({
  "id": "true_false",
  "title": "True/False",
  "mk_description": "Determine whether the following statements are true or false.",
  "builder": RANDOM_BY_TAG("time_complexity", 3)
}))

TF_QUESTIONS.forEach(q => exam.registerQuestion(new Question(q)));

// Run autograder (what is run is configured by command line args)
let ae = exam.buildAssignedExam({
  uniqname: "lslavice",
  name: "James Juett"
});

exam.renderReports();
