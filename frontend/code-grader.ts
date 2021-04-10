import { GradingAssignmentSpecification, GradingAssignmentSubmission } from "../src/grading/common";
import { CodeWritingGradingResult } from "../src/graders/CodeWritingGrader"
import { Blob } from 'blob-polyfill';
import { BLANK_SUBMISSION } from "../src/response/common";
import { Program, SourceFile } from "lobster/dist/js/core/Program"
import { SimpleExerciseLobsterOutlet } from "lobster/dist/js/view/SimpleExerciseLobsterOutlet"
import { createRunestoneExerciseOutlet } from "lobster/dist/js/view/embeddedExerciseOutlet"

import { highlightCode } from "../src/render";
import "highlight.js/styles/github.css";

import "./code-grader.css";
import { COMPLETION_ALL_CHECKPOINTS, COMPLETION_LAST_CHECKPOINT, Exercise, Project } from "lobster/dist/js/core/Project";
import "lobster/dist/css/buttons.css"
import "lobster/dist/css/main.css"
import "lobster/dist/css/code.css"
import "lobster/dist/css/exercises.css"
import "lobster/dist/css/frontend.css"
import { ProjectEditor } from "lobster/dist/js/view/editors";
import { EndOfMainStateCheckpoint, OutputCheckpoint, StaticAnalysisCheckpoint } from "lobster/dist/js/analysis/checkpoints";
import { Predicates } from "lobster/dist/js/core/predicates";
import { containsConstruct } from "lobster/dist/js/analysis/analysis";
import { Simulation } from "lobster/dist/js/core/Simulation";

// A significant amount of this code for interacting with the file
// system is based on the File System Access API tutorial and
// documentation at https://web.dev/file-system-access/

// TODO: replace with dependence on question specification
const CODE_LANGUAGE = "cpp";

type CodeWritingGradingAssignment = GradingAssignmentSpecification<"code_editor", CodeWritingGradingResult>;
type CodeWritingSubmission = GradingAssignmentSubmission<"code_editor", CodeWritingGradingResult>;

async function writeFile(fileHandle: FileSystemFileHandle, contents: string) {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable();
  // Write the contents of the file to the stream.
  await writable.write(contents);
  // Close the file and write the contents to disk.
  await writable.close();
}

function lobsterLoadSubmissionCode(code: string) {
  LOBSTER.project.setFileContents(new SourceFile("file.cpp", applyHarness(code)));
}

function createSubmissionCard(sub: CodeWritingSubmission) {
  let code = sub.response === BLANK_SUBMISSION ? "" : sub.response;
  let jq = $(`
    <div class="panel panel-default">
      <div class="panel-heading">
        ${sub.student.uniqname} <button class="btn btn-primary">Load</button>
      </div>
      <div class="panel-body">
        <pre><code>${highlightCode(code, CODE_LANGUAGE)}</code></pre>
      </div>
    </div>
  `);
  jq.find("button").on("click", () => {
    lobsterLoadSubmissionCode(code);
  })
  return jq;
}

$(() => {
  // let fileInput = $("#load-grading-assignment-input");
  let loadButton = $("#load-grading-assignment-button");

  // Enable/disable the load button based on whether a file is selected
  // fileInput.on("change", function() {
  //   let files = (<HTMLInputElement>this).files;
  //   if (files && files.length > 0) {
  //     loadButton.prop("disabled", false).removeClass("disabled");
  //   }
  //   else {
  //     loadButton.prop("disabled", true).addClass("disabled");
  //   }
  // });
  createLobster();

  loadButton.on("click", async () => {
    let [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    let assn = <CodeWritingGradingAssignment>JSON.parse(contents);
    console.log(assn);

    // await writeFile(fileHandle, JSON.stringify(assn, null, 8));

    
    // await writeFile(fileHandle, JSON.stringify(assn, null, 2));
    
    assn.submissions.forEach(sub => $(".examma-ray-submissions-column").append(createSubmissionCard(sub)));
    let sub = assn.submissions[0];

    let code = sub.response === BLANK_SUBMISSION ? "" : sub.response;
    lobsterLoadSubmissionCode(code);

    // let files = (<HTMLInputElement>fileInput[0]).files;

    // // only do something if there was a file selected
    // // note - there is logic elsewhere to disable the button if there
    // // is no file selected, so this is just here for completeness
    // if (files && files.length > 0) {
    //   try {
    //     let answers = <GradingAssignmentSpecification>JSON.parse(await files[0].text());
    //     alert(`This grading assignment is for ${answers.staff_uniqname}...is that you?`);
    //     console.log(answers.)
    //   }
    //   catch(err) {
    //     alert("Sorry, an error occurred while processing that file. Is it a properly formatted grading assignment JSON file?");
    //     // TODO add a more rigorous check if the file is not properly formatted than just checking for exceptions
    //   }
    // }
    // fileInput.val("");
    // loadButton.prop("disabled", true).addClass("disabled");
  })
});

let LOBSTER: SimpleExerciseLobsterOutlet;

function createLobster() {
  let lobsterElem = $("#lobster-exercise");

  lobsterElem.append(createRunestoneExerciseOutlet("1"));

  let ex = new Exercise({
    checkpoints: [
      
      new StaticAnalysisCheckpoint("Contains Recursive Call", (program: Program) => {
          return containsConstruct(program, Predicates.byFunctionCallName("countEqual"));
      }),
      new StaticAnalysisCheckpoint("Contains Recursive Call", (program: Program) => {
          return containsConstruct(program, Predicates.byFunctionCallName("countEqual"));
      }),
      new EndOfMainStateCheckpoint("Passes Test Cases", (sim: Simulation) => {
        return !sim.hasAnyEventOccurred
      }, "", 10000)
    ],
    completionCriteria: COMPLETION_LAST_CHECKPOINT,
    starterCode: "",
    completionMessage: "Code passes test cases - submission is 100% correct!"
  })

  let project = new Project("test", undefined, [{ name: "file.cpp", isTranslationUnit: true, code: applyHarness("") }], ex).turnOnAutoCompile(500);
  // new ProjectEditor($("#lobster-project-editor"), project);
  LOBSTER = new SimpleExerciseLobsterOutlet(lobsterElem, project);
}

function applyHarness(sub: string) {
  return  `
  struct Node {
      int datum;
      Node *left;
      Node *right;
      
      Node(int datum, Node *left, Node *right)
        : datum(datum), left(left), right(right) { }
    };
    
    int countEqual(const Node *root, int compare) {
      ${sub}
    }
    
    int main() {
      Node *null = 0;
      Node *lll = new Node(4,null,null);
      Node *llr = new Node(5,null,null);
      Node *ll = new Node(2,lll,llr);
      Node *lrl = new Node(4,null,null);
      Node *lr = new Node(1,lrl,null);
      Node *l = new Node(3,ll,lr);
      Node *rrl = new Node(4,null,null);
      Node *rr = new Node(4,rrl,null);
      Node *r = new Node(1,null,rr);
      Node *root = new Node(4,l,r);
      assert(countEqual(root, 4) == 5);
    }
`;
}