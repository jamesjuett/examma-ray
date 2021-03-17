# exam-template

## Setup

Ensure you have `node` and `npm` installed:

```console
sudo apt update
sudo apt install nodejs
```

Install dependencies using `npm`:

```console
npm install
```


## Directory Structure and Files

Top-level `sections` directory, which contains a file for each section on Crabster, numbered the same as in the CSV.

Top-level `rubric` directory, which contains typescript files that define question "graders" and rubric items. Organization can be whatever you want, and filenames don't matter.

Top-level `exceptions` directory, which contains typescript files that define exceptions where a question should be graded differently for a particular student.

`engr101f20final_alpha.csv` is the CSV download of student answers from Crabster.

## Running the Autograder

A standard run of the autograder will grade exams for all students and generate a `.html` report file for each, produce detailed analyses pages for each question, and generate an overview report for the exam.

```console
npx ts-node engr101w21MATLAB_practice.ts --reports
```

If you'd like to skip re-generating the reports (which takes a bit longer to run), you can use the `--no_reports` option.

```console
npx ts-node engr101f20final.ts --no-reports
```

Output files go to the `out/` directory. Specifically:

- `out/students/` - Individual student reports (unless you specified `--no-reports`).
- `out/questions/` - Analyses pages for each question.
- `overview.html` - High-level overview of the exam, with links to student/question reports.
- `scores.csv` - Total and per-question scores for each student by uniqname.

## Defining the Rubric

The code in each file in the `rubric` directory defines "graders" which are registered for specific questions. For example, a file containing this TS code would define a multiple choice grader where the first (index 0) option is correct and register it for problem 1.1:

```typescript
import { Exam, SimpleMCGrader } from "../examma-ray-autograder";

Exam.registerGraders({
  "1.1": new SimpleMCGrader(0)
});
```

In the `engr101f20final.ts` file, make sure to add import lines for all of the rubric files. For example:

```typescript
// Import from ALL rubric files that you want to use
import "./rubric/real_exam";
import "./rubric/true_false";
import "./rubric/vec_of_vecs";
import "./rubric/driver";
...
```

Three graders are currently supported that cover almost all of the questions:

- `SimpleMCGrader` - see example in `rubric/true_false.ts`
- `FITBRegexGrader` - see example in `rubric/vec_of_vecs.ts` (note this example has placeholder data)
- `StandardSASGrader` - see example in `rubric/driver.ts`

The format for the graders looks like JSON, but it's actually typescript code defining an object literal, so autocomplete, etc. should be available in VS Code.

For the FITB Regex grader, you'll need to be familiar with javascript regular expression syntax.

- Tutorial/Documentation at [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- Interactive tool for testing out regexes, really neat. [https://regex101.com/](https://regex101.com/) Make sure to select the "ECMAScript/Javascript" flavor on the left side.
- Tip: Normally, the regex will match against any substring of what the student entered. If you want it to only match the WHOLE thing, use `^` and `$`. For example, if you're looking to match any decimal number `/[\d\.]+` will match `6.2` and `My answer is 6.2`, whereas `^[\d\.]+$` will only match `6.2`. Essentially `^` means "beginning of string" and `$` means "end of string".

## Entering Exceptions

The code in each file in the `exceptions` directory defines exceptions which are registered for specific student/question pairs. For example, a file containing this TS code would define an exception intended to work around double jeopardy in the regular grader for a FITB question.

```typescript
import { Exam } from "../examma-ray-autograder";

Exam.registerException("jjuett", "6.1", {
    adjustedScore: 6,
    explanation: "The first blank is incorrect, but the rest of the blanks all share the same error, which is a mismatched variable name. To avoid double jeopardy, we graded this question as an exceptional case."
});
```

In the `engr101f20final.ts` file, make sure to add import lines for all of the exception files. For example:

```typescript
// Import from ALL exception files that you want to use
import "./exceptions/exceptions";
...
```