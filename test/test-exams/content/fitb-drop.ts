import { QuestionSpecification } from "../../../src/core/exam_specification";

export const Test_Question_Fitb_Drop : QuestionSpecification<"fitb_drop"> = {
  question_id: "fitb_drop_test",
  points: 4,
  mk_description:
`FITB-Drop Test Question
`,
  response: {
    kind: "fitb_drop",
    content:
`
_drop_bank_
\`\`\`cpp


// EFFECTS: A constructor that does something
________BLANK________ (int x, int y)
 : [[_____DROP_____  ]] {
  [[________________________________________DROP________________________________________
  
  
  ]]
  [[_____DROP_____
  ]]
  [[____BOX____
  
  ]]
}
\`\`\``,
    droppables: [
      {
        id: "item1",
        content:
`\`\`\`cpp
for(int i = 0; [[_____DROP_____  ]]; ++i) {
  cout << "____blank____" << endl;
}
\`\`\``,
      },
      {
        id: "item2",
        content:"item-test-2"
      },
      {
        id: "item3",
        content: "item-test-3"
      }
    ],
    starter: [
      "starter-blank",
      [{
        id: "item2"
      }],
      [{
        id: "item1"
      }],
      [

      ],
      "starter\nbox"
    ]
  }
};