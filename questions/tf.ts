import { QuestionSpecification } from "../autograder";

export const TF_QUESTIONS : QuestionSpecification[] = [
  {
    "id": "sp20_mc_time_complexity_1",
    "tags": [ "time_complexity" ],
    "points": 1,
    "mk_description": "**Time Complexity**\n\nPrinting all the elements in an array has linear O(n) time complexity.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_time_complexity_2",
    "tags": [ "time_complexity" ],
    "points": 1,
    "mk_description": "**Time Complexity**\n\nFinding the element at index `i` in an array has constant O(1) time complexity.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_time_complexity_3",
    "tags": [ "time_complexity" ],
    "points": 1,
    "mk_description": "**Time Complexity**\n\nAssuming a data structure uses an array to store an ordered sequence of elements and keeps track of the number of elements, removing the last element from the sequence has constant O(1) time complexity.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_time_complexity_4",
    "tags": [ "time_complexity" ],
    "points": 1,
    "mk_description": "**Time Complexity**\n\nAssuming a data structure uses an array to store an ordered sequence of elements and keeps track of the number of elements, removing an element from the middle of the sequence has constant O(1) time complexity.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_time_complexity_5",
    "tags": [ "time_complexity" ],
    "points": 1,
    "mk_description": "**Time Complexity**\n\nGiven a pointer to an element in the middle of an array, removing that element from the array has constant O(1) time complexity.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_containers_and_templates_1",
    "tags": [ "containers_and_templates" ],
    "points": 1,
    "mk_description": "**Containers and Templates**\n\nA set based on a sorted array has better time complexity for a `contains()` operation, but worse time complexity for `insert()` and `remove()` when compared to a set based on an unsorted array.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_containers_and_templates_2",
    "tags": [ "containers_and_templates" ],
    "points": 1,
    "mk_description": "**Containers and Templates**\n\nA set based on a sorted array has better time complexity for a `contains()` operation, but the same time complexity for `insert()` and `remove()` when compared to a set based on an unsorted array.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_containers_and_templates_3",
    "tags": [ "containers_and_templates" ],
    "points": 1,
    "mk_description": "**Containers and Templates**\n\nAn instance of a container class with a template parameter for its element type may contain several different kinds of objects at runtime.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_containers_and_templates_4",
    "tags": [ "containers_and_templates" ],
    "points": 1,
    "mk_description": "**Containers and Templates**\n\nAn instance of a container class with a template parameter for its element type must choose the type of element it contains at compile_time, and this cannot be changed at runtime.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_representation_invariants_1",
    "tags": [ "representation_invariants" ],
    "points": 1,
    "mk_description": "**Representation Invariants**\n\nRepresentation invariants are used to specify the C++ type of an ADT's member variables. ",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_representation_invariants_2",
    "tags": [ "representation_invariants" ],
    "points": 1,
    "mk_description": "**Representation Invariants**\n\nIf an ADT's representation invariants are broken, a compile error results.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_representation_invariants_3",
    "tags": [ "representation_invariants" ],
    "points": 1,
    "mk_description": "**Representation Invariants**\n\nIf an ADT's representation invariants are broken, even a correct implementation of a member function may crash.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_representation_invariants_4",
    "tags": [ "representation_invariants" ],
    "points": 1,
    "mk_description": "**Representation Invariants**\n\nA correct implementation of an ADT's member function must contain code to handle situations in which the ADT's representation invariants are broken, in order to prevent undefined behavior.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_representation_invariants_5",
    "tags": [ "representation_invariants" ],
    "points": 1,
    "mk_description": "**Representation Invariants**\n\nAn ADT's member function may temporarily break its representation invariants, as long as they are restored by the time it returns.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_dynamic_memory_1",
    "tags": [ "dynamic_memory" ],
    "points": 1,
    "mk_description": "**Dynamic Memory**\n\nAll objects allocated with `new` have their own, independent lifetime.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_dynamic_memory_2",
    "tags": [ "dynamic_memory" ],
    "points": 1,
    "mk_description": "**Dynamic Memory**\n\nThe `delete[]` syntax is used to delete an element at a specific index from a dynamically allocated array.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_dynamic_memory_3",
    "tags": [ "dynamic_memory" ],
    "points": 1,
    "mk_description": "**Dynamic Memory**\n\nA `new` expression evaluates to a reference to the newly allocated object on the heap.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_dynamic_memory_4",
    "tags": [ "dynamic_memory" ],
    "points": 1,
    "mk_description": "**Dynamic Memory**\n\nAfter `delete` is used on a pointer, that pointer becomes null.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_dynamic_memory_5",
    "tags": [ "dynamic_memory" ],
    "points": 1,
    "mk_description": "**Dynamic Memory**\n\nA dynamically allocated array on the heap may change size.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_dynamic_memory_2_1",
    "tags": [ "dynamic_memory_2" ],
    "points": 1,
    "mk_description": "**Dynamic Memory 2**\n\nTo avoid memory leaks, all pointers to objects on the heap must be set to `nullptr` before they go out of scope.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_dynamic_memory_2_2",
    "tags": [ "dynamic_memory_2" ],
    "points": 1,
    "mk_description": "**Dynamic Memory 2**\n\nOnce `delete` is used through a pointer, that pointer is dangling and cannot safely be used to point to a new dynamically allocated object.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_dynamic_memory_2_3",
    "tags": [ "dynamic_memory_2" ],
    "points": 1,
    "mk_description": "**Dynamic Memory 2**\n\nAll dangling pointers must be set to `nullptr` before they go out of scope to avoid a double delete on the previously freed object they still point to.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_dynamic_memory_2_4",
    "tags": [ "dynamic_memory_2" ],
    "points": 1,
    "mk_description": "**Dynamic Memory 2**\n\nAssuming `ptr` is a pointer, `delete ptr;` may result in a double free even if it is the first time the expression `delete ptr;` was used.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_dynamic_memory_2_5",
    "tags": [ "dynamic_memory_2" ],
    "points": 1,
    "mk_description": "**Dynamic Memory 2**\n\nIf a dynamic integer object was allocated with `int * ptr = new int(3);` then that dynamic integer is always leaked unless `delete ptr;` is used before `ptr` goes out of scope.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_managing_dynamic_memory_1",
    "tags": [ "managing_dynamic_memory" ],
    "points": 1,
    "mk_description": "**Managing Dynamic Memory**\n\nThe only time a destructor is called is when a local object goes out of scope.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_managing_dynamic_memory_2",
    "tags": [ "managing_dynamic_memory" ],
    "points": 1,
    "mk_description": "**Managing Dynamic Memory**\n\nAn instance of a class type cannot be allocated on the heap unless it has a custom destructor implementation.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_managing_dynamic_memory_3",
    "tags": [ "managing_dynamic_memory" ],
    "points": 1,
    "mk_description": "**Managing Dynamic Memory**\n\nIn order to prevent memory leaks, a program's source code must contain exactly the same number of `new` and `delete` expressions.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_managing_dynamic_memory_4",
    "tags": [ "managing_dynamic_memory" ],
    "points": 1,
    "mk_description": "**Managing Dynamic Memory**\n\nIf a class contains member variables that also have class type, the destructors for those members are implicity called when the overall object's lifetime ends.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_managing_dynamic_memory_5",
    "tags": [ "managing_dynamic_memory" ],
    "points": 1,
    "mk_description": "**Managing Dynamic Memory**\n\nIf a class contains any member variables with pointer type, its destructor must always `delete` through each of those pointers to prevent memory leaks.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_big_three_1",
    "tags": [ "big_three" ],
    "points": 1,
    "mk_description": "**The Big Three**\n\nA custom copy constructor generally never needs to use the `delete` keyword.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_big_three_2",
    "tags": [ "big_three" ],
    "points": 1,
    "mk_description": "**The Big Three**\n\nA custom assignment operator should always use a member_initializer_list if possible.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_big_three_3",
    "tags": [ "big_three" ],
    "points": 1,
    "mk_description": "**The Big Three**\n\nThe `other` parameter for the copy constructor does not need to be pass_by_const reference, but it is more efficient to do so.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_big_three_4",
    "tags": [ "big_three" ],
    "points": 1,
    "mk_description": "**The Big Three**\n\nA memory leak is the most common problem caused by a shallow copy of a dynamically allocated resource.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  },
  {
    "id": "sp20_mc_big_three_5",
    "tags": [ "big_three" ],
    "points": 1,
    "mk_description": "**The Big Three**\n\nA shallow copy of dynamically allocated resources may cause a double free when the copied objects are cleaned up.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "maxSelections": 1,
      "multiple": false
    },
    "code_language": "cpp"
  }
];



































