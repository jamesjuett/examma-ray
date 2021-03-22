import { QuestionSpecification } from "../autograder";

export const FITB_QUESTIONS : QuestionSpecification[] = [
  {
    "id": "fitb_test",
    "tags": [],
    "points": 1,
    "mk_description": "**HEY YOU**\n\nFill in the code below to make it work.",
    "response": {
      "kind": "fitb",
      "text":
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

