import { readdirSync, readFileSync } from "fs";
import { ExamSubmission, fillManifest, TrustedExamSubmission } from "./submissions";
import Papa from "papaparse";
import { StudentInfo } from "./exams";
import path from "path";

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

  export function loadRoster(filename: string) {
    return Papa.parse<StudentInfo>(readFileSync(filename, "utf8"), { header: true }).data;
  }
}