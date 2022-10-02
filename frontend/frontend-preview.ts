import { activateExam, activateExamComponents, setupCodeEditors } from "./common";

function main() {
  console.log("Attempting to start exam...");

  activateExamComponents();

  activateExam();

  setupCodeEditors(() => {});

  console.log("Exam Started!");

}

if (typeof $ === "function") {
  $(main);
}
else {
  alert("It appears some required 3rd party libraries did not load. Please try refreshing the page (might take a few tries). If the problem persists, contact your course staff or instructors.")
}