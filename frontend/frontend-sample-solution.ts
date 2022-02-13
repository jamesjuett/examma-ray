import 'codemirror/addon/comment/comment.js';
import 'codemirror/keymap/sublime.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import "highlight.js/styles/github.css";
import 'katex/dist/katex.min.css';
import { ResponseKind } from "../src/response/common";
import { activate_response } from "../src/response/responses";
import './codemirror-modes';
import { activateExamComponents } from "./common";
import "./frontend-sample-solution.css";
import "./frontend.css";




function activateResponse(this: HTMLElement) {
  let response = $(this);
  activate_response(<ResponseKind>response.data("response-kind"), true, response);
}

function activateExam() {
  $(".examma-ray-question-response").map(activateResponse).get()
}

function main() {
  console.log("Attempting to activate sample solution...");

  activateExamComponents();

  activateExam();
  

  console.log("Sample solution activated!");

}

if (typeof $ === "function") {
  $(main);
}
else {
  alert("It appears some required 3rd party libraries did not load. Please try refreshing the page (might take a few tries). If the problem persists, contact your course staff or instructors.")
}
















