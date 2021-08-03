import { SectionSpecification } from "../../../src/specification";
import { FreebieGrader } from "../../../src/graders/FreebieGrader";

export const Section_Simple_Test: SectionSpecification = {
  "id": "simple_test",
  "title": "Simple Test",
  "mk_description": "",
  "questions": [
    {
      id: "simple_test",
      points: 2,
      mk_description:
`
This is a simple test question!
`,
      response: {
        kind: "multiple_choice",
        choices: [
          "A",
          "B",
          "C",
          "D",
          "E"
        ],
        multiple: false,
        default_grader: new FreebieGrader(2, true)
      }
    },
  ]
};


