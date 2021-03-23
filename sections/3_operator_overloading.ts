import { RANDOM_ANY, RANDOM_BY_TAG, SectionSpecification } from "../autograder";

export const S3_operator_overloading : SectionSpecification = {
  "id": "sp20_3_operator_overloading",
  "title": "Operator Overloading",
  "mk_description": "Consider again the class definition from section 2 for a container ADT called a `MinQueue` (also repeated in the reference material here).",
  "mk_reference": "```cpp\n// You may assume type T supports ==, !=, <, <=, >, and >=\ntemplate <typename T>\nclass MinQueue { \npublic:\n  MinQueue() : size(0) { } // default ctor\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Returns the minimum item, but\n  // does not remove it from the MinQueue\n  const T & min() const;\n\n  // REQUIRES: the MinQueue is not empty\n  // EFFECTS: Removes the minimum item from the MinQueue\n  void popMin();\n\n  // REQUIRES: the MinQueue is not full\n  // EFFECTS: Adds 'item' to the MinQueue\n  void push(const T &item);\n\nprivate:\n  // For simplicity, we assume a fixed capacity\n  // and that the user of a MinQueue never exceeds\n  // this. This isn't a dynamic memory question :).\n  int data[10];\n\n  // number of valid items in the data array\n  int size;\n};\n\n```",
  "content": RANDOM_ANY(1,[
    {
      "id": "sp20_3_1",
      "tags": [],
      "points": 6,
      "mk_description": "Implement an overloaded `--` operator (prefix decrement) for `MinQueue`. The operator should be implemented as a **non-member** function and should remove the minimum element (you may call `popMin()` in your implementation). The operator should evaluate back into the `MinQueue` object, so that multiple `--` operations may be chained.\n\nFor example:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n  q.push(6);\n  q.push(2);\n  q.push(5);\n  q.push(10);\n  cout << q.min(); // prints 2\n\n  --q; // removes 2\n  cout << q.min(); // prints 5\n\n  ----q; // removes 5 and 6\n  cout << q.min(); // prints 10\n}\n\n```\nImplement the `--` operator overload as a **non-member** function in the box below. Note the template header already provided for you, and that you should use `MinQueue<T>` (rather than just `MinQueue`) in your code.",
      "response": {
        "kind": "code_editor",
        "language": "cpp",
        "starter": "template <typename T>\n"
      }
    },
    {
      "id": "sp20_3_2",
      "tags": [],
      "points": 6,
      "mk_description": "Implement an overloaded `+=` operator for `MinQueue`. The operator should be implemented as a **non-member** function and should add the right-hand side operand as a new element to the `MinQueue` on the left-hand side (you may call `push()` in your implementation). The operator should evaluate back into the `MinQueue` object, so that multiple `+=` operations may be chained.\n\nFor example:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n\n  q += 6;\n  // q contains 6\n\n  (q += 2) += 5;\n  // q contains 6, 2, and 5\n}\n\n```\nImplement the `+=` operator overload as a **non-member** function in the box below. Note the template header already provided for you, and that you should use `MinQueue<T>` (rather than just `MinQueue`) in your code.",
      "response": {
        "kind": "code_editor",
        "language": "cpp",
        "starter": "template <typename T>\n"
      }
    },
    {
      "id": "sp20_3_3",
      "tags": [],
      "points": 6,
      "mk_description": "Implement an overloaded `<<` operator for `MinQueue`. The operator should be implemented as a **non-member** function and should add the right-hand side operand as a new element to the `MinQueue` on the left-hand side (you may call `push()` in your implementation). The operator should evaluate back into the `MinQueue` object, so that multiple `<<` operations may be chained.\n\nFor example:\n\n```cpp\nint main() {\n  MinQueue<int> q;\n\n  q << 6;\n  // q contains 6\n\n  q << 2 << 5;\n  // q contains 6, 2, and 5\n}\n\n```\nImplement the `<<` operator overload as a **non-member** function in the box below. Note the template header already provided for you, and that you should use `MinQueue<T>` (rather than just `MinQueue`) in your code.",
      "response": {
        "kind": "code_editor",
        "language": "cpp",
        "starter": "template <typename T>\n"
      }
    },
    {
      "id": "sp20_3_4",
      "tags": [],
      "points": 6,
      "mk_description": "Implement an overloaded `==` operator for `MinQueue`. The operator should be implemented as a **non-member** function and compare two `MinQueue` objects, one on the right-hand side and one on the left-hand side. It should return true if the **minimum elements from the two `MinQueue` objects are the same**, regardless of what other elements they contain (you may call `min()` in your implementation), and false otherwise.\n\nFor example:\n\n```cpp\nint main() {\n  MinQueue<int> q1;\n  q1.push(6);\n  q1.push(2);\n  q1.push(5);\n\n  MinQueue<int> q2;\n  q1.push(8);\n  q1.push(4);\n  q1.push(2);\n\n  cout << (q1 == q2); // true\n\n  q1.popMin(); // removes 2 from q1\n  cout << (q1 == q2); // now it's false\n}\n\n```\nImplement the `==` operator overload as a **non-member** function in the box below. Note the template header already provided for you, and that you should use `MinQueue<T>` (rather than just `MinQueue`) in your code.",
      "response": {
        "kind": "code_editor",
        "language": "cpp",
        "starter": "template <typename T>\n"
      }
    }
  ])
}