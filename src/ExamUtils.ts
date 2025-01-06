import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import Papa from "papaparse";
import path from "path";
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { ExamManifest, ExamSubmission, fillManifest, hasResponses, isTransparentExamManifest, parseExamManifest, parseExamSubmission, TrustedExamSubmission } from "./core/submissions";
import { assert, assertNever } from "./core/util";

import "colors";

import { ncp } from "ncp";
import { Exam, Question, Section } from "./core";
import { ExamSpecification, parseExamComponentSpecification, stringifyExamComponentSpecification, StudentInfo } from "./core/exam_specification";
import { UUID_Strategy } from "./ExamGenerator";

export namespace ExamUtils {

  export function readExamSpecificationFromFileSync(filename: string) : ExamSpecification {
    return <ExamSpecification>parseExamComponentSpecification(readFileSync(filename, "utf8"));
  }

  export function writeExamSpecificationToFileSync(filename: string, spec: ExamSpecification) {
    writeFileSync(filename, stringifyExamComponentSpecification(spec), "utf8");
  }

  export function loadExamSubmission(filename: string) : ExamSubmission {
    return parseExamSubmission(readFileSync(filename, "utf8"));
  }

  export function loadExamManifest(filename: string) : ExamManifest {
    return parseExamManifest(readFileSync(filename, "utf8"));
  }

  export function loadTrustedSubmission(manifestDirectory: string, submittedFilename: string) {
    let submitted = loadExamSubmission(submittedFilename);
    let manifest = loadExamManifest(path.join(manifestDirectory, submitted.student.uniqname + "-" + submitted.uuid + ".json"));
    assert(isTransparentExamManifest(manifest));
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

  export function writeExamAssets(asset_out_dir: string, exam: Exam, all_sections: readonly Section[], all_questions: readonly Question[]) {
    
    // Copy overall exam assets
    exam.assets_dir && copyFrontendAssets(exam.assets_dir, asset_out_dir);

    // Copy assets for all sections
    all_sections.forEach(
      s => s?.assets_dir && copyFrontendAssets(s.assets_dir, path.join(asset_out_dir, "section", s.section_id))
    );

    // Copy assets for all questions
    all_questions.forEach(
      q => q?.assets_dir && copyFrontendAssets(q.assets_dir, path.join(asset_out_dir, "question", q.question_id))
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

export function copyFrontendAssets(asset_source_dir: string, frontend_assets_dir: string) {
  mkdirSync(frontend_assets_dir, { recursive: true });

  ncp(
    asset_source_dir,
    frontend_assets_dir,
    (err) => { // callback
      if (!err) {
        console.log("Copied exam assets.")
      }
      else {
        console.error("ERROR copying frontend assets".red);
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