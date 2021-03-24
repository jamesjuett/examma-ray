import { RANDOM_ANY, Section, SectionSpecification } from "../src/exams";
import { FITBRegexGrader } from "../src/graders/common";

export const S5_dynamic_memory: SectionSpecification = {
  "id": "sp20_5_dynamic_memory",
  "title": "Dynamic Memory",
  "mk_description": "Several main functions are given below. **All compile successfully**. For each, determine if a runtime error might occur during their execution.\n\nIn the first box, choose the best answer from one of the following (feel free to copy and paste so you don't have to retype):\n\n - no error\n - memory leak\n - incorrect delete\n - use of uninitialized value\n - dereferencing a null pointer\n - use of dead object\n\nIf there is no error, write the output of the program in the second box.  Otherwise if there is an error, write a brief explanation of the error in the second box.",
  "content": RANDOM_ANY(3,[
    {
      "id": "sp20_5_v1",
      "points": 2,
      "mk_description": "```cpp\nint main() {\n  int *a = new int(7);\n  int &b = *a;\n  delete a;\n  cout << b << endl;\n}\n\n```",
      "response": {
        "kind": "fitb",
        "content": "Type of error (or no error):\n\n________________BLANK________________\n\n Output or explanation:\n\n[[BOX\n\n\n\n]]\n\n"
      }
    },
    {
      "id": "sp20_5_v2",
      "points": 2,
      "mk_description": "```cpp\nint main() {\n  int *a;\n  int *b = new int(1);\n  a = b;\n  b = a;\n  cout << *a << \" \" << *b << endl;\n  delete a;\n  delete b;\n}\n\n```",
      "response": {
        "kind": "fitb",
        "content": "Type of error (or no error):\n\n________________BLANK________________\n\n Output or explanation:\n\n[[BOX\n\n\n\n]]\n\n"
      }
    },
    {
      "id": "sp20_5_v3",
      "points": 2,
      "mk_description": "```cpp\nint main() {\n  int *a = new int(6);\n  cout << *a << endl;\n  delete a;\n  a = new int[7];\n  *a = 3;\n  cout << *a << endl;\n  delete a;\n}\n\n```",
      "response": {
        "kind": "fitb",
        "content": "Type of error (or no error):\n\n________________BLANK________________\n\n Output or explanation:\n\n[[BOX\n\n\n\n]]\n\n"
      }
    },
    {
      "id": "sp20_5_v4",
      "points": 2,
      "mk_description": "```cpp\nint main() {\n  int *a = new int(54);\n  *a = *new int(10);\n  cout << *a << endl;\n  delete a;\n}\n\n```",
      "response": {
        "kind": "fitb",
        "content": "Type of error (or no error):\n\n________________BLANK________________\n\n Output or explanation:\n\n[[BOX\n\n\n\n]]\n\n"
      }
    },
    {
      "id": "sp20_5_v5",
      "points": 2,
      "mk_description": "```cpp\nint main() {\n  int *a = new int(32);\n  int *b = new int(64);\n  delete a;\n  *a = *b;\n  cout << *a << endl;\n  delete b;\n}\n\n```",
      "response": {
        "kind": "fitb",
        "content": "Type of error (or no error):\n\n________________BLANK________________\n\n Output or explanation:\n\n[[BOX\n\n\n\n]]\n\n"
      }
    },
    {
      "id": "sp20_5_v6",
      "points": 2,
      "mk_description": "```cpp\nint main() {\n  int *ptr = new int(18);\n  int **ptr_ptr = new int *(ptr);\n  cout << **ptr_ptr << endl;\n  delete ptr;\n}\n\n```",
      "response": {
        "kind": "fitb",
        "content": "Type of error (or no error):\n\n________________BLANK________________\n\n Output or explanation:\n\n[[BOX\n\n\n\n]]\n\n"
      }
    }
  ])
}

export const S5_Dynamic_Memory_Graders = {
  "sp20_5_v1" : new FITBRegexGrader([
    {
      title: "Identify Error",
      blankIndex: 1,
      description: "",
      points: 2,
      solution: "use of dead object",
      patterns: [
        {
          pattern: /.*dead.*object.*/i,
          explanation: "Correct!",
          points: 2
        }
      ]
    },
    {
      title: "Explanation",
      blankIndex: 2,
      description: "",
      points: 2,
      solution: "The reference b refers to the object that was previously deleted through the pointer a.",
      patterns: [
        {
          pattern: /.*/,
          explanation: "Correct!",
          points: 2
        }
      ]
    }
  ]),
  "sp20_5_v2" : new FITBRegexGrader([
    {
      title: "Identify Error",
      blankIndex: 1,
      description: "",
      points: 2,
      solution: "incorrect delete",
      patterns: [
        { pattern: /.*incorrect.*delete.*/i, explanation: "Correct!", points: 2 },
        { pattern: /.*double.*delete.*/i, explanation: "Correct!", points: 2 },
        { pattern: /.*double.*free.*/i, explanation: "Correct!", points: 2 }
      ]
    },
    {
      title: "Explanation",
      blankIndex: 2,
      description: "",
      points: 2,
      solution: "Both a and b end up pointing to the same object, so deleting through both results in a double delete.",
      patterns: [
        {
          pattern: /.*/,
          explanation: "Correct!",
          points: 2
        }
      ]
    }
  ]),
  "sp20_5_v3" : new FITBRegexGrader([
    {
      title: "Identify Error",
      blankIndex: 1,
      description: "",
      points: 2,
      solution: "incorrect delete",
      patterns: [
        {
          pattern: /.*incorrect.*delete.*/i,
          explanation: "Correct!",
          points: 2
        }
      ]
    },
    {
      title: "Explanation",
      blankIndex: 2,
      description: "",
      points: 2,
      solution: "The pointer a ends up pointing to a dynamically allocated array, which is incorrectly deleted with delete (rather than delete[])",
      patterns: [
        {
          pattern: /.*/,
          explanation: "Correct!",
          points: 2
        }
      ]
    }
  ]),
  "sp20_5_v4" : new FITBRegexGrader([
    {
      title: "Identify Error",
      blankIndex: 1,
      description: "",
      points: 2,
      solution: "memory leak",
      patterns: [
        {
          pattern: /.*memory.*leak.*/i,
          explanation: "Correct!",
          points: 2
        }
      ]
    },
    {
      title: "Explanation",
      blankIndex: 2,
      description: "",
      points: 2,
      solution: "The second line allocates an int with value 10 on the heap, but the address to this int is not kept.",
      patterns: [
        {
          pattern: /.*/,
          explanation: "Correct!",
          points: 2
        }
      ]
    }
  ]),
  "sp20_5_v5" : new FITBRegexGrader([
    {
      title: "Identify Error",
      blankIndex: 1,
      description: "",
      points: 2,
      solution: "use of dead object",
      patterns: [
        {
          pattern: /.*dead.*object.*/i,
          explanation: "Correct!",
          points: 2
        }
      ]
    },
    {
      title: "Explanation",
      blankIndex: 2,
      description: "",
      points: 2,
      solution: "After the object a points to is deleted, it is not safe to assign to that dead object with *a = *b;",
      patterns: [
        {
          pattern: /.*/,
          explanation: "Correct!",
          points: 2
        }
      ]
    }
  ]),
  "sp20_5_v6" : new FITBRegexGrader([
    {
      title: "Identify Error",
      blankIndex: 1,
      description: "",
      points: 2,
      solution: "memory leak",
      patterns: [
        {
          pattern: /.*memory.*leak.*/i,
          explanation: "Correct!",
          points: 2
        }
      ]
    },
    {
      title: "Explanation",
      blankIndex: 2,
      description: "",
      points: 2,
      solution: "The object pointed to by ptr_ptr is not cleaned up with delete.",
      patterns: [
        {
          pattern: /.*/,
          explanation: "Correct!",
          points: 2
        }
      ]
    }
  ]),
}
