# examma-ray

Examma Ray is a system for generating randomized or individualized exams.

Each exam is generated as a static HTML file that includes a common javascript bundle. You distribute those files to students however you want. A simple web server that serves static content works great, and there are several options for hosting if you don't want to set something up on your own. You could even distribute the files directly to students, e.g. in a zip file containing the javascript bundle as well.

Students open the `.html` file and take the exam in their web browser. The application is entirely client-side, and does not depend on a server (other than perhaps to originally serve the `.html` and `.js` bundle, if you choose to go that route.). As student's work, their answers are automatically backed up to their browser's local storage (as long as they're not using private/incognito mode). When students are finished, they click a button to download a `.json` "answers file", which they should submit separately (e.g. via Canvas).

## Getting Started

Ensure you have `node` and `npm` installed:

```bash
$ sudo apt update
$ sudo apt install nodejs
```

Create a directory to work in:

```bash
$ mkdir my_exams
$ cd my_exams
```

Initialize a new `npm` package and install `examma-ray` as a dependency.

```bash
$ npm init -y
$ npm install examma-ray
```

Set up some initial files for your exam. Run the following, replacing `template_exam` with an appropriate name for your exam.

```bash
$ npx examma-ray-init template_exam
```

This will create a directory structure like shown below. `content` is for question/section specifications and `template_exam` contains specifications and scripts for generating an exam. These are separate because in theory you might want a "bank" of content, which is drawn upon for several different exams you might give in different terms. There would be one `content` folder but several folders for each exam.

```bash
$ tree
.
├── content
│   └── sample_mc.ts
├── package-lock.json
├── package.json
└── template_exam
    ├── exam-spec.ts
    ├── grader-spec.ts
    ├── instructions.md
    ├── questions.md
    ├── roster.csv
    ├── scripts
    │   ├── gen.ts
    │   └── grade.ts
    ├── secret
    └── tsconfig.json
```

`sample_mc.ts` gives a basic example of defining a [[QuestionSpecification]] and [[SectionSpecification]].

`exam-spec.ts` creates the overall [[Exam]], configured via an [[ExamSpecification]]. It also configures two [[ExamGenerator]]s, one for generating individual randomized exams and one for generating a single preview exam that has all the possible questions on it.

`grader-spec.ts` configures an [[ExamGrader]], exceptions, and an optional curve.

In general, exams contain sections and sections contain questions. "Reference material" is defined at the section level.

`instructions.md` contains overall exam instructions. `questions.md` contains instructions for how students should ask questions during the exam.

`roster.csv` contains student uniqnames (i.e. a unique identifier for each student) and names.

`secret` contains a randomly generated V4 UUID, unique to your exam, which is used as the namespace to create other V5 UUIDs for your exam. Don't share this. Don't change it either, or you won't be able to re-generate exams consistently.

The `scripts` directory contains scripts for generating and grading exams, based on your specification files.

All these specification files and scripts are TypeScript code. The type checker will help make sure you don't miss a required property, spell something wrong, etc. If the code compiles, you've got a guarantee that your exam is reasonably well-formed. An IDE like VS Code (highly recommended!) will also provide autocomplete as you're working.

### Set Exam ID

Before doing anything else, open up `exam-spec.ts` and change the specified `id` for your exam from `template_exam` to something else. Generally, you don't want to change this after you've started working on an exam (it acts as a seed for randomization). Let's use `eecs280f21_final` as an example:

```typescript
...
export const EXAM = new Exam({
  id: "template_exam", // Change to something like "eecs280f21_final"
  title: "Examma Ray Template Exam",
  mk_intructions: readFileSync("instructions.md", "utf8"),
  mk_questions_message: readFileSync("questions.md", "utf8"),
  sections: [
    Section_Sample_MC
  ],
});
...
```

## Generating Individual Exams

Before proceding, make sure your terminal is situated in your individual exam directory:

```bash
$ cd eecs280f21_final
$ pwd
/home/jjuett/my_exams/eecs280f21_final
```

To generate individual randomized exams for each student:

```bash
npx ts-node scripts/gen.ts
```

This will create `data` and `out` subdirectories.

```bash
$ tree
.
├── data
│   └── eecs280f21_final
│       ├── manifests
│       │   ├── student1-11fa0de8-6736-5bbd-a6b9-ea379ae7c2c2.json
│       │   ├── student2-aa6a6cba-2e3f-5bab-b202-4d4752e203f5.json
│       │   ├── student3-db676b7e-8aa2-56de-9dd5-e140290f0c96.json
│       │   ├── student4-d94baffe-0d23-517d-854f-a2cc3c14f660.json
│       │   ├── student5-126075dd-f725-5468-8ce3-331ce6eecb5a.json
│       ├── stats.json
│       └── student-ids.csv
├── out
│   └── eecs280f21_final
│       └── exams
│           ├── js
│           │   └── frontend.js
│           ├── student1-11fa0de8-6736-5bbd-a6b9-ea379ae7c2c2.html
│           ├── student2-aa6a6cba-2e3f-5bab-b202-4d4752e203f5.html
│           ├── student3-db676b7e-8aa2-56de-9dd5-e140290f0c96.html
│           ├── student4-d94baffe-0d23-517d-854f-a2cc3c14f660.html
│           ├── student5-126075dd-f725-5468-8ce3-331ce6eecb5a.html
```

To view a student's exam, just open the corresponding html file in a web browser.

Note that the `eecs280f21_final` folder in each - this matches the configured exam `id` in your `exam-spec.ts`.

In the `data` folder, you'll find
- `stats.json`, with an accounting of which questions were assigned how many times
- `student-ids.csv`, with each student's uniqname and a unique ID for them composed of their uniqname and a V5 UUID
- `manifests`, which contains a manifest for each student showing the structure of their individual exam (i.e. which questions were assigned)

In the `out` folder, you'll find
- `exams`, which contains the actual HTML files for each student's exam
- `exams/js/frontend.js`, which is the javascript bundle for the exam frontend

The UUIDs you see will be different from the ones shown here. They depend on:
- The namespace generated in your `secret` file when you initialized your exam
- The exam `id` you chose in `exam-spec.ts`
- Each student's uniqname

Those are combined and used to generate a V5 UUID, which is essentially a deterministic hash. Because your namespace is secret, nobody can generate these hashes or reverse engineer them. These UUIDs match between what's in the `student-ids.csv` file, and the names on the manifest `.json` files and the actual `.html` exam files for each student.

Note that there are other options for specifying how to create UUIDs for each student's exam (e.g. just using their uniqname). See [[ExamGenerator]] for details.

## Generating a Preview Exam with All Possible Questions

Before proceding, make sure your terminal is situated in your individual exam directory:

```bash
$ cd eecs280f21_final
$ pwd
/home/jjuett/my_exams/eecs280f21_final
```

To generate a preview exam with all possible questions:

```bash
npx ts-node scripts/gen.ts --all-questions
```

This will create `data` and `out` subdirectories with the desired files (see section above for details on these):

```bash
$ tree
.
├── data
│   └── template_exam
│       ├── manifests
│       │   └── preview-preview-template_exam.json
│       ├── stats.json
│       └── student-ids.csv
├── out
│   └── template_exam
│       └── exams
│           ├── js
│           │   └── frontend.js
│           └── preview-preview-template_exam.html
```

To view the preview exam, just open the html file in a web browser.

## Version Control

If you're using `git`, you'll want a `.gitignore` file that includes the following:

#### **`.gitignore`**
```
node_modules/
data/
out/
```

When you're developing an exam and often generating new files, it would be annoying to have `data` in version control. Eventually, you may want to check in the final versions of the exam manifests generated for each student, as well as their answer file submissions. For example, if your exam ID is `eecs280sp20test`, you could optionally add it once you've locked down the content:

```bash
git add eecs280f21_final/data
```

# TODO old documentation below

# Markdown Styling

You may also use components from Bootstrap 4 as HTML tags inside any Markdown. This will generally work fine. For example, let's say you want a Bootstrap `alert` at the top of your exam instructions:

#### **`content/eecs280w21final/instructions.md`**
```markdown
<div markdown=1 class="alert alert-info">

This is a practice exam for EECS 280, covering content from lectures 11 (containers) through 16 (linked lists). Your final exam will be delivered via this same exam platform, so it's a good idea to get familiar with it.

**PLEASE NOTE** This exam is out of "50 points", and the final exam is out of "100 points", but the final exam is not likely to be quite "twice as long" as this one.

</div>
```

Note the use of the additional attribute `markdown=1` is required if you intend to use Markdown syntax (such as the `**PLEASE NOTE**` in the example above) within the HTML element.



# Defining a Rubric

The code in each file in the `rubric` directory defines "graders" which are registered for specific questions. For example, a file containing this TS code would define a multiple choice grader where the first (index 0) option is correct and register it for problem 1.1:

```typescript
import { Exam, SimpleMCGrader } from "../examma-ray-autograder";

Exam.registerGraders({
  "1.1": new SimpleMCGrader(0)
});
```

Several graders are currently supported:

- `FreebieGrader` - Gives points to everyone (or, optionally, to all non-blank submissions)
- `SimpleMCGrader` - Grades an MC question with one right answer
- `SummationMCGrader` - Grades a multiple-select MC question where each selection is worth positive or negative points
- `FITBRegexGrader` - Uses regular expressions to grade each blank in an FITB question. Also comes with an interface for human review of unique answers
- `StandardSASGrader` - Grades SAS ("select-a-statement") questions based on which lines should/shouldn't be included

The format for the graders looks like JSON, but it's actually typescript code defining an object literal, so autocomplete, etc. should be available in VS Code.

For the FITB Regex grader, you'll need to be familiar with javascript regular expression syntax.

- Tutorial/Documentation at [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- Interactive tool for testing out regexes, really neat. [https://regex101.com/](https://regex101.com/) Make sure to select the "ECMAScript/Javascript" flavor on the left side.
- Tip: Normally, the regex will match against any substring of what the student entered. If you want it to only match the WHOLE thing, use `^` and `$`. For example, if you're looking to match any decimal number `/[\d\.]+` will match `6.2` and `My answer is 6.2`, whereas `^[\d\.]+$` will only match `6.2`. Essentially `^` means "beginning of string" and `$` means "end of string".

For now, refer to examples of existing graders. More thorough documentation coming.

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

