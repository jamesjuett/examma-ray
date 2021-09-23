import { QuestionSpecification } from "../../../../src/specification";
import { FreebieGrader } from "../../../../src/graders/FreebieGrader";

export const Question_Simple_Test_1 : QuestionSpecification = {
  question_id: "simple_test_1",
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
}

export const Question_Simple_Test_2 : QuestionSpecification = {
  question_id: "simple_test_2",
  points: 3,
  mk_description:
`
This is another simple test question!
`,
  response: {
    kind: "multiple_choice",
    choices: [
      "F",
      "G",
      "H",
      "I",
      "J"
    ],
    multiple: false,
    default_grader: new FreebieGrader(3, true)
  }
}

