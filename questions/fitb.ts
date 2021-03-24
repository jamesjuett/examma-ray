import { QuestionSpecification } from "../src/exams";
import { FITBRegexGrader } from "../src/graders/common";

export const FITB_QUESTIONS : QuestionSpecification[] = [
  {
    "id": "fitb_test",
    "tags": [],
    "points": 1,
    "mk_description": "**HEY YOU**\n\nFill in the code below to make it work.",
    "response": {
      "kind": "fitb",
      "content":
`
this is a **test** _only_ a \`test\`

\`\`\`cpp
<input></input>
int main() {
  ____BLANK____ x = _blank_;
  int y = 3;
  int z = x + _Blank_;

  __________________BLANK_________;

  return ___BLANK__;
}
\`\`\`
`
    }
  }
];

export const TEST_FITB_graders = {
  "fitb_test" : new FITBRegexGrader([
    {
      title: "Guess \"apple\" successfully",
      blankIndex: 1,
      description: "",
      points: 0.2,
      solution: "apple",
      patterns: [
        {
          pattern: /.*apple.*/i,
          explanation: "Correct!",
          points: 0.2
        }
      ]
    },
    {
      title: "Guess \"banana\" successfully",
      blankIndex: 2,
      description: "",
      points: 0.2,
      solution: "banana",
      patterns: [
        {
          pattern: /.*banana.*/i,
          explanation: "Correct!",
          points: 0.2
        }
      ]
    },
    {
      title: "Guess \"cranberry\" successfully",
      blankIndex: 3,
      description: "",
      points: 0.2,
      solution: "cranberry",
      patterns: [
        {
          pattern: /.*cranberry.*/i,
          explanation: "Correct!",
          points: 0.2
        }
      ]
    },
    {
      title: "Guess \"durian\" successfully",
      blankIndex: 4,
      description: "",
      points: 0.2,
      solution: "durian",
      patterns: [
        {
          pattern: /.*durian.*/i,
          explanation: "Correct!",
          points: 0.2
        }
      ]
    },
    {
      title: "Guess \"eggfruit\" successfully",
      blankIndex: 5,
      description: "",
      points: 0.2,
      solution: "eggfruit",
      patterns: [
        {
          pattern: /.*eggfruit.*/i,
          explanation: "Correct!",
          points: 0.2
        }
      ]
    },
  ]),
}