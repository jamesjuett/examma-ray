import { RuntimeExam } from "./runtime_exam";

import "./frontend-doc.css";

if (typeof $ === "function") {
  $(main);
}
else {
  alert("It appears some required 3rd party libraries did not load. Please try refreshing the page (might take a few tries). If the problem persists, contact your course staff or instructors.")
}

function main() {
  new RuntimeExam({
    is_exam: false,
    // plugins: [
    //   SectionReferencePlugin,
    //   CommunityPlugin
    // ]
  });
}