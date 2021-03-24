import { FITBRegexGrader } from "../src/graders/common"

export const S5_Dynamic_Memory_Graders = {
  "sp20_5_v4" : new FITBRegexGrader([
    {
      title: "Identify Error",
      blankIndex: 1,
      description: "",
      points: 2,
      solution: "memory leak",
      patterns: [
        {
          pattern: /.*memory.*leak.*/i,
          explanation: "Correct!",
          points: 2
        }
      ]
    },
    {
      title: "Explanation",
      blankIndex: 2,
      description: "",
      points: 2,
      solution: "The second line allocates an int with value 10 on the heap, but the address to this int is not kept.",
      patterns: [
        {
          pattern: /.*/,
          explanation: "Correct!",
          points: 2
        }
      ]
    }
  ])
}
