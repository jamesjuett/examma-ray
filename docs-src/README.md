# examma-ray

Examma Ray is a system for generating randomized or individualized exams which can be taken in a web browser.

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

## Creating a New Exam

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
  exam_id: "template_exam", // Change to something like "eecs280f21_final"
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
│       └── exam-spec.json
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

Note that `eecs280f21_final` folder in each - this matches the configured exam `id` in your `exam-spec.ts`.

In the `data` folder, you'll find
- `exam-spec.json`, a specification of the entire exam as a JSON file. This encodes the complete specification of the entire exam, sufficient to regenerate it in the future. It also includes an encoding of any default grader specifications. This is useful for e.g. uploading the exam specification to a grading server.
- `stats.json`, with an accounting of which questions were assigned how many times
- `student-ids.csv`, with each student's uniqname and a unique ID for them composed of their uniqname and a V5 UUID
- `manifests`, which contains a manifest for each student showing the structure of their individual exam (i.e. which questions were assigned)

In the `out` folder, you'll find
- `exams`, which contains the actual HTML files for each student's exam
- `exams/js/frontend.js`, which is the javascript bundle for the exam frontend
- `exams/assets/`, files (e.g. images) to be included in the exam

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
│       └── exam-spec.json
├── out
│   └── template_exam
│       └── exams
│           ├── js
│           │   └── frontend.js
│           └── preview-preview-template_exam.html
```

To view the preview exam, just open the html file in a web browser.

## Generating ONLY a JSON exam specification file

If you only need to generate an exam specification file, you can run:

```bash
npx ts-node scripts/gen.ts --spec-only
```

## Administering an Exam

Essentially, you just need to distribute each student's `.html` file, the common `js/frontend.js`, and any asset files. A reasonable way to do this is set up a simple http file server somewhere that serves these files. Just copy over the whole `out/eecs280f21_final/exams` directory and point students to their URL.

Because the URL for each student (i.e. based on the name of their `.html` file) is deterministic, you can send out links ahead of time via a mailmerge or some other mechanism. Of course, you'll want to make sure you don't actually put the files up on your http file server until the exam starts. Ideally, you don't want to dump all the URLs publicly, since students could take each others exams and/or see more questions than they should by peeking at others' exams. But you can evaluate that tradeoff vs. the complexity of distributing students' URLs privately.

You can find a mapping from student uniqnames to the base of their `.html` in the `data/eecs280f21_final/student-ids.csv` file.

Once students finish their exam, they download their answers file (a `.json`) and submit it via some other mechanism, e.g. Canvas. You can set your deadline there to make sure students only take the proper amount of time to work on their exam.

After students turn in their `.json` files, drop them in a new directory within your exam folder, `data/eecs280f21_final/submissions`. Canvas (or whatever you use for turn-in) may have changed the filenames, but this is fine. The submission is associated with the correct student based on the file's content, not its name.

Here's the an example of the mailmerge we send out for EECS 280 at UM. We use [https://github.com/awdeorio/mailmerge](https://github.com/awdeorio/mailmerge), but you can use whatever you like.

```text
TO: {{uniqname}}@umich.edu
SUBJECT: [IMPORTANT] EECS 280 Midterm Exam
FROM: EECS 280 Staff <eecs280staff@umich.edu>
REPLY-TO: EECS 280 Staff <eecs280staff@umich.edu>
BCC: James Juett <jjuett@umich.edu>

Hello!

Here is the link for your EECS 280 final exam. It is currently inactive, but will take you to your exam once your exam is scheduled to start. This is your correct link regardless of whether you are taking the exam at the regular time or at an alternate time.

[If you have withdrawn from the course, please disregard this message.]

Your individual exam link is:
https://lobster.eecs.umich.edu/exam-distribution/exams/eecs280f21_final/{{filenameBase}}.html

In case that link doesn't work, you may use this link as a backup.
https://eecs280staff.github.io/exam-distribution/exams/eecs280f21_final/{{filenameBase}}.html

Only use one of these two links (i.e. don't switch back and forth between them).

Please remember that you must turn in your answers file from the exam to Canvas before the end of the exam. Turn it in to this canvas assignment:
(Canvas Link)

You can find information about the exam logistics the practice exams on Piazza.
(Piazza Link)
```

You'll notice in the example above that we actually have a main fileserver and use github pages as a backup. (The main fileserver is more responsive and not throttled, so it's the first choice, but it is on a local University machine and could theoretically go down.) To publish the exam, we queue up a pull request to the `main` branch on the github pages repo - once that's merged, the exams go live. We also have a cron job set up on the main fileserver to `git pull` from that repo every minute. You might come up with a more clever deployment process :).

## Grading an Exam

Make sure you've got the `.json` answers files copied into your `data/eecs280f21_final/submissions` folder.

Also ensure your terminal is situated in your individual exam directory:

```bash
$ pwd
/home/jjuett/my_exams/eecs280f21_final
```

To run overall grading for the exam:

```bash
npx ts-node scripts/grade.ts --reports
```

This runs all autograders, picks up all manual grading results, generates a grading overview for the overall exam, and generates individual grading reports for each student. Generating the individual reports takes the longest amount of time, so if you're frequently re-running grading (e.g. while working on configuring a FITB autograder), you can leave off the `--reports` option.

Generated grading results are in the `out/eecs280f21_final/graded` folder.

```bash
$ tree out/eecs280f21_final/graded/
out/eecs280f21_final/graded/
├── exams
│   ├── student1-11fa0de8-6736-5bbd-a6b9-ea379ae7c2c2.html
│   ├── student2-aa6a6cba-2e3f-5bab-b202-4d4752e203f5.html
│   ├── student3-db676b7e-8aa2-56de-9dd5-e140290f0c96.html
│   ├── student4-d94baffe-0d23-517d-854f-a2cc3c14f660.html
│   ├── student5-126075dd-f725-5468-8ce3-331ce6eecb5a.html
├── overview.html
├── questions
│   ├── big_three_v1_add_v1.html
│   ├── big_three_v1_add_v2.html
│   ├── big_three_v1_add_v3.html
│   ├── big_three_v1_assignment_op.html
│   ├── big_three_v1_destructor.html
│   ├── ...
│   ├── ...
└── scores.csv
```

In this directory, you'll find:
- `overview.html`: **Start here!** A grading overview, which also links to everything else.
- `exams/`: A directory with each individual student's graded exam report (if you used `--reports`).
- `questions/`: Some question grader types (e.g. FITB) generate question analysis pages to assist with grading.
- `scores.csv`: A CSV file with grades

Note that the UUIDs on the individual students' report files are the same as for their original exam.

### Configuring Autograders and Manual Grading

Of course, you'll need to configure autograders and/or set up manual grading for each question before running grading will do anything meaningful. See [[graders]] for details.

## Markdown Styling

You may also use components from Bootstrap 4 as HTML tags inside any Markdown. This will generally work fine. For example, let's say you want a Bootstrap `alert` at the top of your exam instructions:

#### **`content/eecs280w21final/instructions.md`**
```markdown
<div markdown=1 class="alert alert-info">

This is a practice exam for EECS 280, covering content from lectures 11 (containers) through 16 (linked lists). Your final exam will be delivered via this same exam platform, so it's a good idea to get familiar with it.

**PLEASE NOTE** This exam is out of "50 points", and the final exam is out of "100 points", but the final exam is not likely to be quite "twice as long" as this one.

</div>
```

Note the use of the additional attribute `markdown=1` is required if you intend to use Markdown syntax (such as the `**PLEASE NOTE**` in the example above) within the HTML element.
