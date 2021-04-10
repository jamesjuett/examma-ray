import { readdirSync, readFileSync } from "fs";
import { ExamSubmission, fillManifest, TrustedExamSubmission } from "./submissions";
import Papa from "papaparse";
import { AssignedQuestion, StudentInfo } from "./exams";
import path from "path";
import { assert } from "./util";

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

}