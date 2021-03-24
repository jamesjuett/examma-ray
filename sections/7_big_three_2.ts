import { BY_ID, Question, Section, SectionSpecification } from "../src/exams";

export const S7_2_gallery : SectionSpecification = {
  "id": "sp20_7_2",
  "title": "The Big Three",
  "mk_description": "Consider the class shown in the reference material used to represent a `Gallery` in a museum containing paintings and sculptures",
  "mk_reference": "```cpp\nclass Painting {\n\npublic:\n  // Default construct a blank canvas\n  Painting();\n\n  // Custom constructor for a specific painting\n  Painting(const string &name, double value);\n\n  // Assume the Big Three for Painting are properly implemented\n};\n\nclass Sculpture {\npublic:\n  // Custom constructor for a specific sculpture\n  Sculpture(const string &name, double value);\n\n  // Assume the Big Three for Sculpture are properly implemented\n};\n\nclass Gallery {\npublic:\n  // Default ctor. Note all the paintings will be default\n  // constructed as part of the paintings array.\n  Gallery() \n    : mainExhibit(&paintings[0]) { }\n\nprivate:\n  // An array of the paintings. A gallery always\n  // has 10 valid paintings (i.e. none of the elements\n  // are memory junk, though some might be default-\n  // constructed blank canvases).\n  Painting paintings[10];\n\n  // A pointer to the gallery's MVP - \"Most Valuable\n  // Painting\". This will always point to one of the\n  // gallery's 10 paintings, but may change if the\n  // paintings change value\n  Painting *mainExhibit;\n\n  // A vector of pointers to dynamically allocated sculptures\n  vector<Sculpture*> sculptures;\n\n};\n```",
  "content": [
    {
      "id": "sp20_7_2_assn_op",
      "tags": [],
      "points": 9,
      "mk_description": "Implement the **assignment operator** as it would be defined inside the `Gallery` class by selecting from the lines of code given below. Click all lines that should be included. As you work, a preview of your selected implementation is shown. You are not able to change the relative ordering of the lines. When finished, the **selected lines should form a working function** that performs a **deep copy** where appropriate and **avoids undefined behavior or memory leaks**. Some lines contain **mistakes** or are **unnecessary** for the function - these lines should not be selected.",
      "response": {
        "kind": "select_a_statement",
        "code_language": "cpp",
        "choices": [
          {
            "kind": "item",
            "text": "Gallery *operator=(const Gallery &rhs) {",
            "forced": false
          },
          {
            "kind": "item",
            "text": "Gallery &operator=(const Gallery &rhs) {",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  if (&this == rhs) { return *this; }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  if (this == &rhs) { return *this; }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete paintings;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete[] paintings;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete mainExhibit;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  delete sculptures;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  for(size_t i=0; i < sculptures.size(); ++i) {\n    delete sculptures[i];\n  }  ",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  while(!sculptures.empty()) {\n    sculptures.pop_back();\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  paintings = rhs.paintings;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  paintings = new Painting[10];",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  for(int i = 0; i < 10; ++i) {\n    paintings[i] = rhs.paintings[i];\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  for (int i = 0; i < 10; ++i) {\n    paintings[i] = new Painting(rhs.paintings[i]);\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  mainExhibit = rhs.mainExhibit;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  mainExhibit = new Painting(*rhs.mainExhibit);",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  *mainExhibit = *(rhs.mainExhibit);",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  mainExhibit = paintings + (rhs.mainExhibit - rhs.paintings);",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  sculptures = rhs.sculptures;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  sculptures = new vector<Sculpture>(rhs.sculptures);",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  for(size_t i=0; i < rhs.sculptures.size(); ++i) {\n    sculptures.push_back(new Sculpture(*rhs.sculptures[i]));\n  }",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  return *this;",
            "forced": false
          },
          {
            "kind": "item",
            "text": "  return rhs;",
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