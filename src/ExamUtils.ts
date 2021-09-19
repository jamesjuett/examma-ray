import { readdirSync, readFileSync, copyFileSync, mkdirSync, existsSync, writeFileSync } from "fs";
import { ExamSubmission, fillManifest, TrustedExamSubmission } from "./submissions";
import Papa from "papaparse";
import { AssignedQuestion, StudentInfo } from "./exams";
import path from "path";
import { asMutable, assert, assertNever } from "./util";
import { chunk } from "simple-statistics";
import { stringify_response } from "./response/responses";
import { GradingAssignmentSpecification } from "./grading/common";
import { v4 as uuidv4, v5 as uuidv5} from 'uuid';

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

  export function loadTrustedSubmissions(manifestDirectory: string, submittedDirectory: string, trustedCacheDirectory?: string) {
    if (trustedCacheDirectory) {
      mkdirSync(trustedCacheDirectory, {recursive: true});
    }
    
    let trustedAnswers : TrustedExamSubmission[] = [];
    readdirSync(submittedDirectory).forEach(
      filename => {
        try {
          if (trustedCacheDirectory && existsSync(path.join(trustedCacheDirectory, filename))) {
            trustedAnswers.push(<TrustedExamSubmission>loadExamAnswers(
              path.join(trustedCacheDirectory, filename)
            ));
          }
          else {
            let trustedSub = loadTrustedSubmission(
              manifestDirectory,
              path.join(submittedDirectory, filename)
            );
            trustedAnswers.push(trustedSub);
            if (trustedCacheDirectory) {
              writeFileSync(
                path.join(trustedCacheDirectory, filename),
                JSON.stringify(trustedSub, null, 2), {encoding: "utf-8"}
              );
            }
          }
        }
        catch(e) {
          console.log("WARNING - unable to open submission file: " + filename);
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
        representative_index: 0,
        grading_result: undefined
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

    let chunkSize = Math.ceil(groups.length / numChunks);

    let groupChunks = chunk(asMutable(groups), chunkSize);

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
    let files = glob.sync(`${gradingAssignmentDir(exam_id, question_id)}/*.json`);
    return files.map(filename => {
      let assn = <GradingAssignmentSpecification>JSON.parse(readFileSync(filename, "utf8"));
      if (!assn.name) {
        assn.name = path.basename(filename).replace(".json", "");
      }
      return assn;
    });
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
      let name = uniqueNamesGenerator({dictionaries: [adjectives, colors, animals], separator: "-"});
      let dir = gradingAssignmentDir(exam_id, question_id);
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        `${dir}/${name}.json`,
        JSON.stringify(Object.assign({}, assn, {name: name}), null, 2),
        { flag: "wx" } // Refuse to overwrite previous files (which could lose manual grading data)
      )
    });
  }
}

function getAssnIds(assns: GradingAssignmentSpecification[]) {
  let exam_id = assns[0].exam_id;
  assert(assns.every(assn => assn.exam_id === exam_id), "All grading assignments to rechunk must have the same exam id.");

  let question_id = assns[0].question_id;
  assert(assns.every(assn => assn.question_id === question_id), "All grading assignments to rechunk must have the same question id.");
  return { exam_id, question_id };
}

export function writeFrontendJS(outDir: string, filename: string) {
  mkdirSync(outDir, { recursive: true });
  try {
    let path = require.resolve(`examma-ray/dist/frontend/${filename}`);
    copyFileSync(
      path,
      `${outDir}/${filename}`
    );
  }
  catch(e: any) {
    if (e.code === "MODULE_NOT_FOUND") {

      try {
        copyFileSync(
          `../node_modules/examma-ray/dist/frontend/${filename}`,
          `${outDir}/${filename}`
        );
        console.log("Cannot resolve and copy frontend JS, using local copy instead.");
      }
      catch(e) {
        try {
          copyFileSync(
            `dist/frontend/${filename}`,
            `${outDir}/${filename}`
          );
          console.log("Cannot resolve and copy frontend JS, using local copy instead.");
        }
        catch(e) {
          console.log("Failed to find and copy frontend JS".red);
        }
      }
    }
    else {
      throw e;
    }
  }
}

/**
 * Takes an ID for an exam, section, or question and creates a uuid
 * for a particular student's instance of that entity. The uuid is
 * created based on the policy specified in the `ExamGenerator`'s
 * options when it is created.
 * @param student 
 * @param id 
 * @returns 
 */
export function createStudentUuid(options: {
  student_ids: "uniqname" | "uuidv4" | "uuidv5",
  uuidv5_namespace?: string,
}, student: StudentInfo, id: string) {
  if(options.student_ids === "uniqname") {
    return student.uniqname + "-" + id;
  }
  else if (options.student_ids === "uuidv4") {
    return uuidv4();
  }
  else if (options.student_ids === "uuidv5") {
    assert(options.uuidv5_namespace);
    return uuidv5(student.uniqname + "-" + id, options.uuidv5_namespace!);
  }
  else {
    assertNever(options.student_ids);
  }
}