import { StandardSASGrader } from "../src/graders/StandardSASGrader";

export const S7_3_grader = {
  "sp20_7_3_assn_op": new StandardSASGrader([
    {
      title: "Function Header",
      description: `Function header has correct name, parameter, and return type. The parameter and return type must both be "by reference"`,
      points: 1,
      required: [1],
      prohibited: [0]
    },
    {
      title: "Self-Assignment Check",
      description: "The function should compare the \`this\` pointer, which contains the address of the left-hand-side object, and the address of the right-hand-side object, taken with `&rhs`.",
      points: 0.5,
      required: [3],
      prohibited: [2]
    },
    {
      title: "Delete Stores",
      description: "Because the `stores` pointer points to a dynamically allocated array, it should be deleted with `delete[]`. (And this is done as a whole for the array - array elements cannot be deleted individually.)",
      points: 1,
      required: [5],
      prohibited: [4, 6]
    },
    {
      title: "Do Not Delete Restaurants",
      description: "Because `restaurants` is a `vector` (and has its own internal assignment operator), we do not need to take any special action to clean up its memory (this will happen if needed when it is assigned later).",
      points: 1,
      required: [],
      prohibited: [7, 8]
    },
    {
      title: "Copy Regular Members",
      description: "Since `storesCapacity` and `storesSize` are primitive types, they can be copied in a straightforward way.",
      points: 1,
      required: [9, 10],
      prohibited: []
    },
    {
      title: "Allocate Space for New Stores Array",
      description: "Since `stores` is a pointer to a dynamically allocated array, it cannot be copied directly (this would just copy the pointer as a shallow copy). Instead, we need to allocate space for a new dynamic array with the desired capacity.",
      points: 1,
      required: [13],
      prohibited: [11, 12]
    },
    {
      title: "Copy Individual Stores in Array",
      description: "Each individual element in the `stores` array should be copied. This should be done directly into the new array - the `Store` objects should not be separately allocated on the heap.",
      points: 1,
      required: [14],
      prohibited: [15]
    },
    {
      title: "Copy Restaurants",
      description: "Use built-in assignment to copy the `vector` of `Restaurant`s. Note: the option with the loop doesn't work in isolation, and if selected in combination with the assignment, is unnecessary (and indicates a conceptual mistake) even though it technically works.",
      points: 1,
      required: [16],
      prohibited: [17]
    },
    {
      title: "Do Not Delete `rhs` Members",
      description: "Members of the `rhs` object (the source of the copy) should not be destroyed.",
      points: 1,
      required: [],
      prohibited: [18, 19]
    },
    {
      title: "Return `*this`",
      description: "An assignment operator should generally return `*this`.",
      points: 1,
      required: [20],
      prohibited: [21]
    },
  ])
};