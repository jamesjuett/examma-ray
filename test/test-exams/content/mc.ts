import { QuestionSpecification } from "../../../src/core/exam_specification";

export const Test_Question_MC_Single : QuestionSpecification = {
  question_id: "test_question_mc_single",
  points: 2,
  mk_description:
`
MC Test Question (Single Response)
`,
  response: {
    kind: "multiple_choice",
    choices: [
      "Choice A",
      "Choice B",
      "Choice C",
      "Choice D",
      "Choice E"
    ],
    multiple: false
  }
};

export const Test_Question_MC_Multiple : QuestionSpecification = {
  question_id: "test_question_mc_multiple",
  points: 2,
  mk_description:
`
MC Test Question (Multiple Response)
`,
  response: {
    kind: "multiple_choice",
    choices: [
      "Choice A",
      "Choice B",
      "Choice C",
      "Choice D",
      "Choice E"
    ],
    multiple: true
  }
};

export const Test_Question_MC_Multiple_Limit_3 : QuestionSpecification = {
  question_id: "test_question_mc_multiple_limit_3",
  points: 2,
  mk_description:
`
MC Test Question (Multiple Response)
`,
  response: {
    kind: "multiple_choice",
    choices: [
      "Choice A",
      "Choice B",
      "Choice C",
      "Choice D",
      "Choice E"
    ],
    multiple: true,
    limit: 3
  }
};

