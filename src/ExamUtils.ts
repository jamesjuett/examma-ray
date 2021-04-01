import { readdirSync, readFileSync } from "fs";
import { ExamSubmission, fillManifest, TrustedExamSubmission } from "./submissions";
import Papa from "papaparse";
import { StudentInfo } from "./exams";
import path from "path";
import { assert } from "./util";

export namespace ExamUtils {

  export function loadExamAnswers(filename: string) : ExamSubmission {
    return <ExamSubmission>JSON.parse(readFileSync(filename, "utf8"));
  }

  export function loadTrustedSubmission(manifestFilename: string, submittedFilename: string) {
    return fillManifest(
      loadExamAnswers(manifestFilename),
      loadExamAnswers(submittedFilename)
    );
  }

  export function loadTrustedSubmissions(manifestDirectory: string, submittedDirectory: string) {
    let trustedAnswers : TrustedExamSubmission[] = [];
    readdirSync(manifestDirectory).forEach(
      filename => {
        try {
          trustedAnswers.push(loadTrustedSubmission(
            path.join(manifestDirectory, filename),
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
  }
}