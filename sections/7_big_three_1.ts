import { BY_ID, Question, Section } from "../autograder";

export const S7_1_galley = new Section({
  "id": "sp20_7_1",
  "title": "Dynamic Memory and The Big Three",
  "mk_description": "Consider the class shown in the reference material used to represent a `Galley`, which is a kitchen on a ship or aircraft.",
  "mk_reference": "```cpp\nclass Galley {\npublic:\n  Galley() // Default ctor. Capacity 10, no ingredients.\n    : capacity(10), size(0), ingredients(new string[capacity]) { }\n\nprivate:\n  // Capacity of ingredients array\n  int capacity;\n\n  // Number of ingredients currently in the galley\n  int size;        \n  \n  // A pointer to a dynamically allocated array of ingredient names\n  string *ingredients;\n\n  // A pointer to the ingredient currently being prepared\n  string *currentIngredient;\n\n  // Reallocates a new ingredients array with more capacity\n  void grow() { ... }\n};\n```",
  "content": [
    {
      "id": "sp20_7_1_assn_op",
      "tags": [],
      "points": 1,
      "mk_description": "Implement the **assignment operator** as it would be defined inside the `Galley` class by selecting from the lines of code given below. Click all lines that should be included. As you work, a preview of your selected implementation is shown. You are not able to change the relative ordering of the lines. When finished, the **selected lines should form a working function** that performs a **deep copy** where appropriate and **avoids undefined behavior or memory leaks**. Some lines contain **mistakes** or are **unnecessary** for the function - these lines should not be selected.",
      "response": {
        "kind": "select_a_statement",
        "code_language": "cpp",
        "choices": [
          {
            "kind": "item",
            "text": "Galley *operator=(const Galley &rhs) {",
            "forced": false
          },
          {
            "kind": "item",
            "text": "Galley &operator=(const Galley &rhs) {",
            "forced": false
          },
          {
            "kind": "item",
            "text": "Galley(const Galley &rhs) {",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  if (*this == rhs) { return *this; }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  if (this == &rhs) { return *this; }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  if (capacity < rhs.capacity) {\n    grow();\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete capacity;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete size;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete[] ingredients;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete currentIngredient;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  capacity = rhs.capacity;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  size = rhs.size;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  ingredients = rhs.ingredients;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  ingredients = new string[rhs.capacity];",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  for(int i = 0; i < size; ++i) {\n    ingredients[i] = rhs.ingredients[i];\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  for(int i = 0; i < size; ++i) {\n    ingredients[i] = new string(rhs.ingredients[i]);\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  currentIngredient = rhs.currentIngredient;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  currentIngredient = new string(*rhs.currentIngredient);",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  *currentIngredient = *(rhs.currentIngredient);",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  currentIngredient = ingredients + (rhs.currentIngredient - rhs.ingredients);",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete[] ingredients;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  return *this;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  return ingredients;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "}",
            "forced": true
          }
        ]
      }
    }
  ]
});