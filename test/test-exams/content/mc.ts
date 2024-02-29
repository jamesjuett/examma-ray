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
      "Choice B - correct",
      "Choice C",
      "Choice D",
      "Choice E"
    ],
    multiple: false,
    default_grader: {
      grader_kind: "simple_multiple_choice",
      correct_index: 1,
    }
  },
  verifier: {
    verifier_kind: "full_credit",
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
    multiple: true,
    default_grader: {
      grader_kind: "summation_multiple_choice",
      rubric: [
        {selected: false, points: 0.4},
        {selected: true, points: 0.4},
        {selected: false, points: 0.4},
        {selected: true, points: 0.4},
        {selected: false, points: 0.4, ignore_selection: true},
      ]
    }
  },
  verifier: {
    verifier_kind: "full_credit",
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

