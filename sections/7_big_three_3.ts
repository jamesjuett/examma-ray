import { BY_ID, Question, Section, SectionSpecification } from "../autograder";

export const S7_3_galleria : SectionSpecification = {
  "id": "sp20_7_3",
  "title": "The Big Three",
  "mk_description": "Consider the class shown in the reference material used to represent a `Galleria`, which is a covered or enclosed area with commercial establishments for shopping, dining, etc.",
  "mk_reference": "```cpp\nclass Restaurant {\n\npublic:\n  Restaurant(int pricey); // 1, 2, or 3 depending on $, $$, or $$$\n\n  // Assume the Big Three for Restaurant are properly implemented\n};\n\nclass Store {\npublic:\n\n  // Default constructor for empty storefront\n  Store();\n\n  // Construct a specific store\n  Store(const string &name); \n\n  // Assume the Big Three for Store are properly implemented\n\n  const string & getName() { ... }\n};\n\nclass Galleria {\npublic:\n  Galleria() // Default ctor.\n    : storesCapacity(10), storesSize(0),\n      stores(new Store[storesCapacity]) { }\n\nprivate:\n\n  // Capacity of stores array  \n  int storesCapacity; \n\n  // Number of stores currently in the galleria\n  int storesSize;    \n\n  // Dynamically allocated array of stores\n  Store *stores;\n\n  // A vector of Restaurants in the galleria\n  vector<Restaurant> restaurants;\n};\n```",
  "content": [
    {
      "id": "sp20_7_3_assn_op",
      "tags": [],
      "points": 1,
      "mk_description": "Implement the **assignment operator** as it would be defined inside the `Galleria` class by selecting from the lines of code given below. Click all lines that should be included. As you work, a preview of your selected implementation is shown. You are not able to change the relative ordering of the lines. When finished, the **selected lines should form a working function** that performs a **deep copy** where appropriate and **avoids undefined behavior or memory leaks**. Some lines contain **mistakes** or are **unnecessary** for the function - these lines should not be selected.",
      "response": {
        "kind": "select_a_statement",
        "code_language": "cpp",
        "choices": [
          {
            "kind": "item",
            "text": "Galleria operator=(const Galleria *rhs) {",
            "forced": false
          },
          {
            "kind": "item",
            "text": "Galleria &operator=(const Galleria &rhs) {",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  if (this == rhs) { return *this; }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  if (this == &rhs) { return *this; }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete stores;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete[] stores;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  for(size_t i = 0; i < storesSize; ++i) {\n    delete stores[i];\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete restaurants;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete[] restaurants;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  storesCapacity = rhs.storesCapacity;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  storesSize = rhs.storesSize;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  stores = rhs.stores;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  *stores = *rhs.stores;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  stores = new Store[rhs.storesCapacity];",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  for(int i = 0; i < rhs.storesSize; ++i) {\n    stores[i] = rhs.stores[i];\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  for(int i = 0; i < rhs.storesSize; ++i) {\n    stores[i] = new Store(rhs.stores[i].getName());\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  restaurants = rhs.restaurants;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  for(int i = 0; i < static_cast<int>(rhs.restaurants.size()); ++i) {\n    restaurants[i] = rhs.restaurants[i];\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete[] rhs.stores;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete rhs.restaurants;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  return *this;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  return this;",
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
}