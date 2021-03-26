import { QuestionBank } from "../src/exams";

export const TF_QUESTIONS = new QuestionBank([
  {
    "id": "sp20_mc_time_complexity_1",
    "tags": ["tf_time_complexity"],
    "points": 1,
    "mk_description": "**Time Complexity**\n\nPrinting all the elements in an array has linear O(n) time complexity.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_time_complexity_2",
    "tags": ["tf_time_complexity"],
    "points": 1,
    "mk_description": "**Time Complexity**\n\nFinding the element at index `i` in an array has constant O(1) time complexity.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_time_complexity_3",
    "tags": ["tf_time_complexity"],
    "points": 1,
    "mk_description": "**Time Complexity**\n\nAssuming a data structure uses an array to store an ordered sequence of elements and keeps track of the number of elements, removing the last element from the sequence has constant O(1) time complexity.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_time_complexity_4",
    "tags": ["tf_time_complexity"],
    "points": 1,
    "mk_description": "**Time Complexity**\n\nAssuming a data structure uses an array to store an ordered sequence of elements and keeps track of the number of elements, removing an element from the middle of the sequence has constant O(1) time complexity.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_time_complexity_5",
    "tags": ["tf_time_complexity"],
    "points": 1,
    "mk_description": "**Time Complexity**\n\nGiven a pointer to an element in the middle of an array, removing that element from the array has constant O(1) time complexity.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_containers_and_templates_1",
    "tags": ["tf_containers_and_templates"],
    "points": 1,
    "mk_description": "**Containers and Templates**\n\nA set based on a sorted array has better time complexity for a `contains()` operation, but worse time complexity for `insert()` and `remove()` when compared to a set based on an unsorted array.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_containers_and_templates_2",
    "tags": ["tf_containers_and_templates"],
    "points": 1,
    "mk_description": "**Containers and Templates**\n\nA set based on a sorted array has better time complexity for a `contains()` operation, but the same time complexity for `insert()` and `remove()` when compared to a set based on an unsorted array.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_containers_and_templates_3",
    "tags": ["tf_containers_and_templates"],
    "points": 1,
    "mk_description": "**Containers and Templates**\n\nAn instance of a container class with a template parameter for its element type may contain several different kinds of objects at runtime.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_containers_and_templates_4",
    "tags": ["tf_containers_and_templates"],
    "points": 1,
    "mk_description": "**Containers and Templates**\n\nAn instance of a container class with a template parameter for its element type must choose the type of element it contains at compile_time, and this cannot be changed at runtime.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_representation_invariants_1",
    "tags": ["tf_representation_invariants"],
    "points": 1,
    "mk_description": "**Representation Invariants**\n\nRepresentation invariants are used to specify the C++ type of an ADT's member variables. ",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_representation_invariants_2",
    "tags": ["tf_representation_invariants"],
    "points": 1,
    "mk_description": "**Representation Invariants**\n\nIf an ADT's representation invariants are broken, a compile error results.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_representation_invariants_3",
    "tags": ["tf_representation_invariants"],
    "points": 1,
    "mk_description": "**Representation Invariants**\n\nIf an ADT's representation invariants are broken, even a correct implementation of a member function may crash.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_representation_invariants_4",
    "tags": ["tf_representation_invariants"],
    "points": 1,
    "mk_description": "**Representation Invariants**\n\nA correct implementation of an ADT's member function must contain code to handle situations in which the ADT's representation invariants are broken, in order to prevent undefined behavior.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_representation_invariants_5",
    "tags": ["tf_representation_invariants"],
    "points": 1,
    "mk_description": "**Representation Invariants**\n\nAn ADT's member function may temporarily break its representation invariants, as long as they are restored by the time it returns.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_dynamic_memory_1",
    "tags": ["tf_dynamic_memory"],
    "points": 1,
    "mk_description": "**Dynamic Memory**\n\nAll objects allocated with `new` have their own, independent lifetime.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_dynamic_memory_2",
    "tags": ["tf_dynamic_memory"],
    "points": 1,
    "mk_description": "**Dynamic Memory**\n\nThe `delete[]` syntax is used to delete an element at a specific index from a dynamically allocated array.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_dynamic_memory_3",
    "tags": ["tf_dynamic_memory"],
    "points": 1,
    "mk_description": "**Dynamic Memory**\n\nA `new` expression evaluates to a reference to the newly allocated object on the heap.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_dynamic_memory_4",
    "tags": ["tf_dynamic_memory"],
    "points": 1,
    "mk_description": "**Dynamic Memory**\n\nAfter `delete` is used on a pointer, that pointer becomes null.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_dynamic_memory_5",
    "tags": ["tf_dynamic_memory"],
    "points": 1,
    "mk_description": "**Dynamic Memory**\n\nA dynamically allocated array on the heap may change size.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_dynamic_memory_errors_1",
    "tags": ["tf_dynamic_memory_errors"],
    "points": 1,
    "mk_description": "**Dynamic Memory Errors**\n\nTo avoid memory leaks, all pointers to objects on the heap must be set to `nullptr` before they go out of scope.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_dynamic_memory_errors_2",
    "tags": ["tf_dynamic_memory_errors"],
    "points": 1,
    "mk_description": "**Dynamic Memory Errors**\n\nOnce `delete` is used through a pointer, that pointer is dangling and cannot safely be used to point to a new dynamically allocated object.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_dynamic_memory_errors_3",
    "tags": ["tf_dynamic_memory_errors"],
    "points": 1,
    "mk_description": "**Dynamic Memory Errors**\n\nAll dangling pointers must be set to `nullptr` before they go out of scope to avoid a double delete on the previously freed object they still point to.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_dynamic_memory_errors_4",
    "tags": ["tf_dynamic_memory_errors"],
    "points": 1,
    "mk_description": "**Dynamic Memory Errors**\n\nAssuming `ptr` is a pointer, `delete ptr;` may result in a double free even if it is the first time the expression `delete ptr;` was used.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_dynamic_memory_errors_5",
    "tags": ["tf_dynamic_memory_errors"],
    "points": 1,
    "mk_description": "**Dynamic Memory Errors**\n\nIf a dynamic integer object was allocated with `int * ptr = new int(3);` then that dynamic integer is always leaked unless `delete ptr;` is used before `ptr` goes out of scope.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_managing_dynamic_memory_1",
    "tags": ["tf_managing_dynamic_memory"],
    "points": 1,
    "mk_description": "**Managing Dynamic Memory**\n\nThe only time a destructor is called is when a local object goes out of scope.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_managing_dynamic_memory_2",
    "tags": ["tf_managing_dynamic_memory"],
    "points": 1,
    "mk_description": "**Managing Dynamic Memory**\n\nAn instance of a class type cannot be allocated on the heap unless it has a custom destructor implementation.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_managing_dynamic_memory_3",
    "tags": ["tf_managing_dynamic_memory"],
    "points": 1,
    "mk_description": "**Managing Dynamic Memory**\n\nIn order to prevent memory leaks, a program's source code must contain exactly the same number of `new` and `delete` expressions.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_managing_dynamic_memory_4",
    "tags": ["tf_managing_dynamic_memory"],
    "points": 1,
    "mk_description": "**Managing Dynamic Memory**\n\nIf a class contains member variables that also have class type, the destructors for those members are implicity called when the overall object's lifetime ends.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_managing_dynamic_memory_5",
    "tags": ["tf_managing_dynamic_memory"],
    "points": 1,
    "mk_description": "**Managing Dynamic Memory**\n\nIf a class contains any member variables with pointer type, its destructor must always `delete` through each of those pointers to prevent memory leaks.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_big_three_1",
    "tags": ["tf_big_three"],
    "points": 1,
    "mk_description": "**The Big Three**\n\nA custom copy constructor generally never needs to use the `delete` keyword.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_big_three_2",
    "tags": ["tf_big_three"],
    "points": 1,
    "mk_description": "**The Big Three**\n\nA custom assignment operator should always use a member-initializer-list if possible.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_big_three_3",
    "tags": ["tf_big_three"],
    "points": 1,
    "mk_description": "**The Big Three**\n\nThe `other` parameter for the copy constructor does not need to be pass-by-reference (or pass-by-reference-to-const), but it is more efficient to do so.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_big_three_4",
    "tags": ["tf_big_three"],
    "points": 1,
    "mk_description": "**The Big Three**\n\nA memory leak is the most common problem caused by a shallow copy of a dynamically allocated resource.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_mc_big_three_5",
    "tags": ["tf_big_three"],
    "points": 1,
    "mk_description": "**The Big Three**\n\nA shallow copy of dynamically allocated resources may cause a double free when the copied objects are cleaned up.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_linked-lists_1",
    "tags": ["tf_linked-lists"],
    "points": 1,
    "mk_description": "**Linked Lists**\n\nAn invariant of linked lists is that the final next pointer is set to null.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_linked-lists_2",
    "tags": ["tf_linked-lists"],
    "points": 1,
    "mk_description": "**Linked Lists**\n\nStoring a set of unique objects in a linked list takes up more memory than storing them in a binary tree.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_iterators_1",
    "tags": ["tf_iterators"],
    "points": 1,
    "mk_description": "**Iterators**\n\nAll iterators must have custom implementations of the Big Three.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_iterators_2",
    "tags": ["tf_iterators"],
    "points": 1,
    "mk_description": "**Iterators**\n\nIterators provide a common interface to traverse through containers.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_iterators_3",
    "tags": ["tf_iterators"],
    "points": 1,
    "mk_description": "**Iterators**\n\nIterators hide implementation details of a container ADT.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_iterators_4",
    "tags": ["tf_iterators"],
    "points": 1,
    "mk_description": "**Iterators**\n\nRange based for loops are translated into traversals by iterator.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_functional-recursion_1",
    "tags": ["tf_functional-recursion"],
    "points": 1,
    "mk_description": "**Recursion & Tail Recursion**\n\nTail-recursive functions can also be tree recursive.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_functional-recursion_2",
    "tags": ["tf_functional-recursion"],
    "points": 1,
    "mk_description": "**Recursion & Tail Recursion**\n\nIf a recursive call is on the last line of a function, then the function is always tail recursive.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_functional-recursion_3",
    "tags": ["tf_functional-recursion"],
    "points": 1,
    "mk_description": "**Recursion & Tail Recursion**\n\nAny recursive function can be made tail recursive.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_functional-recursion_4",
    "tags": ["tf_functional-recursion"],
    "points": 1,
    "mk_description": "**Recursion & Tail Recursion**\n\nA tail recursive function must have exactly 1 base case.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_structural-recursion_1",
    "tags": ["tf_structural-recursion"],
    "points": 1,
    "mk_description": "**Structural Recursion**\n\nA tree recursive function must have at least 2 base cases.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_functors_1",
    "tags": ["tf_functors"],
    "points": 1,
    "mk_description": "**Function Objects & Functors**\n\nA function pointer’s type depends on the number of parameters of the function.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_functors_2",
    "tags": ["tf_functors"],
    "points": 1,
    "mk_description": "**Function Objects & Functors**\n\nA function pointer is an object that contains the address of a function.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_functors_3",
    "tags": ["tf_functors"],
    "points": 1,
    "mk_description": "**Function Objects & Functors**\n\nA functor is a class-type object that acts like a function.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_exceptions_1",
    "tags": ["tf_exceptions"],
    "points": 1,
    "mk_description": "**Exceptions**\n\nAn uncaught exception will cause a runtime error.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  },
  {
    "id": "sp20_exceptions_2",
    "tags": ["tf_exceptions"],
    "points": 1,
    "mk_description": "**Exceptions**\n\nIf an exception is caught in a catch block, the program will exit with status 0 at the end of the catch block.",
    "response": {
      "kind": "multiple_choice",
      "choices": [
        "True",
        "False"
      ],
      "multiple": false
    }
  }
]);



































