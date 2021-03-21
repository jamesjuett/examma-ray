import { readFileSync } from 'fs';
import Papa from "papaparse";
import { BY_ID, Exam, ExamGenerator, Question, RANDOM_BY_TAG, RenderMode, Section } from "./autograder";
import { TF_QUESTIONS } from "./questions/tf";
import { FITB_QUESTIONS } from "./questions/fitb";
import { SAS_QUESTIONS } from './questions/sas';


// Create exam
let exam = new Exam({
  id: "engr101w21matlab",
  title: "ENGR 101 W21 MATLAB Exam",
  pointsPossible: 100,
  mk_intructions: readFileSync("instructions.md", "utf8")
});

exam.registerQuestions(TF_QUESTIONS);
exam.registerQuestions(FITB_QUESTIONS);
exam.registerQuestions(SAS_QUESTIONS);

// Add sections/content
exam.addSection(new Section({
  "id": "true_false",
  "title": "True/False",
  "mk_description": "Determine whether the following statements are true or false.",
  "mk_reference": "```cpp\n// You may assume type T supports ==, !=, <, <=, >, and >=\ntemplate <typename T>\nclass MinQueue { \npublic:\n  MinQueue() : size(0) { } // default ctor\n\n  // REQUIRES: the MinQueue is not empty\n  EFFECTS: Returns the minimum item, but\n  // does not remove it from the MinQueue\n  const T & min() const;\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Removes the minimum item from the MinQueue\n  void popMin();\n\n  // REQUIRES: the MinQueue is not full\n  // EFFECTS: Adds 'item' to the MinQueue\n  void push(const T &item);\n\nprivate:\n  // For simplicity, we assume a fixed capacity\n  // and that the user of a MinQueue never exceeds\n  // this. This isn't a dynamic memory question :).\n  int data[10];\n\n  // number of valid items in the data array\n  int size;\n};\n\n```\nHere's an example of using a `MinQueue`:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n  q.push(6);\n  q.push(2);\n  q.push(5);\n\n  cout << q.min(); // prints 2\n\n  q.popMin(); // removes 2\n  cout << q.min(); // prints 5\n}\n``` \n\ntest \n\n```cpp\n// You may assume type T supports ==, !=, <, <=, >, and >=\ntemplate <typename T>\nclass MinQueue { \npublic:\n  MinQueue() : size(0) { } // default ctor\n\n  // REQUIRES: the MinQueue is not empty\n  EFFECTS: Returns the minimum item, but\n  // does not remove it from the MinQueue\n  const T & min() const;\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Removes the minimum item from the MinQueue\n  void popMin();\n\n  // REQUIRES: the MinQueue is not full\n  // EFFECTS: Adds 'item' to the MinQueue\n  void push(const T &item);\n\nprivate:\n  // For simplicity, we assume a fixed capacity\n  // and that the user of a MinQueue never exceeds\n  // this. This isn't a dynamic memory question :).\n  int data[10];\n\n  // number of valid items in the data array\n  int size;\n};\n\n```\nHere's an example of using a `MinQueue`:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n  q.push(6);\n  q.push(2);\n  q.push(5);\n\n  cout << q.min(); // prints 2\n\n  q.popMin(); // removes 2\n  cout << q.min(); // prints 5\n}\n```",
  "builder": [
    RANDOM_BY_TAG("tf_time_complexity", 1),
    RANDOM_BY_TAG("tf_containers_and_templates", 1),
    RANDOM_BY_TAG("tf_dynamic_memory_errors", 1),
    RANDOM_BY_TAG("tf_managing_dynamic_memory", 1),
    RANDOM_BY_TAG("tf_big_three", 1),
    RANDOM_BY_TAG("tf_linked-lists", 1),
    RANDOM_BY_TAG("tf_functional-recursion", 1),
    RANDOM_BY_TAG("tf_functors", 1)
  ]
}));

exam.addSection(new Section({
  "id": "fitb_section",
  "title": "FITB Section",
  "mk_description": "Here are some FITB questions",
  "mk_reference": "```cpp\n// You may assume type T supports ==, !=, <, <=, >, and >=\ntemplate <typename T>\nclass MinQueue { \npublic:\n  MinQueue() : size(0) { } // default ctor\n\n  // REQUIRES: the MinQueue is not empty\n  EFFECTS: Returns the minimum item, but\n  // does not remove it from the MinQueue\n  const T & min() const;\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Removes the minimum item from the MinQueue\n  void popMin();\n\n  // REQUIRES: the MinQueue is not full\n  // EFFECTS: Adds 'item' to the MinQueue\n  void push(const T &item);\n\nprivate:\n  // For simplicity, we assume a fixed capacity\n  // and that the user of a MinQueue never exceeds\n  // this. This isn't a dynamic memory question :).\n  int data[10];\n\n  // number of valid items in the data array\n  int size;\n};\n\n```\nHere's an example of using a `MinQueue`:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n  q.push(6);\n  q.push(2);\n  q.push(5);\n\n  cout << q.min(); // prints 2\n\n  q.popMin(); // removes 2\n  cout << q.min(); // prints 5\n}\n``` \n\ntest \n\n```cpp\n// You may assume type T supports ==, !=, <, <=, >, and >=\ntemplate <typename T>\nclass MinQueue { \npublic:\n  MinQueue() : size(0) { } // default ctor\n\n  // REQUIRES: the MinQueue is not empty\n  EFFECTS: Returns the minimum item, but\n  // does not remove it from the MinQueue\n  const T & min() const;\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Removes the minimum item from the MinQueue\n  void popMin();\n\n  // REQUIRES: the MinQueue is not full\n  // EFFECTS: Adds 'item' to the MinQueue\n  void push(const T &item);\n\nprivate:\n  // For simplicity, we assume a fixed capacity\n  // and that the user of a MinQueue never exceeds\n  // this. This isn't a dynamic memory question :).\n  int data[10];\n\n  // number of valid items in the data array\n  int size;\n};\n\n```\nHere's an example of using a `MinQueue`:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n  q.push(6);\n  q.push(2);\n  q.push(5);\n\n  cout << q.min(); // prints 2\n\n  q.popMin(); // removes 2\n  cout << q.min(); // prints 5\n}\n```",
  "builder": [
    BY_ID("fitb_test")
  ]
}));

exam.addSection(new Section({
  "id": "sas_section",
  "title": "SAS Section",
  "mk_description": "Here are some SAS questions",
  "mk_reference": "No reference material\n\n```cpp\ntest\n```\n\n for this question",
  "builder": [
    BY_ID("sas_test")
  ]
}));

let students = Papa.parse<{uniqname: string, name: string}>(readFileSync("roster/roster.csv", "utf8"), {header: true}).data;

let gen = new ExamGenerator(exam);
students.forEach(student => gen.assignRandomizedExam(student));

gen.writeAll(RenderMode.ORIGINAL);
