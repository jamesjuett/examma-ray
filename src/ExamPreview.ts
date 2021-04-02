// import { readdirSync, readFileSync } from "fs";
// import { ExamSubmission, fillManifest, TrustedExamSubmission } from "./submissions";
// import Papa from "papaparse";
// import { AssignedExam, AssignedSection, Exam, Section, StudentInfo } from "./exams";
// import path from "path";
// import { assert } from "./util";
// import { chooseSections, SectionChooser, SectionSpecification } from "./specification";
// import { v4 } from "uuid";
// import { QuestionSkin } from "./skins";
// import { Randomizer, createSectionChoiceRandomizer } from "./randomization";

// export namespace ExamUtils {


//   export function createSectionPreview(
//     section: Section | SectionSpecification | SectionChooser,
//     student: StudentInfo,
//     rand?: Randomizer)
//   {
//     let exam = new Exam({
//       id: `preview`,
//       title: "Preview",
//       mk_intructions: "This is a preview",
//       frontend_js_path
//       sections
//     })
//     let ae = new AssignedExam(
//       this.createPreviewUuid(),
//       this.exam,
//       student,
//       chooseSections(section, this.exam, student, rand)
//         .map((s, sectionIndex) => this.createRandomizedSection(s, student, sectionIndex))
//     );

//     this.checkExam(ae);

//     return ae;
//   }

  
// }

// function createPreviewUuid() {
//   return uuidv4();
// }