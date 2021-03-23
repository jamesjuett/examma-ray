import { SectionSpecification } from "../autograder";

export const S2_2_containers : SectionSpecification = {
  "id": "sp20_2_2_containers",
  "title": "Container ADTs",
  "mk_description": "Consider the class definition below (and in the reference material) for a container ADT called a `MinQueue`, which stores elements and allows you to find/remove the element with the lowest value. Such a data structure can be useful for a variety of applications where items should be processed in order according to priority, rather than the order that they are originally inserted.",
  "mk_reference": "```cpp\n// You may assume type T supports ==, !=, <, <=, >, and >=\ntemplate <typename T>\nclass MinQueue { \npublic:\n  MinQueue() : size(0) { } // default ctor\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Returns the minimum item, but\n  // does not remove it from the MinQueue\n  const T & min() const;\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Removes the minimum item from the MinQueue\n  void popMin();\n\n  // REQUIRES: the MinQueue is not full\n  // EFFECTS: Adds 'item' to the MinQueue\n  void push(const T &item);\n\nprivate:\n  // For simplicity, we assume a fixed capacity\n  // and that the user of a MinQueue never exceeds\n  // this. This isn't a dynamic memory question :).\n  int data[10];\n\n  // number of valid items in the data array\n  int size;\n};\n\n```\nHere's an example of using a `MinQueue`:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n  q.push(6);\n  q.push(2);\n  q.push(5);\n\n  cout << q.min(); // prints 2\n\n  q.popMin(); // removes 2\n  cout << q.min(); // prints 5\n}\n```",
  "content": [
    {
      "id": "sp20_2_2_part1",
      "tags": [],
      "points": 3,
      "mk_description": "Assume that we define the representation invariants for `MinQueue`'s data representation such that the first `size` elements of the `data` array contain the valid items in the `MinQueue`, and these elements are **sorted in descending order** (i.e. lower elements to the back). What is the time complexity for the most efficient algorithm to implement each of the following functions?",
      "response": {
        "kind": "fitb",
        "content": "________BLANK________ `min()`\n\n________BLANK________ `popMin()`\n\n________BLANK________ `push()`"
      }
    },
    {
      "id": "sp20_2_2_part2",
      "tags": [],
      "points": 6,
      "mk_description": "Write an implementation of the `push()` function. Your implementation must put the new element in the proper location to ensure that the sorting invariant is maintained. Use the code editor below to write your solution, but **do not** modify the function signature.",
      "response": {
        "kind": "code_editor",
        "language": "cpp",
        "starter": "// REQUIRES: the MinQueue is not full\n// EFFECTS: Adds 'item' to the MinQueue\nvoid push(const T &item) {\n\n\n}"
      }
    }
  ]
}