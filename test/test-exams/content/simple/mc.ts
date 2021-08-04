import { QuestionSpecification, SectionSpecification } from "../../../../src/specification";
import { FreebieGrader } from "../../../../src/graders/FreebieGrader";

export const Test_Question_MC : QuestionSpecification = {
  id: "test_question_mc",
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
    multiple: false
  }
};

