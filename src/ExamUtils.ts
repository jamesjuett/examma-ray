import { readdirSync, readFileSync, copyFileSync, mkdirSync, existsSync, writeFileSync } from "fs";
import { ExamSubmission, fillManifest, TrustedExamSubmission } from "./core/submissions";
import Papa from "papaparse";
import { AssignedQuestion } from "./core/assigned_exams";
import path from "path";
import { asMutable, assert, assertNever } from "./core/util";
import { chunk } from "simple-statistics";
import { stringify_response } from "./response/responses";
import { v4 as uuidv4, v5 as uuidv5} from 'uuid';

import glob from "glob";
import del from "del";
import "colors";

import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { ExamSpecification, StudentInfo } from "./core/exam_specification";
import { UUID_Strategy } from "./ExamGenerator";
import { ncp } from "ncp";
import { Exam, Question, Section } from "./core";

export namespace ExamUtils {

  export function parseExamSpecification(str: string) : ExamSpecification {
    return JSON.parse(
      str,
      (key: string, value: any) => {
        if (typeof value === "object" && typeof value["examma_ray_serialized_regex"] === "object") {
          return new RegExp(
            value["examma_ray_serialized_regex"]["source"],
            value["examma_ray_serialized_regex"]["flags"]
          );
        }
        return value;
      }
    );
  }

  export function readExamSpecificationFromFileSync(filename: string) : ExamSpecification {
    return parseExamSpecification(readFileSync(filename, "utf8"));
  }

  export function stringifyExamSpecification(spec: ExamSpecification) : string {
    return JSON.stringify(
      spec,
      (key: string, value: any) => {
        if (value instanceof RegExp) {
          return {
            examma_ray_serialized_regex: {
              source: value.source,
              flags: value.flags
            }
          }
        }
        return value;
      },
      2
    );
  }

  export function writeExamSpecificationToFileSync(filename: string, spec: ExamSpecification) {
    writeFileSync(filename, stringifyExamSpecification(spec), "utf8");
  }

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
          let trustedSub = loadTrustedSubmission(
            manifestDirectory,
            path.join(submittedDirectory, filename)
          );
          trustedAnswers.push(trustedSub);
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

  export function writeExamMedia(media_out_dir: string, exam: Exam, all_sections: readonly Section[], all_questions: readonly Question[]) {
    
    // Copy overall exam media
    exam.media_dir && copyFrontendMedia(exam.media_dir, path.join(media_out_dir, "exam", exam.exam_id));

    // Copy media for all sections
    all_sections.forEach(
      s => s?.media_dir && copyFrontendMedia(s.media_dir, path.join(media_out_dir, "section", s.section_id))
    );

    // Copy media for all questions
    all_questions.forEach(
      q => q?.media_dir && copyFrontendMedia(q.media_dir, path.join(media_out_dir, "question", q.question_id))
    );
  }
}

export function writeFrontendJS(outDir: string, filename: string) {
  mkdirSync(outDir, { recursive: true });
  try {
    let path = require.resolve(`examma-ray/dist/frontend/${filename}`);
    copyFileSync(
      path,
      `${outDir}/${filename}`
    );
    console.log("Copied frontend JS bundle.")
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
          console.log(`Failed to find and copy frontend JS: ${filename}`.red);
        }
      }
    }
    else {
      throw e;
    }
  }
}

export function copyFrontendMedia(media_source_dir: string, frontend_media_dir: string) {
  mkdirSync(frontend_media_dir, { recursive: true });

  ncp(
    media_source_dir,
    frontend_media_dir,
    (err) => { // callback
      if (!err) {
        console.log("Copied exam media.")
      }
      else {
        console.error("ERROR copying frontend media".red);
      }
    }
  )

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
  uuid_strategy: UUID_Strategy,
  uuidv5_namespace?: string,
}, student: StudentInfo, id: string) {
  if(options.uuid_strategy === "plain") {
    return student.uniqname + "-" + id;
  }
  else if (options.uuid_strategy === "uuidv4") {
    return uuidv4();
  }
  else if (options.uuid_strategy === "uuidv5") {
    assert(options.uuidv5_namespace);
    return uuidv5(student.uniqname + "-" + id, options.uuidv5_namespace!);
  }
  else {
    assertNever(options.uuid_strategy);
  }
}