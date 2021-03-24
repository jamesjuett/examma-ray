import { writeFileSync, mkdirSync } from 'fs';
import json_stable_stringify from "json-stable-stringify";
import { TrustedExamAnswers as TrustedExamAnswers } from './common';
import { Section, Question, Exam, AssignedExam, StudentInfo, createBlankAnswers, writeAGFile, RenderMode, SectionChooser, SectionSpecification, Randomizer } from './exams';
import { asMutable, assert } from './util';

type SectionStats = {
  section: Section;
  n: number;
};
type QuestionStats = {
  question: Question;
  n: number;
};

export class ExamGenerator {

  public readonly exam: Exam;
  public readonly assignedExams: AssignedExam[] = [];
  public readonly assignedExamsByUniqname: { [index: string]: AssignedExam | undefined; } = {};

  private sectionStatsMap: { [index: string]: SectionStats; } = {};
  private questionStatsMap: { [index: string]: QuestionStats; } = {};

  public constructor(exam: Exam) {
    this.exam = exam;
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

    // Create output directories
    mkdirSync(`out/${this.exam.id}/assigned/exams/`, { recursive: true });
    mkdirSync(`out/${this.exam.id}/assigned/manifests/`, { recursive: true });

    this.writeStats();

    // Write out manifests and exams for all, sorted by uniqname
    [...this.assignedExams]
      .sort((a, b) => a.student.uniqname.localeCompare(b.student.uniqname))
      .forEach((ex, i, arr) => {
        console.log(`${i + 1}/${arr.length} Saving assigned exam manifest for: ${ex.student.uniqname}...`);
        writeFileSync(`out/${this.exam.id}/assigned/manifests/${ex.student.uniqname}.json`, JSON.stringify(createBlankAnswers(ex), null, 2));
        console.log(`${i + 1}/${arr.length} Rendering assigned exam html for: ${ex.student.uniqname}...`);
        writeAGFile(RenderMode.ORIGINAL, ex, `out/${this.exam.id}/assigned/exams/${ex.student.uniqname}.html`, ex.render(RenderMode.ORIGINAL));
      });

  }
}
