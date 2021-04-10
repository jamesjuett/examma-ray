import { GradingAssignmentSpecification, GradingAssignmentSubmission } from "../src/grading/common";
import { CodeWritingGradingResult } from "../src/graders/CodeWritingGrader"
import { Blob } from 'blob-polyfill';
import { BLANK_SUBMISSION } from "../src/response/common";

import { highlightCode } from "../src/render";
import "highlight.js/styles/github.css";

import "./code-grader.css";

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

function renderSubmissionCard(sub: CodeWritingSubmission) {
  console.log("r: " + (sub.response === BLANK_SUBMISSION ? "" : sub.response));
  return `
    <div class="card">
      <div class="card-header">
        ${sub.student.uniqname}
      </div>
      <div class="card-body">
        <pre><code>${highlightCode(sub.response === BLANK_SUBMISSION ? "" : sub.response, CODE_LANGUAGE)}</code></pre>
      </div>
    </div>
  `;
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

  loadButton.on("click", async () => {
    let [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    let assn = <CodeWritingGradingAssignment>JSON.parse(contents);
    console.log(assn);

    // await writeFile(fileHandle, JSON.stringify(assn, null, 8));

    
    // await writeFile(fileHandle, JSON.stringify(assn, null, 2));
    
    $(".examma-ray-submissions-column").html(assn.submissions.map(sub => renderSubmissionCard(sub)).join(""))
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