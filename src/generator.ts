import { writeFileSync, mkdirSync } from 'fs';
import json_stable_stringify from "json-stable-stringify";
import { createHash } from 'crypto';
import { TrustedExamAnswers as TrustedExamAnswers } from './common';
import { Section, Question, Exam, AssignedExam, StudentInfo, createBlankAnswers, writeAGFile, RenderMode, SectionChooser, SectionSpecification, Randomizer } from './exams';
import { v4 as uuidv4} from 'uuid';
import uuidv5 from 'uuid/v5';
import { asMutable, assert, assertNever } from './util';
import { unparse } from 'papaparse';
import del from 'del';

type SectionStats = {
  section: Section;
  n: number;
};

type QuestionStats = {
  question: Question;
  n: number;
};

type ExamGeneratorOptions = {
  filenames: "uniqname" | "uuidv4" | "uuidv5"
  uuidv5_namespace?: string;
};

const DEFAULT_OPTIONS = {
  filenames: "uniqname"
};

function verifyOptions(options: Partial<ExamGeneratorOptions>) {
  assert(options.filenames !== "uuidv5" || options.uuidv5_namespace, "If uuidv5 filenames are selected, a uuidv5_namespace option must be specified.");
  assert(!options.uuidv5_namespace || options.uuidv5_namespace.length >= 16, "uuidv5 namespace must be at least 16 characters.");
}

export class ExamGenerator {

  public readonly exam: Exam;
  public readonly assignedExams: AssignedExam[] = [];
  public readonly assignedExamsByUniqname: { [index: string]: AssignedExam | undefined; } = {};

  private sectionStatsMap: { [index: string]: SectionStats; } = {};
  private questionStatsMap: { [index: string]: QuestionStats; } = {};

  private options: ExamGeneratorOptions;

  public constructor(exam: Exam, options: Partial<ExamGeneratorOptions> = {}) {
    this.exam = exam;
    verifyOptions(options);
    this.options = Object.assign(DEFAULT_OPTIONS, options);
  }

  public assignRandomizedExam(student: StudentInfo) {

    let ae = this.createRandomizedExam(student);

    this.assignedExams.push(ae);
    this.assignedExamsByUniqname[student.uniqname] = ae;

    return ae;
  }

  public createRandomizedExam(
    student: StudentInfo,
    rand: Randomizer = new Randomizer(student.uniqname + "_" + this.exam.id))
  {
    let ae = new AssignedExam(this.exam, student,
      this.exam.sections.flatMap(chooser => 
        typeof chooser === "function" ? chooser(this.exam, student, rand) :
        chooser instanceof Section ? chooser :
        new Section(chooser)
      ).map(
        (s, sectionIndex) => s.buildRandomizedSection(this.exam, student, sectionIndex)
      )
    );

    this.checkExam(ae);

    return ae;
  }

  private checkExam(ae: AssignedExam) {
    // Find all sections assigned to any exam
    let sections = ae.assignedSections.map(s => s.section);

    // Verify that every section with the same ID originated from the same specification
    // If there wasn't a previous stats entry for that section ID, add one
    sections.forEach(
      section => this.sectionStatsMap[section.id]
        ? ++this.sectionStatsMap[section.id].n && assert(section.spec === this.sectionStatsMap[section.id].section.spec, `Multiple sections from different specifications with the ID "${section.id}" were detected.`)
        : this.sectionStatsMap[section.id] = {
          section: section,
          n: 1
        }
    );

    // Find all questions assigned to any exam
    let questions = ae.assignedSections.flatMap(s => s.assignedQuestions.map(q => q.question));

    // Verify that every question with the same ID originated from the same specification
    questions.forEach(
      question => this.questionStatsMap[question.id]
        ? ++this.questionStatsMap[question.id].n && assert(question.spec === this.questionStatsMap[question.id].question.spec, `Multiple questions from different specifications with the ID "${question.id}" were detected.`)
        : this.questionStatsMap[question.id] = {
          question: question,
          n: 1
        }
    );

  }

  private writeStats() {
    // Create output directory
    mkdirSync(`out/${this.exam.id}/assigned/`, { recursive: true });

    // Write to file. JSON.stringify removes the section/question objects
    writeFileSync(`out/${this.exam.id}/assigned/stats.json`, json_stable_stringify({
      sections: this.sectionStatsMap,
      questions: this.questionStatsMap
    }, { replacer: (k, v) => k === "section" || k === "question" ? undefined : v, space: 2 }));

  }

  public writeAll() {

    const examDir = `out/${this.exam.id}/assigned/exams`;
    const manifestDir = `out/${this.exam.id}/assigned/manifests`;

    // Create output directories and clear previous contents
    mkdirSync(examDir, { recursive: true });
    del.sync(`${examDir}/*`);
    mkdirSync(manifestDir, { recursive: true });
    del.sync(`${manifestDir}/*`);

    this.writeStats();

    let filenames : string[][] = [];

    // Write out manifests and exams for all, sorted by uniqname
    this.assignedExams
      .sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
      .forEach((ex, i, arr) => {

        // Create filename, add to list
        let filenameBase = this.createFilenameBase(ex.student);
        filenames.push([ex.student.uniqname, filenameBase])

        console.log(`${i + 1}/${arr.length} Saving assigned exam manifest for ${ex.student.uniqname} to ${filenameBase}.json`);
        writeFileSync(`${manifestDir}/${filenameBase}.json`, JSON.stringify(createBlankAnswers(ex), null, 2));
        console.log(`${i + 1}/${arr.length} Rendering assigned exam html for ${ex.student.uniqname} to ${filenameBase}.html`);
        writeAGFile(RenderMode.ORIGINAL, ex, `${examDir}/${filenameBase}.html`, ex.render(RenderMode.ORIGINAL));
      });

    writeFileSync(`out/${this.exam.id}/assigned/files.csv`, unparse({
      fields: ["uniqname", "filenameBase"],
      data: filenames 
    }));

  }

  private createFilenameBase(student: StudentInfo) {
    if(this.options.filenames === "uniqname") {
      return student.uniqname;
    }
    else if (this.options.filenames === "uuidv4") {
      return student.uniqname + "-" + uuidv4();
    }
    else if (this.options.filenames === "uuidv5") {
      return student.uniqname + "-" + uuidv5(student.uniqname, this.options.uuidv5_namespace!);
    }
    else {
      assertNever(this.options.filenames);
    }
  }
}
