import { GradingGroup, GradingAssignmentSpecification, GradingSubmission } from "./common";
import { CodeWritingGradingResult, CodeWritingRubricItem, CodeWritingRubricItemGradingResult, CodeWritingRubricItemStatus } from "../graders/CodeWritingGrader"
import { Blob } from 'blob-polyfill';
import { BLANK_SUBMISSION } from "../response/common";
import indentString from "indent-string";
import { Program, SimpleProgram, SourceFile } from "lobster/dist/js/core/Program"
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
type CodeWritingGradingGroup = GradingGroup<"code_editor", CodeWritingGradingResult>;
type CodeWritingSubmission = GradingSubmission<"code_editor", CodeWritingGradingResult>;


type SubmissionsFilterCriterion = "all" | "graded" | "ungraded";
type SubmissionsSortOrdering = "name" | "score_asc" | "score_desc";

$(() => {
  $("body").html(`
    <div class="examma-ray-grading-sidebar">
      <div class="examma-ray-grading-controls">
        <span class="examma-ray-grading-title"></span>
        <button id="load-grading-assignment-button" class="btn btn-primary">Load Grading Assignment</button>
        <div>
          <b>Filter</b>
          <div class="btn-group" role="group">
            <button data-filter-criterion="all" type="button" class="examma-ray-submissions-filter-button btn btn-primary">All</button>
            <button data-filter-criterion="ungraded" type="button" class="examma-ray-submissions-filter-button btn btn-default">Ungraded</button>
            <button data-filter-criterion="graded" type="button" class="examma-ray-submissions-filter-button btn btn-default">Graded</button>
          </div>
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
      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#groups-modal">Review Group Members</button>
      <button type="button" class="btn btn-primary examma-ray-auto-group-button">Auto-Group</button>
      <div id="lobster-exercise">

      </div>
    </div>
    <div class="examma-ray-grading-right-panel">
      <button class="btn btn-primary" id="examma-ray-grading-autograde-button">Autograde!</button>
      <div class="examma-ray-grading-rubric-buttons">
      </div>
    </div>
    
    <div class="modal fade" id="groups-modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" style="width: 95vw" role="document">
        <div class="modal-content">
          <div class="examma-ray-group-member-thumbnails">
          </div>
        </div>
      </div>
    </div>
    
    <div class="modal fade" id="examma-ray-grouping-progress-modal" tabindex="-1" role="dialog" data-backdrop="static">
      <div class="modal-dialog modal-sm" role="document">
        <div class="modal-header">
          <h4 class="modal-title">Auto-Grouping...</h4>
        </div>
        <div class="modal-content">
          <div class="examma-ray-grouping-progress">
            Processing...
            <div class="progress">
              <div class="progress-bar" role="progressbar" style="width: 2%;">
                0%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`
  );

  // let fileInput = $("#load-grading-assignment-input");
  let loadButton = $("#load-grading-assignment-button");
  let autogradeButton = $("#examma-ray-grading-autograde-button");

  loadButton.on("click", () => GRADING_APP.loadGradingAssignmentFile());

  autogradeButton.on("click", () => GRADING_APP.autograde());

  $(".examma-ray-submissions-filter-button").on("click", function() {
      $(".examma-ray-submissions-filter-button").removeClass("btn-primary").addClass("btn-default");
      $(this).removeClass("btn-default").addClass("btn-primary");
      GRADING_APP.setSubmissionsFilterCriterion($(this).data("filter-criterion"))
  });

  $(".examma-ray-submissions-sort-button").on("click", function() {
      $(".examma-ray-submissions-sort-button").removeClass("btn-primary").addClass("btn-default");
      $(this).removeClass("btn-default").addClass("btn-primary");
      GRADING_APP.setSubmissionsSortOrdering($(this).data("sort-ordering"))
  });

  $(".examma-ray-auto-group-button").on("click", async function() {
      GRADING_APP.autoGroup()
  });

});

function isFullyGraded(sub: CodeWritingGradingGroup) {
  if (!sub.grading_result) {
    return false;
  }

  return !!Object.values(sub.grading_result.itemResults).every(res => res!.status !== "unknown");
}

const SUBMISSION_FILTERS : {
  [k in SubmissionsFilterCriterion]: (sub: CodeWritingGradingGroup) => boolean
} = {
  "all": (sub: CodeWritingGradingGroup) => true,
  "graded": (sub: CodeWritingGradingGroup) => isFullyGraded(sub),
  "ungraded": (sub: CodeWritingGradingGroup) => !isFullyGraded(sub),
}

export type CodeWritingManualGraderAppSpecification = {
  question: QuestionSpecification,
  rubric: readonly CodeWritingRubricItem[],
  testHarness: string,
  preprocess?: (submission: string) => string,
  checkpoints: Checkpoint[],
  autograder: (ex: Exercise) => CodeWritingGradingResult,
  groupingFunctionName: string
};

class CodeWritingManualGraderApp {

  public readonly question: QuestionSpecification;
  public readonly rubric: readonly CodeWritingRubricItem[];
  private autograder: (ex: Exercise) => CodeWritingGradingResult;
  private overall_autograder?: (ex: Exercise) => boolean;
  
  public readonly assn?: CodeWritingGradingAssignment;
  public readonly currentGroup?: CodeWritingGradingGroup;

  private fileHandle?: FileSystemFileHandle;

  public lobster: SimpleExerciseLobsterOutlet;

  private preprocess?: (submission: string) => string;
  private testHarness: string;
  private groupingFunctionName: string;

  private groupMemberThumbnailsElem: JQuery;

  private thumbnailElems: {[index: string]: JQuery} = {};
  private rubricButtonElems: JQuery[] = [];
  
  private submissionsFilterCriterion : SubmissionsFilterCriterion = "all";
  private submissionsSortOrdering : SubmissionsSortOrdering = "name";

  

  private SUBMISSION_SORTS : {
    [k in SubmissionsSortOrdering]: (a: CodeWritingGradingGroup, b: CodeWritingGradingGroup) => number
  } = {
    "name": (a: CodeWritingGradingGroup, b: CodeWritingGradingGroup) => a.name.localeCompare(b.name, undefined, {numeric: true}),
    "score_asc": (a: CodeWritingGradingGroup, b: CodeWritingGradingGroup) => this.pointsEarned(a.grading_result) - this.pointsEarned(b.grading_result),
    "score_desc": (a: CodeWritingGradingGroup, b: CodeWritingGradingGroup) => this.pointsEarned(b.grading_result) - this.pointsEarned(a.grading_result),
  }

  public constructor(spec: CodeWritingManualGraderAppSpecification) {
    this.question = spec.question;
    this.rubric = spec.rubric;
    this.testHarness = spec.testHarness;
    this.autograder = spec.autograder;
    this.preprocess = spec.preprocess;
    this.groupingFunctionName = spec.groupingFunctionName;

    this.groupMemberThumbnailsElem = $(".examma-ray-group-member-thumbnails");

    this.lobster = this.createLobster(spec);

    this.createControls();

    this.createRubricBar();

    // setInterval(() => this.saveGradingAssignment(), 10000);
  }

  private createControls() {
    $(".examma-ray-grading-title").html(this.question.id);
  }

  private createRubricBar() {
    let buttons = $(".examma-ray-grading-rubric-buttons");
    buttons.addClass("list-group");

    this.rubric.forEach((ri, i) => {
        let button = $(
          `<button type="button" class="list-group-item">
            ${renderShortPointsWorthBadge(ri.points)}
            <div class="examma-ray-rubric-item-title"><b>${mk2html(ri.title)}</b></div>
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
    
    this.clearThumbnails();
    this.clearGroup();

  }

  public async loadGradingAssignmentFile() {

    let [fileHandle] = await window.showOpenFilePicker();
    this.fileHandle = fileHandle;
    const file = await fileHandle.getFile();
    const contents = await file.text();
    let assn = <CodeWritingGradingAssignment>JSON.parse(contents);

    if (assn.question_id !== this.question.id) {
      alert("The question ID for that grading assignment does not match the question ID for this rubric.");
      return;
    }

    this.setGradingAssignment(assn);

    await this.saveGradingAssignment(); // immediate save prompts for permissions to save in the future
  }

  private setGradingAssignment(assn: CodeWritingGradingAssignment) {
    // this.closeGradingAssignment();

    asMutable(this).assn = assn;

    // this.createThumbnails();
  }

  private clearThumbnails() {
    $(".examma-ray-submissions-column").empty();
    this.thumbnailElems = {};
  }

  private createThumbnails() {
    if (!this.assn) { return; }
    this.assn.groups
      .filter(SUBMISSION_FILTERS[this.submissionsFilterCriterion])
      .sort(this.SUBMISSION_SORTS[this.submissionsSortOrdering])
      .forEach(group => $(".examma-ray-submissions-column").append(this.createGroupThumbnail(group)));
  }

  private createGroupThumbnail(group: CodeWritingGradingGroup) {
    assert(group.submissions.length > 0);
    let firstSub = group.submissions[group.representative_index];
    let code = firstSub.response === BLANK_SUBMISSION ? "" : firstSub.response;
    let jq = $(`
      <div class="panel panel-default examma-ray-code-submission-thumbnail">
        <div class="panel-heading">
          ${group.name}
          ${group.grading_result ? renderScoreBadge(this.pointsEarned(group.grading_result), this.question.points) : renderUngradedBadge(this.question.points)}
        </div>
        <div class="panel-body">
          <pre><code>${highlightCode(code, CODE_LANGUAGE)}</code></pre>
        </div>
      </div>
    `);
    jq.on("click", () => {
      this.openGroup(group)
    });
    this.thumbnailElems[group.name] = jq;
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

  public openGroup(group: CodeWritingGradingGroup) {
    asMutable(this).currentGroup = group;

    this.groupMemberThumbnailsElem.empty();
    group.submissions.forEach(sub => {
      this.groupMemberThumbnailsElem.append(this.createMemberThumbnail(sub));
    })

    let rep = group.submissions[group.representative_index];

    let code = this.applyHarness(rep);
    this.lobster.project.setFileContents(new SourceFile("file.cpp", code));

    $(".examma-ray-submissions-column").find(".panel-primary").removeClass("panel-primary");
    this.thumbnailElems[group.name].addClass("panel-primary");

    if (!group.grading_result) {
      group.grading_result = {
        wasBlankSubmission: rep.response === BLANK_SUBMISSION,
        itemResults: {},
        verified: false
      }
    }

    this.updatedGradingResult();
  }

  private applyHarness(rep: GradingSubmission<"code_editor", CodeWritingGradingResult>) {
    let submittedCode = rep.response === BLANK_SUBMISSION ? "" : rep.response;

    if (this.preprocess) {
      submittedCode = this.preprocess(submittedCode);
    }

    let code = this.testHarness.replace("{{submission}}", indentString(submittedCode, 4));
    return code;
  }

  private clearGroup() {
    this.groupMemberThumbnailsElem.empty();
    this.lobster.project.setFileContents(new SourceFile("file.cpp", "No submissions opened"));
  }

  private createMemberThumbnail(sub: CodeWritingSubmission) {
    let code = sub.response === BLANK_SUBMISSION ? "" : sub.response;
    let jq = $(`
      <div class="panel panel-default examma-ray-code-submission-thumbnail">
        <div class="panel-heading">
          ${sub.student.name}
        </div>
        <div class="panel-body">
          <pre><code>${highlightCode(code, CODE_LANGUAGE)}</code></pre>
        </div>
      </div>
    `);
    return jq;
  }

  public async autoGroup() {
    if (!this.assn) {
      return;
    }

    $("#examma-ray-grouping-progress-modal").modal("show");

    let equivalenceGroups : (CodeWritingGradingGroup & { repProgram?: Program })[] = [];

    let allSubs = this.assn!.groups.flatMap(g => g.submissions);
    for(let i = 0; i < allSubs.length; ++i) {
      let sub = allSubs[i];
      $(".examma-ray-grouping-progress .progress-bar").css("width", (100*i/allSubs.length) + "%");
      console.log(i);
      await this.autoGroupHelper(equivalenceGroups, sub);
    }

    // Remove program property
    equivalenceGroups.forEach(g => delete (<any>g).repProgram);

    let newAssn : CodeWritingGradingAssignment = {
      question_id: this.assn!.question_id,
      staff_uniqname: this.assn!.staff_uniqname,
      groups: equivalenceGroups
    };

    this.setGradingAssignment(newAssn);

    $("#examma-ray-grouping-progress-modal").modal("hide");
  }

  private autoGroupHelper(equivalenceGroups: (CodeWritingGradingGroup & { repProgram?: Program })[], sub: CodeWritingSubmission) {

    return new Promise<void>((resolve, reject) => {

      window.setTimeout(() => {
        let code = this.applyHarness(sub);

        try {
    
          let p = new SimpleProgram(code);
    
          let fn = getFunc(p, this.groupingFunctionName);
          if (!fn) {
            // Didn't parse or can't find function, make a new group
            equivalenceGroups.push({
              name: "group_" + equivalenceGroups.length,
              representative_index: 0,
              repProgram: p,
              submissions: [sub]
            });
            return;
          }
    
          let matchingGroup = equivalenceGroups.find(group => {
            let rep = group.repProgram;
            if (!rep) { return false; }
            let repFunc = getFunc(rep, this.groupingFunctionName);
            return repFunc && getFunc(p, this.groupingFunctionName)!.isSemanticallyEquivalent(repFunc, {});
          });
    
          if (matchingGroup) {
            matchingGroup.submissions.push(sub);
          }
          else {
            equivalenceGroups.push({
              name: "group_" + equivalenceGroups.length,
              representative_index: 0,
              repProgram: p,
              submissions: [sub]
            });
          }
        }
        catch(e) {
          // Lobster might randomly crash on an obscure case. Just add to
          // a new group with no representative program.
          equivalenceGroups.push({
            name: "group_" + equivalenceGroups.length,
            representative_index: 0,
            submissions: [sub]
          })
        }
        
        resolve();
      }, 0);
  });

    
  }

  public setRubricItemStatus(i: number, status: CodeWritingRubricItemStatus) {
    if (!this.currentGroup?.grading_result) {
      return;
    }
    let gr = this.currentGroup.grading_result;
    gr.itemResults[this.rubric[i].id] = {
      status: status
    };

    this.updatedGradingResult();
  }

  public toggleRubricItem(i: number) {
    if(!this.currentGroup?.grading_result) {
      return;
    }
    let currentStatus = this.currentGroup.grading_result.itemResults[this.rubric[i].id]?.status || "off";
    if (currentStatus === "off") {
      currentStatus = "on";
    }
    else if (currentStatus === "on") {
      currentStatus = "unknown";
    }
    else if (currentStatus === "unknown") {
      currentStatus = "off";
    }
    this.setRubricItemStatus(i, currentStatus);
  }

  

  private updateRubricItemButtons() {
    if (!this.currentGroup?.grading_result) {
      return;
    }

    let gr = this.currentGroup.grading_result;

    this.rubric.forEach((ri, i) => {
      this.updateRubricItemButton(i, gr.itemResults[ri.id]?.status || "off");
    })
  }

  private updateRubricItemButton(i: number, status: CodeWritingRubricItemStatus) {
    let elem = this.rubricButtonElems[i];
    elem.removeClass("list-group-item-success").removeClass("list-group-item-danger").removeClass("list-group-item-warning");
    elem.find(".examma-ray-unknown-rubric-item-icon").remove();
    if (status === "on") {
      if (this.rubric[i].points >= 0) {
        elem.addClass("list-group-item-success");
      }
      else {
        elem.addClass("list-group-item-danger");
      }
    }
    else if (status === "unknown") {
      elem.addClass("list-group-item-warning");
      elem.append($(`<span class="examma-ray-unknown-rubric-item-icon"><i class="bi bi-question-diamond-fill"></i><span>`));
    }
  }

  private updatedGradingResult() {
    if (!this.currentGroup?.grading_result) {
      return;
    }

    let thumbElem = this.thumbnailElems[this.currentGroup.name];
    thumbElem.find(".badge").replaceWith(renderScoreBadge(this.pointsEarned(this.currentGroup.grading_result), this.question.points))
    
    this.updateRubricItemButtons();
  }

  private pointsEarned(gr?: CodeWritingGradingResult) {
    if (!gr) {
      return 0;
    }
    return Math.max(0, Math.min(this.question.points,
      this.rubric.reduce((p, ri) => p + (gr.itemResults[ri.id]?.status === "on" ? ri.points : 0), 0)
    ));
  }

  public autograde() {
    if (!this.currentGroup) {
      return;
    }

    if (this.autograder) {
      this.currentGroup.grading_result = this.autograder(this.lobster.project.exercise);
    }

    this.updatedGradingResult();
  }

};

let GRADING_APP: CodeWritingManualGraderApp;
export function configureGradingApp(spec: CodeWritingManualGraderAppSpecification) {
  GRADING_APP = new CodeWritingManualGraderApp(spec);
}



function getFunc(program: Program, name: string) {
  return program.linkedFunctionDefinitions[name]?.definitions[0];
}