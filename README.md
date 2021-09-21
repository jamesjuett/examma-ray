# examma-ray

Examma Ray is a system for generating randomized or individualized exams.

Each exam is generated as a static HTML file that includes a common javascript bundle. You distribute those files to students however you want. A simple web server that serves static content works great, and there are several options for hosting if you don't want to set something up on your own. You could even distribute the files directly to students, e.g. in a zip file containing the javascript bundle as well.

Students open the `.html` file and take the exam in their web browser. The application is entirely client-side, and does not depend on a server (other than perhaps to originally serve the `.html` and `.js` bundle, if you choose to go that route.). As student's work, their answers are automatically backed up to their browser's local storage (as long as they're not using private/incognito mode). When students are finished, they click a button to download a `.json` "answers file", which they should submit separately (e.g. via Canvas).

## Getting Started

Ensure you have `node` and `npm` installed:

```bash
sudo apt update
sudo apt install nodejs
```

Create a directory to work in:

```bash
mkdir my_exams
cd my_exams
```

Initialize a new `npm` package and install `examma-ray` as a dependency.

```bash
npm init -y
npm install examma-ray
```

Set up some initial files for your exam. Run the following, with an appropriate name for your exam subbed in.

```bash
npx examma-ray-init eecs280f21_final
```

You'll get a directory structure like shown below. `content` is for question/section specifications and `eecs280f21_final` contains specifications and scripts for generating an exam. These are separate because in theory you might want a "bank" of content, which is drawn upon for several different exams you might give in different terms. There would be one `content` folder but several folders for each exam.

```bash
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

#### **`content/eecs280w21final/roster.csv`**
```
uniqname,name
awdeorio,Drew DeOrio
jbbeau,Jonathan Beaumont
jjuett,James Juett
lslavice,Laura Alford
```

#### **`content/eecs280w21final/instructions.md`**
```markdown
These instructions are shown at the top of each exam.

Formatting with **Markdown** is fine.
```

You specify your exam and scripts to generate, grade, etc. using TypeScript code. Even for specification, this is preferred to plain JSON because the type checker can help greatly in making sure you don't miss a required property, spell something wrong, etc. If the code compiles, you've got a guarantee that your exam is reasonably well-formed. An IDE like VS Code will also provide autocomplete as you're working.

Create an exam specification file:

#### **`content/eecs280w21final/exam-spec.ts`**
```typescript
import { readFileSync } from "fs";
import { Exam } from "examma-ray";

// Create exam
export const exam = new Exam({
  id: "eecs280w21final",
  title: "EECS 280 W21 Final Exam",
  mk_intructions: readFileSync("content/eecs280w21final/instructions.md", "utf8"),
  frontend_js_path: "../../../js/frontend.min.js",
  frontend_graded_js_path: "../../../js/frontend-graded.min.js",
  sections: [
    // Empty for now
  ]
});
```

Create an exam generation script:

#### **`content/eecs280w21final/gen.ts`**
```typescript
import { ExamGenerator, ExamUtils, } from 'examma-ray';
import { readFileSync } from 'fs';

// Note the import from our previous exam-spec file
import { exam } from './exam-spec';

let gen = new ExamGenerator(exam, {
  student_ids: "uuidv5",
  uuidv5_namespace: readFileSync("content/eecs280w21final/secret", "utf-8"),
  students: ExamUtils.loadCSVRoster("content/eecs280w21final/roster.csv")
});

gen.writeAll();
```

In the generation script above, we're opting to create V5 UUIDs to uniquely identify the assigned exam for each student and include in the generated exam filenames (this is the recommended approach). To do so, we need to create a unique "namespace" for our exam that is used to generate the UUIDs. The namespace should be a V4 UUID. Here's one way to generate it:

```bash
npm install --save-dev uuid
npx uuid > content/eecs280w21final/secret
```

You can put this `secret` file wherever you want. The `gen.ts` script reads it in and passes it as part of the generator configuration. Keep it secret (e.g. don't check it in to a public repo - though you probably don't want all your exam questions public anyway!). Do **not** change it once you've generated/distributed an exam. You may create a new secret for each exam, or reuse the same secret for several exams.

Now you're ready to generate exams!

```bash
npx ts-node content/eecs280w21final/gen.ts
```

This should create files within two directories:
 - `data/{{exam_id}}/`  
This is where all information about exam assignments (e.g. who got what question) goes. It's also where you'll drop in the answers files students submit (into `data/{{exam_id}}/submissions`) so that they can be graded. There should be a subfolder for each exam, depending on the ID you provided in your `exam-spec.ts` file.

 - `out/{{exam_id}}/`  
This is where all generated content goes, e.g. the `.html` files for students' exams and grading reports.

We could try to open the generated exams, but they won't work quite right yet. They need access to the `frontend.js` bundle. You can copy that out of `node_modules`, where is should have been pulled in when you installed `examma-ray`.

```bash
mkdir out/js
cp node_modules/examma-ray/dist/frontend/frontend.js out/js
cp node_modules/examma-ray/dist/frontend/frontend-graded.js out/js
```

Remember the `frontend_js_path` in `exam-spec.ts` from earlier? That's the relative path the exams need to get to the `frontend.js` file. It should be set correctly right now for local testing so that you can open the exam files in place, but you'll need to change it and re-generate the exams for distribution, depending on where `frontend.js` will live relative to your distributed `.html` files.

Now, your directories should look something like this:

```bash
data
└── eecs280sp20test
    ├── student-ids.csv
    ├── manifests
    │   ├── awdeorio-9f682502-da18-5b27-9261-8bf2a6609629.json
    │   ├── jbbeau-8805c913-008c-5f0e-a14c-3ec566882938.json
    │   ├── jjuett-5bf68443-0f3d-57d6-8abb-00c548d1d1ef.json
    │   └── lslavice-51e8b8b5-65ec-55ba-9ba6-a723e5a3ed06.json
    └── stats.json

out
├── eecs280sp20test
│   └── exams
│       ├── awdeorio-9f682502-da18-5b27-9261-8bf2a6609629.html
│       ├── jbbeau-8805c913-008c-5f0e-a14c-3ec566882938.html
│       ├── jjuett-5bf68443-0f3d-57d6-8abb-00c548d1d1ef.html
│       └── lslavice-51e8b8b5-65ec-55ba-9ba6-a723e5a3ed06.html
└── js
    ├── frontend-graded.js
    └── frontend.js
```

A quick summary of the output of `gen.ts` in the `assigned` directory:

- `assigned/exams` contains the actual exam html files
- `assigned/manifests` contains a record of which questions each student was assigned
- `assigned/student-ids.csv` contains a mapping from uniqnames to generated assigned exam IDs
- `assigned/stats.json` contains information about overall exam generation


### Version Control

If you're using `git`, you'll want a `.gitignore` file that includes the following:

#### **`.gitignore`**
```
node_modules/
data/
out/
```

When you're developing an exam and often generating new files, it would be annoying to have `data` in version control. Eventually, you may want to check in the final versions of the exam manifests generated for each student, as well as their answer file submissions. For example, if your exam ID is `eecs280sp20test`:

```bash
git add data/eecs280sp20test
```

Although this is not strictly necessary since the generation process is deterministic as long as the exam ID, content, secret v5 uuid namespace, etc. do not change, it would make me nervous not to have a copy!

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

