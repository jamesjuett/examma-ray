import { QuestionSpecification, SectionSpecification, SimpleMCGrader } from "examma-ray";

export const Question_Sample_MC : QuestionSpecification = {
  question_id: "sample_mc",
  points: 2,
  mk_description:
`
This is a sample question. Which of the following is NOT a heirloom variety of tomato plant?
`,
  response: {
    kind: "multiple_choice",
    choices: [
      "Green Zebra",
      "Better Boy",
      "Black Krim",
      "Mr. Stripey",
      "Brandywine"
    ],
    multiple: false,
    default_grader: new SimpleMCGrader(1)
  }
}

export const Section_Sample_MC : SectionSpecification = {
  question_id: "sample_mc",
  title: "Sample Section",
  mk_description: "The section description goes here.",
  mk_reference: "Some reference material to help answer the question.",
  questions: [
    Question_Sample_MC
  ]
}