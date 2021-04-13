import { GradingAssignmentSpecification, GradingAssignmentSubmission } from "./common";
import { CodeWritingGradingResult, CodeWritingRubricItem, CodeWritingRubricItemGradingResult, CodeWritingRubricItemStatus } from "../graders/CodeWritingGrader"
import { Blob } from 'blob-polyfill';
import { BLANK_SUBMISSION } from "../response/common";
import indentString from "indent-string";
import { Program, SourceFile } from "lobster/dist/js/core/Program"
import { SimpleExerciseLobsterOutlet } from "lobster/dist/js/view/SimpleExerciseLobsterOutlet"
import { createRunestoneExerciseOutlet } from "lobster/dist/js/view/embeddedExerciseOutlet"

import { highlightCode } from "../render";
import "highlight.js/styles/github.css";

import "./code-grader.css";
import { COMPLETION_ALL_CHECKPOINTS, COMPLETION_LAST_CHECKPOINT, Exercise, Project } from "lobster/dist/js/core/Project";
import "lobster/dist/css/buttons.css"
import "lobster/dist/css/main.css"
import "lobster/dist/css/code.css"
import "lobster/dist/css/exercises.css"
import "lobster/dist/css/frontend.css"
import { ProjectEditor } from "lobster/dist/js/view/editors";
import { Checkpoint, EndOfMainStateCheckpoint, OutputCheckpoint, StaticAnalysisCheckpoint } from "lobster/dist/js/analysis/checkpoints";
import { Predicates } from "lobster/dist/js/core/predicates";
import { containsConstruct } from "lobster/dist/js/analysis/analysis";
import { Simulation } from "lobster/dist/js/core/Simulation";
import "lobster/dist/js/lib/standard";
import { renderPointsWorthBadge, renderScoreBadge, renderUngradedBadge } from "../ui_components";
import { asMutable, assert } from "../util";
import { Question } from "../exams";
import { QuestionSpecification } from "../specification";

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


$(() => {
  $("body").html(`
    <div class="examma-ray-grading-sidebar">
      <button id="load-grading-assignment-button" class="btn btn-primary">Load Grading Assignment</button>
      <div class="examma-ray-submissions-column">

      </div>
    </div>
    <div class="examma-ray-grading-main-panel">
      <div id="lobster-exercise">

      </div>
    </div>
    <div class="examma-ray-grading-right-panel">
      <div class="examma-ray-grading-rubric-buttons">
      </div>
    </div>`
  );

  // let fileInput = $("#load-grading-assignment-input");
  let loadButton = $("#load-grading-assignment-button");

  loadButton.on("click", async () => {
    let [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    let assn = <CodeWritingGradingAssignment>JSON.parse(contents);
    console.log(assn);

    GRADING_APP.loadGradingAssignment(assn);
    // await writeFile(fileHandle, JSON.stringify(assn, null, 8));

    
    // await writeFile(fileHandle, JSON.stringify(assn, null, 2));

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




export type CodeWritingManualGraderAppSpecification = {
  question: QuestionSpecification,
  rubric: readonly CodeWritingRubricItem[],
  testHarness: string,
  autograders: {[index: string]: Checkpoint}
};

class CodeWritingManualGraderApp {

  public readonly question: QuestionSpecification;
  public readonly rubric: readonly CodeWritingRubricItem[];
  
  public readonly assn?: CodeWritingGradingAssignment;
  public readonly currentSubmission?: CodeWritingSubmission;

  public lobster: SimpleExerciseLobsterOutlet;

  private testHarness: string;

  private submissionGraders: CodeWritingManualGrader[] = [];

  private rubricButtonElems: JQuery[] = [];

  public constructor(spec: CodeWritingManualGraderAppSpecification) {
    this.question = spec.question;
    this.rubric = spec.rubric;
    this.testHarness = spec.testHarness;
    this.lobster = this.createLobster(spec);

    this.createRubricBar();
  }

  private createRubricBar() {
    let buttons = $(".examma-ray-grading-rubric-buttons");
    buttons.addClass("list-group")

    this.rubric.forEach((ri, i) => {
        let button = $(
          `<button type="button" class="list-group-item">
            <div><b>${ri.title}</b> ${renderPointsWorthBadge(ri.points)}</div>
            <p>${ri.description}</p>
          </button>`
        ).on("click", () => {
          this.toggleRubricItem(i);
        });
          
        buttons.append(button);
        this.rubricButtonElems.push(button);
    });
  }

  private createLobster(spec: CodeWritingManualGraderAppSpecification) {
    let lobsterElem = $("#lobster-exercise");
  
    lobsterElem.append(createRunestoneExerciseOutlet("1"));
  
    let ex = new Exercise({
      checkpoints: spec.rubric.filter(ri => spec.autograders[ri.id]).map(ri => spec.autograders[ri.id]),
      completionCriteria: COMPLETION_ALL_CHECKPOINTS,
      starterCode: "",
      completionMessage: "Code passes all checkpoints."
    })
  
    let project = new Project("test", undefined, [{ name: "file.cpp", isTranslationUnit: true, code: "" }], ex).turnOnAutoCompile(500);
    // new ProjectEditor($("#lobster-project-editor"), project);
    return new SimpleExerciseLobsterOutlet(lobsterElem, project);
  
  }

  private clearGradingAssignment() {

  }

  public loadGradingAssignment(assn: CodeWritingGradingAssignment) {
    asMutable(this).assn = assn;
    this.submissionGraders = assn.submissions.map(sub => new CodeWritingManualGrader(this, sub));
    this.submissionGraders.forEach(sg => $(".examma-ray-submissions-column").append(sg.thumbnailElem));
  }

  public openSubmission(sub: CodeWritingSubmission) {
    asMutable(this).currentSubmission = sub;

    let submittedCode = sub.response === BLANK_SUBMISSION ? "" : sub.response;
    let code = this.testHarness.replace("{{submission}}", indentString(submittedCode, 2));
    this.lobster.project.setFileContents(new SourceFile("file.cpp", code));

    if (!sub.grading_result) {
      sub.grading_result = {
        wasBlankSubmission: sub.response === BLANK_SUBMISSION,
        pointsEarned: 0,
        itemResults: this.rubric.map(ri => ({
          status: "unknown",
          pointsEarned: 0
        })),
        verified: false
      }
    }

    sub.grading_result.itemResults.forEach((res, i) => {
      this.setRubricItemButtonStatus(i, res.status)
    })
  }

  public setRubricItemButtonStatus(i: number, status: CodeWritingRubricItemStatus) {
    let elem = this.rubricButtonElems[i];
    elem.removeClass("active").removeClass("grayed");
    if (status === "on") {
      elem.addClass("active");
    }
    else if (status === "off") {
      elem.addClass("grayed");
    }
  }

  public toggleRubricItem(i: number) {
    assert(this.currentSubmission?.grading_result);
    let currentStatus = this.currentSubmission.grading_result.itemResults[i].status;
    if (currentStatus === "unknown") {
      currentStatus = "on";
    }
    else if (currentStatus === "on") {
      currentStatus = "off";
    }
    else if (currentStatus === "off") {
      currentStatus = "unknown";
    }
    this.currentSubmission.grading_result.itemResults[i].status = currentStatus;
    this.setRubricItemButtonStatus(i, currentStatus);
  }

};

let GRADING_APP: CodeWritingManualGraderApp;
export function configureGradingApp(spec: CodeWritingManualGraderAppSpecification) {
  GRADING_APP = new CodeWritingManualGraderApp(spec);
}

class CodeWritingManualGrader {
  
  public readonly app: CodeWritingManualGraderApp;
  public readonly submission: CodeWritingSubmission;

  public readonly thumbnailElem: JQuery;

  public constructor(app: CodeWritingManualGraderApp, submission: CodeWritingSubmission) {
    this.app = app;
    this.submission = submission;

    this.thumbnailElem = this.createSubmissionCard(this.submission);
  }

  private createSubmissionCard(sub: CodeWritingSubmission) {
    let code = sub.response === BLANK_SUBMISSION ? "" : sub.response;
    let jq = $(`
      <div class="panel panel-default examma-ray-code-submission-thumbnail">
        <div class="panel-heading">
          <button class="btn btn-primary">Load</button>
          ${sub.student.uniqname}
          ${sub.grading_result ? renderScoreBadge(sub.grading_result.pointsEarned, this.app.question.points) : renderUngradedBadge(this.app.question.points)}
        </div>
        <div class="panel-body">
          <pre><code>${highlightCode(code, CODE_LANGUAGE)}</code></pre>
        </div>
      </div>
    `);
    jq.find("button").on("click", () => {
      this.app.openSubmission(this.submission)
    })
    return jq;
  }

  public updateGradingResult(result: CodeWritingGradingResult) {
    this.submission.grading_result = result;
    this.thumbnailElem.find("badge").replaceWith(renderScoreBadge(result.pointsEarned, this.app.question.points))
  }

}






