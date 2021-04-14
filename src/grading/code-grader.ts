import { GradingAssignmentSpecification, GradingAssignmentSubmission } from "./common";
import { CodeWritingGradingResult, CodeWritingRubricItem, CodeWritingRubricItemGradingResult, CodeWritingRubricItemStatus } from "../graders/CodeWritingGrader"
import { Blob } from 'blob-polyfill';
import { BLANK_SUBMISSION } from "../response/common";
import indentString from "indent-string";
import { Program, SourceFile } from "lobster/dist/js/core/Program"
import { SimpleExerciseLobsterOutlet } from "lobster/dist/js/view/SimpleExerciseLobsterOutlet"
import { createRunestoneExerciseOutlet } from "lobster/dist/js/view/embeddedExerciseOutlet"

import { highlightCode, mk2html } from "../render";
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
import { renderPointsWorthBadge, renderScoreBadge, renderShortPointsWorthBadge, renderUngradedBadge } from "../ui_components";
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


type SubmissionsFilterCriterion = "all" | "graded" | "ungraded";
type SubmissionsSortOrdering = "name" | "score_asc" | "score_desc";

$(() => {
  $("body").html(`
    <div class="examma-ray-grading-sidebar">
      <button id="load-grading-assignment-button" class="btn btn-primary">Load Grading Assignment</button>
      <div>
        <b>Filter</b>
        <div class="btn-group" role="group">
          <button data-filter-criterion="all" type="button" class="examma-ray-submissions-filter-button btn btn-primary">All</button>
          <button data-filter-criterion="ungraded" type="button" class="examma-ray-submissions-filter-button btn btn-default">Ungraded</button>
          <button data-filter-criterion="graded" type="button" class="examma-ray-submissions-filter-button btn btn-default">Graded</button>
        </div>
      </div>
      <div>
        <b>Sort</b>
        <div class="btn-group" role="group">
          <button data-sort-ordering="name" type="button" class="examma-ray-submissions-sort-button btn btn-primary">Name</button>
          <button data-sort-ordering="score_asc" type="button" class="examma-ray-submissions-sort-button btn btn-default">Score Asc</button>
          <button data-sort-ordering="score_desc" type="button" class="examma-ray-submissions-sort-button btn btn-default">Score Desc</button>
        </div>
      </div>
      <div class="examma-ray-submissions-column">
      
      </div>
    </div>
    <div class="examma-ray-grading-main-panel">
      <div id="lobster-exercise">

      </div>
    </div>
    <div class="examma-ray-grading-right-panel">
      <button class="btn btn-primary" id="examma-ray-grading-autograde-button">Autograde!</button>
      <div class="examma-ray-grading-rubric-buttons">
      </div>
    </div>`
  );

  // let fileInput = $("#load-grading-assignment-input");
  let loadButton = $("#load-grading-assignment-button");
  let autogradeButton = $("#examma-ray-grading-autograde-button");

  loadButton.on("click", async () => GRADING_APP.loadGradingAssignment());

  autogradeButton.on("click", () => GRADING_APP.autograde());

  $(".examma-ray-submissions-filter-button").on("click", function() {
      $(".examma-ray-submissions-filter-button").removeClass("btn-primary").addClass("btn-default");
      $(this).removeClass("btn-default").addClass("btn-primary");
      GRADING_APP.setSubmissionsFilterCriterion($(this).data("filter-criterion"))
  })

  $(".examma-ray-submissions-sort-button").on("click", function() {
      $(".examma-ray-submissions-sort-button").removeClass("btn-primary").addClass("btn-default");
      $(this).removeClass("btn-default").addClass("btn-primary");
      GRADING_APP.setSubmissionsSortOrdering($(this).data("sort-ordering"))
  })

});

function isFullyGraded(sub: CodeWritingSubmission) {
  if (!sub.grading_result) {
    return false;
  }

  return !!sub.grading_result.itemResults.every(res => res.status !== "unknown");
}

const SUBMISSION_FILTERS : {
  [k in SubmissionsFilterCriterion]: (sub: CodeWritingSubmission) => boolean
} = {
  "all": (sub: CodeWritingSubmission) => true,
  "graded": (sub: CodeWritingSubmission) => isFullyGraded(sub),
  "ungraded": (sub: CodeWritingSubmission) => !isFullyGraded(sub),
}

export type CodeWritingManualGraderAppSpecification = {
  question: QuestionSpecification,
  rubric: readonly CodeWritingRubricItem[],
  testHarness: string,
  checkpoints: Checkpoint[],
  item_autograders?: {
    [index: string]: (ex: Exercise) => CodeWritingRubricItemStatus
  },
  overall_autograder?: (ex: Exercise) => boolean
};

class CodeWritingManualGraderApp {

  public readonly question: QuestionSpecification;
  public readonly rubric: readonly CodeWritingRubricItem[];
  private item_autograders: {
    [index: string]: (ex: Exercise) => CodeWritingRubricItemStatus
  };
  private overall_autograder?: (ex: Exercise) => boolean;
  
  public readonly assn?: CodeWritingGradingAssignment;
  public readonly currentSubmission?: CodeWritingSubmission;

  private fileHandle?: FileSystemFileHandle;

  public lobster: SimpleExerciseLobsterOutlet;

  private testHarness: string;

  private thumbnailElems: {[index: string]: JQuery} = {};
  private rubricButtonElems: JQuery[] = [];
  
  private submissionsFilterCriterion : SubmissionsFilterCriterion = "all";
  private submissionsSortOrdering : SubmissionsSortOrdering = "name";

  

  private SUBMISSION_SORTS : {
    [k in SubmissionsSortOrdering]: (a: CodeWritingSubmission, b: CodeWritingSubmission) => number
  } = {
    "name": (a: CodeWritingSubmission, b: CodeWritingSubmission) => a.student.uniqname.localeCompare(b.student.uniqname),
    "score_asc": (a: CodeWritingSubmission, b: CodeWritingSubmission) => this.pointsEarned(a.grading_result) - this.pointsEarned(b.grading_result),
    "score_desc": (a: CodeWritingSubmission, b: CodeWritingSubmission) => this.pointsEarned(b.grading_result) - this.pointsEarned(a.grading_result),
  }

  public constructor(spec: CodeWritingManualGraderAppSpecification) {
    this.question = spec.question;
    this.rubric = spec.rubric;
    this.testHarness = spec.testHarness;
    this.item_autograders = spec.item_autograders ?? {};
    this.overall_autograder = spec.overall_autograder;

    this.lobster = this.createLobster(spec);

    this.createRubricBar();

    setInterval(() => this.saveGradingAssignment(), 10000);
  }

  private createRubricBar() {
    let buttons = $(".examma-ray-grading-rubric-buttons");
    buttons.addClass("list-group");

    this.rubric.forEach((ri, i) => {
        let button = $(
          `<button type="button" class="list-group-item">
            ${renderShortPointsWorthBadge(ri.points)}
            <div><b>${mk2html(ri.title)}</b></div>
            ${mk2html(ri.description)}
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
      checkpoints: spec.checkpoints,
      completionCriteria: COMPLETION_ALL_CHECKPOINTS,
      starterCode: "",
      completionMessage: "Code passes all checkpoints."
    });
  
    let project = new Project("test", undefined, [{ name: "file.cpp", isTranslationUnit: true, code: "" }], ex).turnOnAutoCompile(500);
    // new ProjectEditor($("#lobster-project-editor"), project);
    return new SimpleExerciseLobsterOutlet(lobsterElem, project);
  
  }

  private closeGradingAssignment() {

  }

  public async loadGradingAssignment() {

    let [fileHandle] = await window.showOpenFilePicker();
    this.fileHandle = fileHandle;
    const file = await fileHandle.getFile();
    const contents = await file.text();
    let assn = <CodeWritingGradingAssignment>JSON.parse(contents);

    asMutable(this).assn = assn;
    this.saveGradingAssignment(); // immediate save prompts for permissions to save in the future

    this.clearThumbnails();
    this.createThumbnails();
  }

  private clearThumbnails() {
    $(".examma-ray-submissions-column").empty();
    this.thumbnailElems = {};
  }

  private createThumbnails() {
    if (!this.assn) { return; }
    this.assn.submissions
      .filter(SUBMISSION_FILTERS[this.submissionsFilterCriterion])
      .sort(this.SUBMISSION_SORTS[this.submissionsSortOrdering])
      .forEach(sub => $(".examma-ray-submissions-column").append(this.createThumbnail(sub)));
  }

  private createThumbnail(sub: CodeWritingSubmission) {
    let code = sub.response === BLANK_SUBMISSION ? "" : sub.response;
    let jq = $(`
      <div class="panel panel-default examma-ray-code-submission-thumbnail">
        <div class="panel-heading">
          ${sub.student.uniqname}
          ${sub.grading_result ? renderScoreBadge(this.pointsEarned(sub.grading_result), this.question.points) : renderUngradedBadge(this.question.points)}
        </div>
        <div class="panel-body">
          <pre><code>${highlightCode(code, CODE_LANGUAGE)}</code></pre>
        </div>
      </div>
    `);
    jq.on("click", () => {
      this.openSubmission(sub)
    });
    this.thumbnailElems[sub.question_uuid] = jq;
    return jq;
  }

  public setSubmissionsFilterCriterion(criterion: SubmissionsFilterCriterion) {
    this.submissionsFilterCriterion = criterion;
    this.clearThumbnails();
    this.createThumbnails();
  }

  public setSubmissionsSortOrdering(ordering: SubmissionsSortOrdering) {
    this.submissionsSortOrdering = ordering;
    this.clearThumbnails();
    this.createThumbnails();
  }

  public async saveGradingAssignment() {
    if (!this.assn || !this.fileHandle) {
      return;
    }

    const writable = await this.fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(JSON.stringify(this.assn, null, 2));
    // Close the file and write the contents to disk.
    await writable.close();
  }

  public openSubmission(sub: CodeWritingSubmission) {
    asMutable(this).currentSubmission = sub;

    let submittedCode = sub.response === BLANK_SUBMISSION ? "" : sub.response;
    let code = this.testHarness.replace("{{submission}}", indentString(submittedCode, 2));
    this.lobster.project.setFileContents(new SourceFile("file.cpp", code));

    $(".examma-ray-submissions-column").find(".panel-primary").removeClass("panel-primary");
    this.thumbnailElems[sub.question_uuid].addClass("panel-primary");

    if (!sub.grading_result) {
      sub.grading_result = {
        wasBlankSubmission: sub.response === BLANK_SUBMISSION,
        itemResults: this.rubric.map(ri => ({
          status: "unknown"
        })),
        verified: false
      }
    }

    this.updatedGradingResult();
  }

  public setRubricItemStatus(i: number, status: CodeWritingRubricItemStatus) {
    if (!this.currentSubmission?.grading_result) {
      return;
    }
    let gr = this.currentSubmission.grading_result;
    gr.itemResults[i].status = status;

    this.updatedGradingResult();
  }

  public toggleRubricItem(i: number) {
    if(!this.currentSubmission?.grading_result) {
      return;
    }
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
    this.setRubricItemStatus(i, currentStatus);
  }

  

  private updateRubricItemButtons() {
    if (!this.currentSubmission) {
      return;
    }

    this.currentSubmission.grading_result?.itemResults.forEach((res, i) => {
      this.updateRubricItemButton(i, res.status);
    })
  }

  private updateRubricItemButton(i: number, status: CodeWritingRubricItemStatus) {
    let elem = this.rubricButtonElems[i];
    elem.removeClass("active").removeClass("list-group-item-danger");
    if (status === "on") {
      elem.addClass("active");
    }
    else if (status === "off") {
      elem.addClass("list-group-item-danger");
    }
  }

  private updatedGradingResult() {
    if (!this.currentSubmission?.grading_result) {
      return;
    }

    let thumbElem = this.thumbnailElems[this.currentSubmission.question_uuid];
    thumbElem.find(".badge").replaceWith(renderScoreBadge(this.pointsEarned(this.currentSubmission.grading_result), this.question.points))
    
    this.updateRubricItemButtons();
  }

  private pointsEarned(gr?: CodeWritingGradingResult) {
    if (!gr) {
      return 0;
    }
    return Math.max(0, Math.min(this.question.points,
      gr.itemResults.reduce((p, res, i) => p + (res.status === "on" ? this.rubric[i].points : 0), 0)
    ));
  }

  public autograde() {
    if (!this.currentSubmission?.grading_result) {
      return;
    }
    let gr = this.currentSubmission.grading_result;

    if (this.overall_autograder && this.overall_autograder(this.lobster.project.exercise)) {
      gr.itemResults = this.rubric.map(ri => ({ status: "on" }));
    }
    else {
      gr.itemResults = this.rubric.map(
        ri => ({
          status: this.item_autograders[ri.id] ? this.item_autograders[ri.id](this.lobster.project.exercise) : "unknown"
        })
      );
    }


    this.updatedGradingResult();
  }

};

let GRADING_APP: CodeWritingManualGraderApp;
export function configureGradingApp(spec: CodeWritingManualGraderAppSpecification) {
  GRADING_APP = new CodeWritingManualGraderApp(spec);
}







