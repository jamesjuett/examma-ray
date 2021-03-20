import { QuestionSpecification } from "../autograder";

export const SAS_QUESTIONS: QuestionSpecification[] = [
  {
    "id": "sas_test",
    "tags": [],
    "points": 1,
    "mk_description": "**HEY YOU**\n\nSelect the lines of code below that you want.",
    "response": {
      "kind": "select_a_statement",
      "code_language": "cpp",
      "content": [
        {
          "kind": "item",
          "text": "<input></input>Galley *operator=(const Galley &rhs) {",
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
    },
    "code_language": "cpp"
  }
];

