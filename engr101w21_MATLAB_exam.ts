import { readFileSync } from 'fs';
import Papa from "papaparse";
import { AssignedExam, AssignedQuestion, Exam, Question, RANDOM_BY_TAG, RenderMode, Section } from "./autograder";
import { TF_QUESTIONS } from "./questions/tf";

// Create exam
let exam = new Exam({
  title: "ENGR 101 W21 MATLAB Exam",
  pointsPossible: 100,
  mk_intructions: readFileSync("instructions.md", "utf8")
});

// Add sections/content
exam.addSection(new Section({
  "id": "true_false",
  "title": "True/False",
  "mk_description": "Determine whether the following statements are true or false.",
  "mk_reference": "```cpp\n// You may assume type T supports ==, !=, <, <=, >, and >=\ntemplate <typename T>\nclass MinQueue { \npublic:\n  MinQueue() : size(0) { } // default ctor\n\n  // REQUIRES: the MinQueue is not empty\n  EFFECTS: Returns the minimum item, but\n  // does not remove it from the MinQueue\n  const T & min() const;\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Removes the minimum item from the MinQueue\n  void popMin();\n\n  // REQUIRES: the MinQueue is not full\n  // EFFECTS: Adds 'item' to the MinQueue\n  void push(const T &item);\n\nprivate:\n  // For simplicity, we assume a fixed capacity\n  // and that the user of a MinQueue never exceeds\n  // this. This isn't a dynamic memory question :).\n  int data[10];\n\n  // number of valid items in the data array\n  int size;\n};\n\n```\nHere's an example of using a `MinQueue`:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n  q.push(6);\n  q.push(2);\n  q.push(5);\n\n  cout << q.min(); // prints 2\n\n  q.popMin(); // removes 2\n  cout << q.min(); // prints 5\n}\n``` \n\ntest \n\n```cpp\n// You may assume type T supports ==, !=, <, <=, >, and >=\ntemplate <typename T>\nclass MinQueue { \npublic:\n  MinQueue() : size(0) { } // default ctor\n\n  // REQUIRES: the MinQueue is not empty\n  EFFECTS: Returns the minimum item, but\n  // does not remove it from the MinQueue\n  const T & min() const;\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Removes the minimum item from the MinQueue\n  void popMin();\n\n  // REQUIRES: the MinQueue is not full\n  // EFFECTS: Adds 'item' to the MinQueue\n  void push(const T &item);\n\nprivate:\n  // For simplicity, we assume a fixed capacity\n  // and that the user of a MinQueue never exceeds\n  // this. This isn't a dynamic memory question :).\n  int data[10];\n\n  // number of valid items in the data array\n  int size;\n};\n\n```\nHere's an example of using a `MinQueue`:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n  q.push(6);\n  q.push(2);\n  q.push(5);\n\n  cout << q.min(); // prints 2\n\n  q.popMin(); // removes 2\n  cout << q.min(); // prints 5\n}\n```",
  "builder": [
    RANDOM_BY_TAG("time_complexity", 3),
    RANDOM_BY_TAG("containers_and_templates", 2)
  ]
}));

exam.addSection(new Section({
  "id": "another_section",
  "title": "Another Section",
  "mk_description": "Determine whether the following statements are true or false.",
  "mk_reference": "```cpp\n// You may assume type T supports ==, !=, <, <=, >, and >=\ntemplate <typename T>\nclass MinQueue { \npublic:\n  MinQueue() : size(0) { } // default ctor\n\n  // REQUIRES: the MinQueue is not empty\n  EFFECTS: Returns the minimum item, but\n  // does not remove it from the MinQueue\n  const T & min() const;\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Removes the minimum item from the MinQueue\n  void popMin();\n\n  // REQUIRES: the MinQueue is not full\n  // EFFECTS: Adds 'item' to the MinQueue\n  void push(const T &item);\n\nprivate:\n  // For simplicity, we assume a fixed capacity\n  // and that the user of a MinQueue never exceeds\n  // this. This isn't a dynamic memory question :).\n  int data[10];\n\n  // number of valid items in the data array\n  int size;\n};\n\n```\nHere's an example of using a `MinQueue`:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n  q.push(6);\n  q.push(2);\n  q.push(5);\n\n  cout << q.min(); // prints 2\n\n  q.popMin(); // removes 2\n  cout << q.min(); // prints 5\n}\n``` \n\ntest \n\n```cpp\n// You may assume type T supports ==, !=, <, <=, >, and >=\ntemplate <typename T>\nclass MinQueue { \npublic:\n  MinQueue() : size(0) { } // default ctor\n\n  // REQUIRES: the MinQueue is not empty\n  EFFECTS: Returns the minimum item, but\n  // does not remove it from the MinQueue\n  const T & min() const;\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Removes the minimum item from the MinQueue\n  void popMin();\n\n  // REQUIRES: the MinQueue is not full\n  // EFFECTS: Adds 'item' to the MinQueue\n  void push(const T &item);\n\nprivate:\n  // For simplicity, we assume a fixed capacity\n  // and that the user of a MinQueue never exceeds\n  // this. This isn't a dynamic memory question :).\n  int data[10];\n\n  // number of valid items in the data array\n  int size;\n};\n\n```\nHere's an example of using a `MinQueue`:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n  q.push(6);\n  q.push(2);\n  q.push(5);\n\n  cout << q.min(); // prints 2\n\n  q.popMin(); // removes 2\n  cout << q.min(); // prints 5\n}\n```",
  "builder": [
    RANDOM_BY_TAG("dynamic_memory", 4)
  ]
}));

TF_QUESTIONS.forEach(q => exam.registerQuestion(new Question(q)));

let students = Papa.parse<{uniqname: string, name: string}>(readFileSync("roster/roster.csv", "utf8"), {header: true}).data;

// Run autograder (what is run is configured by command line args)
students.forEach(student => exam.assignRandomizedExam(student));

exam.render(RenderMode.ORIGINAL);
