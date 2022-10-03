import "./frontend-solution.css";
import "./frontend.css";

import { activateExam, activateExamComponents } from "./common";

function main() {
  console.log("Attempting to activate solution...");

  activateExamComponents();

  activateExam();
  

  console.log("Solution activated!");

}

if (typeof $ === "function") {
  $(main);
}
else {
  alert("It appears some required 3rd party libraries did not load. Please try refreshing the page (might take a few tries). If the problem persists, contact your course staff or instructors.")
}
















