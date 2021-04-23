import { readdirSync, readFileSync, copyFileSync, mkdirSync, existsSync, writeFileSync } from "fs";
import { ExamSubmission, fillManifest, TrustedExamSubmission } from "./submissions";
import Papa from "papaparse";
import { AssignedQuestion, StudentInfo } from "./exams";
import path from "path";
import { asMutable, assert } from "./util";
import { chunk } from "simple-statistics";
import { stringify_response } from "./response/responses";
import { GradingAssignmentSpecification } from "./grading/common";
import glob from "glob";
import del from "del";

import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export namespace ExamUtils {

  export function loadExamAnswers(filename: string) : ExamSubmission {
    return <ExamSubmission>JSON.parse(readFileSync(filename, "utf8"));
  }

  export function loadTrustedSubmission(manifestDirectory: string, submittedFilename: string) {
    let submitted = loadExamAnswers(submittedFilename);
    let manifest = loadExamAnswers(path.join(manifestDirectory, submitted.student.uniqname + "-" + submitted.uuid + ".json"))
    return fillManifest(
      manifest,
      submitted
    );
  }

  export function loadTrustedSubmissions(manifestDirectory: string, submittedDirectory: string) {
    let trustedAnswers : TrustedExamSubmission[] = [];
    readdirSync(submittedDirectory).forEach(
      filename => {
        try {
          trustedAnswers.push(loadTrustedSubmission(
            manifestDirectory,
            path.join(submittedDirectory, filename)
          ));
        }
        catch(e) {
          // do nothing
        }
      }
    );
    return trustedAnswers;
  }

  export function loadCSVRoster(filename: string) {
    let students = Papa.parse<StudentInfo>(readFileSync(filename, "utf8"), {
      header: true,
      skipEmptyLines: true
    }).data;

    students.forEach(s => {
      assert(s.uniqname !== "", "Student uniqname may not be empty. Double check your roster file.");
      assert(s.name !== "", "Student name may not be empty. Double check your roster file.");
    })

    return students;
  }

  
  export function createGradingAssignments(aqs: readonly AssignedQuestion[], numChunks: number) : GradingAssignmentSpecification[] {
    assert(aqs.length > 0, "Cannot create grading assignments for an empty array of assigned questions.")
    let exam_id = aqs[0].exam.exam_id;
    let question_id = aqs[0].question.question_id;

    let initialAssn : GradingAssignmentSpecification = {
      exam_id: exam_id,
      question_id: question_id,
      groups: aqs.map((aq, i) => ({
        submissions: [{
          question_uuid: aq.uuid,
          skin_replacements: aq.skin.replacements,
          student: aq.student,
          response: stringify_response(aq.submission)
        }],
        name: "group_" + i,
        representative_index: 0
      }))
    };

    return rechunkGradingAssignments([initialAssn], numChunks);
  }
  
  export function rechunkGradingAssignments(assns: GradingAssignmentSpecification[], numChunks: number) : GradingAssignmentSpecification[] {
    
    assert(assns.length > 0, "Grading assignments to rechunk must contain at least one assignment.");
    assert(Number.isInteger(numChunks), "Number of chunks must be an integer.");

    let { exam_id, question_id } = getAssnIds(assns);
    
    let groups = assns.flatMap(assn => assn.groups);
    groups.forEach((group, i) => group.name = `group_${i}`);

    let groupChunks = chunk(asMutable(groups), numChunks);

    return groupChunks.map((c, i) => ({
      exam_id: exam_id,
      question_id: question_id,
      groups: c
    }));
  }

  export function gradingAssignmentDir(exam_id: string, question_id: string) {
    return `data/${exam_id}/manual_grading/${question_id}`;
  }

  export function readGradingAssignments(exam_id: string, question_id: string) {
    let files = glob.sync(`${gradingAssignmentDir(exam_id, question_id)}/chunk*.json`);
    return files.map(
      filename => <GradingAssignmentSpecification>JSON.parse(readFileSync(filename, "utf8"))
    );
  }

  export function clearGradingAssignments(exam_id: string, question_id: string) {
    del.sync(`${gradingAssignmentDir(exam_id, question_id)}/*`);
  }

  export function writeGradingAssignments(assns: GradingAssignmentSpecification[]) {

    if (assns.length === 0) {
      return;
    }

    let { exam_id, question_id } = getAssnIds(assns);

    assns.forEach(assn => {
      let name = uniqueNamesGenerator({dictionaries: [colors, adjectives, animals], separator: "-"});
      writeFileSync(
        `${gradingAssignmentDir(exam_id, question_id)}/${name}.json`,
        JSON.stringify(assn, null, 2),
        { flag: "wx" } // Refuse to overwrite previous files (which could lose manual grading data)
      )
    });
  }

  // export function writeGradingAssignments(assns: GradingAssignmentSpecification[]) {

  //   const dir = `data/${exam_id}/manual_grading/${question_id}`;

  //   // Create output directories
  //   // (DO NOT CLEAR THEM OUT - we don't want to accidentally overwrite previous grading results)
  //   mkdirSync(dir, { recursive: true });

  //   // Is it safe to write grading assignments, or would we overwrite something?
  //   let wouldOverwrite = assns.some(assn => existsSync(`${dir}/${assn.staff_uniqname}.json`));

  //   if (!wouldOverwrite) {
  //     assns.forEach(assn => );
  //   }
  //   else {
  //     console.log(`Note: manual grading files for exam ${exam_id} and question ${question_id} already exist. Not generating new ones.`);
  //   }

  // }

}

function getAssnIds(assns: GradingAssignmentSpecification[]) {
  let exam_id = assns[0].exam_id;
  assert(assns.every(assn => assn.exam_id === exam_id), "All grading assignments to rechunk must have the same exam id.");

  let question_id = assns[0].question_id;
  assert(assns.every(assn => assn.question_id === question_id), "All grading assignments to rechunk must have the same question id.");
  return { exam_id, question_id };
}

export function writeFrontendJS(filename: string) {
  const jsDir = `out/js`;
  mkdirSync(jsDir, { recursive: true });
  copyFileSync(
    require.resolve(`examma-ray/dist/frontend/${filename}`),
    `${jsDir}/${filename}`
  );
}