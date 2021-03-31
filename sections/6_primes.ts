import { RANDOM_ANY, Section } from "../src/exams";
import { SimpleMCGrader } from "../src/graders/SimpleMCGrader";

const PART_1 = RANDOM_ANY(1, [
  {
    "id": "sp20_primes_assignment_op_1",
    "tags": ["sp20_primes_assignment_op_group_1"],
    "points": 3,
    "mk_description": "```\nPrimes &operator=(const Primes &rhs) {\n  Primes temp(rhs); // copy ctor\n  num = temp.num;\n  data = temp.data;\n  return *this;\n}\n```",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "correct",
        "incorrect"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_primes_assignment_op_2",
    "tags": ["sp20_primes_assignment_op_group_1"],
    "points": 3,
    "mk_description": "```cpp\nPrimes &operator=(const Primes &rhs) {\n  Primes temp(rhs); // copy ctor\n  num = temp.num;\n  data = temp.data;\n  temp.data = nullptr;\n  return *this;\n}\n```",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "correct",
        "incorrect"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_primes_assignment_op_3",
    "tags": ["sp20_primes_assignment_op_group_1"],
    "points": 3,
    "mk_description": "```cpp\nPrimes &operator=(const Primes &rhs) {\n  Primes temp(rhs); // copy ctor\n  num = rhs.num;\n  temp.data = data;\n  data = rhs.data;\n  return *this;\n}\n```",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "correct",
        "incorrect"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_primes_assignment_op_4",
    "tags": ["sp20_primes_assignment_op_group_1"],
    "points": 3,
    "mk_description": "```cpp\nPrimes &operator=(const Primes &rhs) {\n  Primes temp(rhs); // copy ctor\n  num = temp.num;\n  int *newData = temp.data;\n  temp.data = data;\n  data = newData;\n  delete[] temp.data;\n  return *this;\n}\n```",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "correct",
        "incorrect"
      ],
      "multiple": false
    }
  }
]);



const PART_2 = RANDOM_ANY(1, [
  {
    "id": "sp20_primes_assignment_op_5",
    "tags": ["sp20_primes_assignment_op_group_2"],
    "points": 3,
    "mk_description": "```cpp\nPrimes &operator=(const Primes &rhs) {\n  Primes *temp = new Primes(rhs); // copy ctor\n  num = temp->num;\n  int *newData = temp->data;\n  temp->data = data;\n  delete temp;\n  data = newData;\n  return *this;\n}\n```",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "correct",
        "incorrect"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_primes_assignment_op_6",
    "tags": ["sp20_primes_assignment_op_group_2"],
    "points": 3,
    "mk_description": "```cpp\nPrimes &operator=(const Primes &rhs) {\n  Primes *temp = new Primes(rhs); // copy ctor\n  num = temp->num;\n  int *oldData = data;\n  data = temp->data;\n  temp->data = oldData;\n  delete temp;\n  return *this;\n}\n```",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "correct",
        "incorrect"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_primes_assignment_op_7",
    "tags": ["sp20_primes_assignment_op_group_2"],
    "points": 3,
    "mk_description": "```cpp\nPrimes &operator=(const Primes &rhs) {\n  delete[] data;\n  num = rhs.num;\n  Primes temp(rhs); // copy ctor\n  data = temp.data;\n  temp.data = nullptr;\n  return *this;\n}\n```",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "correct",
        "incorrect"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_primes_assignment_op_8",
    "tags": ["sp20_primes_assignment_op_group_2"],
    "points": 3,
    "mk_description": "```cpp\nPrimes &operator=(const Primes &rhs) {\n  Primes temp(rhs); // copy ctor\n  num = temp.num;\n  int *newData = temp.data;\n  temp.data = data;\n  data = newData;\n  return *this;\n}\n```",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "correct",
        "incorrect"
      ],
      "multiple": false
    }
  }
]);

export const S6_primes = new Section({
  "id": "6_primes",
  "title": "Primes",
  "mk_description": "Consider the class `Primes`, shown in the reference material, and each of the following potential implementations of the **assignment operator** for Primes. All compile successfully, but may or may not work correctly at runtime.\n\nIn order to work correctly, the assignment operator must perform a **deep copy** and must **avoid any memory errors, undefined behavior, or memory leaks.**\n\nIf the implementation works correctly, select \"**correct**\". Otherwise, select \"**incorrect**\".\n\nEach of these implementations attempts to **use the copy constructor as a \"helper\"** to implement the assignment operator. Even if the implementation seems **unusual**, be careful to thoroughly consider whether it works. It may be helpful to draw out a picture on scratch paper to help you trace the code.\n\nThe following facts may also be helpful (depending on the version of the question you get):\n\n-   If delete is used on a null pointer, nothing happens (and there is no error).\n    \n-   When a local object goes out of scope, its destructor is called.\n    \n-   You may assume the operator will never be used for self-assignment. Do not consider whether the implementation handles self-assignment when determining correctness.",
  "mk_reference": "```cpp\nclass Primes {\npublic:\n  // Constructor\n  Primes(int num)\n   : num(num), data(new int[num]) {\n    // fills data array with the\n    // first 'num' prime numbers\n  }\n\n  // Copy Constructor\n  Primes(const Primes &other)\n   : num(other.num), data(new int[other.num]) {\n    for(int i = 0; i < num; ++i) {\n      data[i] = other.data[i];\n    }\n  }\n\n  // Destructor\n  ~Primes() {\n    delete[] data;\n  }\n\n  // Assignment operator, to be implemented...\n  Primes & operator=(const Primes &rhs);\n\nprivate:\n  int num;\n  int *data;\n\n};\n\n```",
  "questions": [
    PART_1,
    PART_2
  ]
});



export const S6_primes_graders = {
  "sp20_primes_assignment_op_1": new SimpleMCGrader(1),
  "sp20_primes_assignment_op_2": new SimpleMCGrader(1),
  "sp20_primes_assignment_op_3": new SimpleMCGrader(1),
  "sp20_primes_assignment_op_4": new SimpleMCGrader(1),
  "sp20_primes_assignment_op_5": new SimpleMCGrader(0),
  "sp20_primes_assignment_op_6": new SimpleMCGrader(0),
  "sp20_primes_assignment_op_7": new SimpleMCGrader(0),
  "sp20_primes_assignment_op_8": new SimpleMCGrader(0),
}