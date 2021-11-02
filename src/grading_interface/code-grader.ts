import { GradingGroup, GradingAssignmentSpecification, GradingSubmission } from "./common";
import { CodeWritingGradingResult, CodeWritingRubricItem, CodeWritingRubricItemStatus } from "../graders/CodeWritingGrader"
import { Blob } from 'blob-polyfill';
import { BLANK_SUBMISSION, ResponseKind } from "../response/common";
import indentString from "indent-string";
import { Program, SimpleProgram, SourceFile } from "lobster-vis/dist/js/core/Program"
import { SimpleExerciseLobsterOutlet } from "lobster-vis/dist/js/view/SimpleExerciseLobsterOutlet"
import { createRunestoneExerciseOutlet } from "lobster-vis/dist/js/view/embeddedExerciseOutlet"

import { applySkin, highlightCode, mk2html } from "../core/render";
import "highlight.js/styles/github.css";

import "./code-grader.css";
import { COMPLETION_ALL_CHECKPOINTS, Exercise, Project } from "lobster-vis/dist/js/core/Project";
import "lobster-vis/dist/css/buttons.css"
import "lobster-vis/dist/css/main.css"
import "lobster-vis/dist/css/code.css"
import "lobster-vis/dist/css/exercises.css"
import "lobster-vis/dist/css/frontend.css"
import { Checkpoint } from "lobster-vis/dist/js/analysis/checkpoints";
import "lobster-vis/dist/js/lib/standard";
import { renderScoreBadge, renderShortPointsWorthBadge, renderUngradedBadge } from "../core/ui_components";
import { asMutable, assert } from "../core/util";
import { QuestionSpecification } from "../core/exam_specification";
import deepEqual from "deep-equal";
import { ExamComponentSkin } from "../core";
import { v4 as uuidv4 } from "uuid";

// A significant amount of this code for interacting with the file
// system is based on the File System Access API tutorial and
// documentation at https://web.dev/file-system-access/

// Because this grader is based on Lobster, it only works for C++ code
// Perhaps in the future it will be generalized to other languages and
// have the option to just use a regular codemirror instance rather than
// lobster.
const CODE_LANGUAGE = "cpp";

export type CodeWritingGradingAssignment = GradingAssignmentSpecification<ResponseKind, CodeWritingGradingResult>;
export type CodeWritingGradingGroup = GradingGroup<ResponseKind, CodeWritingGradingResult>;
export type CodeWritingSubmission = GradingSubmission<ResponseKind>;


type SubmissionsFilterCriterion = "all" | "graded" | "ungraded";
type SubmissionsSortCriterion = "name" | "size" | "score";
type SubmissionsSortOrdering = "asc" | "dsc";

$(() => {
  $("body").html(`
    <div class="examma-ray-grading-sidebar">
      <div class="examma-ray-grading-controls">
        <div class="examma-ray-grading-title" style="text-align: center;"></div>
        <div class="examma-ray-grading-assignment-name" style="text-align: center;">[No Grading Assignment Loaded]</div>
        <div style="text-align: center; margin-bottom: 0.5em;">
          <button id="load-grading-assignment-button" class="btn btn-primary"><i class="bi bi-folder2-open"></i> Open</button>
          <button type="button" class="btn btn-primary examma-ray-auto-group-button"><i class="bi bi-lightning"></i> Auto-Group</button>
        </div>
        <div style="padding-left: 1em; margin-bottom: 0.5em;">
          <b>Filter</b>
          <div class="btn-group" role="group">
            <button data-filter-criterion="all" type="button" class="examma-ray-submissions-filter-button btn btn-primary">All</button>
            <button data-filter-criterion="ungraded" type="button" class="examma-ray-submissions-filter-button btn btn-default">Ungraded</button>
            <button data-filter-criterion="graded" type="button" class="examma-ray-submissions-filter-button btn btn-default">Graded</button>
          </div>
        </div>
        <div style="padding-left: 1em; margin-bottom: 0.5em;">
          <b>Sort</b>
          <div class="btn-group" role="group">
            <button data-sort-criterion="name" type="button" class="examma-ray-submissions-sort-button btn btn-primary">Name</button>
            <button data-sort-criterion="size" type="button" class="examma-ray-submissions-sort-button btn btn-default">Size</button>
            <button data-sort-criterion="score" type="button" class="examma-ray-submissions-sort-button btn btn-default">Score</button>
          </div>
        </div>
        <div style="padding-left: 1em; margin-bottom: 0.5em;">
          <b>Sort Ordering</b>
          <div class="btn-group" role="group">
            <button data-sort-ordering="asc" type="button" class="examma-ray-submissions-sort-ordering-button btn btn-primary">Asc</button>
            <button data-sort-ordering="dsc" type="button" class="examma-ray-submissions-sort-ordering-button btn btn-default">Dsc</button>
          </div>
        </div>
      </div>
      <div class="examma-ray-submissions-column" style="border-top: solid 1px #dedede">
      
      </div>
    </div>
    <div class="examma-ray-grading-main-panel">
      <div style="margin-bottom: 3px;">
        <h3 style="margin-top: 0;">You are grading: <code class="examma-ray-grading-group-name">[No group selected]</code></h3>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#groups-modal"><span class="badge examma-ray-grading-group-num-members">N/A</span> Review Group Members</button>
        <button class="btn btn-primary" id="examma-ray-grading-autograde-button">Autograde!</button>
      </div>
      <div id="lobster-exercise">

      </div>
    </div>
    <div class="examma-ray-grading-right-panel">
      <div style="position: sticky; top: 0; text-align: center; background: white; z-index: 10; padding-top: 1em;">
        <button class="btn btn-default examma-ray-grading-finished-button">Mark as Finished</button>
        <hr />
      </div>
      <div class="examma-ray-grading-rubric-buttons">
      </div>
    </div>
    
    <div class="modal fade" id="groups-modal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" style="width: 95vw" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Group Members</h4>
          </div>
          <div class="modal-body examma-ray-group-member-thumbnails">
          </div>
        </div>
      </div>
    </div>
    
    <div class="modal fade" id="examma-ray-grouping-progress-modal" tabindex="-1" role="dialog" data-backdrop="static">
      <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">Auto-Grouping...</h4>
          </div>
          <div class="modal-body examma-ray-grouping-progress">
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
      GRADING_APP.setSubmissionsSortCriterion($(this).data("sort-criterion"))
  });

  $(".examma-ray-submissions-sort-ordering-button").on("click", function() {
      $(".examma-ray-submissions-sort-ordering-button").removeClass("btn-primary").addClass("btn-default");
      $(this).removeClass("btn-default").addClass("btn-primary");
      GRADING_APP.setSubmissionsSortOrdering($(this).data("sort-ordering"));
  });

  $(".examma-ray-auto-group-button").on("click", async function() {
      GRADING_APP.autoGroup();
  });

  $(".examma-ray-grading-finished-button").on("click", async function() {
      GRADING_APP.toggleGradingFinished();
  });

});

function isFullyGraded(sub: CodeWritingGradingGroup) {
  return !!sub.grading_result?.verified;
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
  extract_code?: (raw_submission: string, skin: ExamComponentSkin) => string,
  skin_override?: ExamComponentSkin,
  preprocess?: (submission: string) => string,
  checkpoints: Checkpoint[],
  autograder: (ex: Exercise) => CodeWritingGradingResult,
  groupingFunctionName: string
};

export const DEFAULT_EXTRACT_CODE = (raw_submission: string) => {
  assert(typeof raw_submission === "string");
  return raw_submission;
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

  private extract_code: (raw_submission: string, skin: ExamComponentSkin) => string;
  private skin_override?: ExamComponentSkin;
  private preprocess?: (submission: string) => string;
  private testHarness: string;
  private groupingFunctionName: string;

  private groupMemberThumbnailsElem: JQuery;

  private thumbnailElems: {[index: string]: JQuery} = {};
  private rubricButtonElems: JQuery[] = [];
  
  private submissionsFilterCriterion : SubmissionsFilterCriterion = "all";
  private submissionsSortCriteria : SubmissionsSortCriterion = "name";
  private submissionsSortOrdering : SubmissionsSortOrdering = "asc";
  // private submissions

  

  private SUBMISSION_SORTS : {
    [k in SubmissionsSortCriterion]: (a: CodeWritingGradingGroup, b: CodeWritingGradingGroup) => number
  } = {
    "name": (a: CodeWritingGradingGroup, b: CodeWritingGradingGroup) => a.name.localeCompare(b.name, undefined, {numeric: true}),
    "size": (a: CodeWritingGradingGroup, b: CodeWritingGradingGroup) => a.submissions.length - b.submissions.length,
    "score": (a: CodeWritingGradingGroup, b: CodeWritingGradingGroup) => this.pointsEarned(a.grading_result) - this.pointsEarned(b.grading_result),
  }

  public constructor(spec: CodeWritingManualGraderAppSpecification) {
    this.question = spec.question;
    this.rubric = spec.rubric;
    this.testHarness = spec.testHarness;
    this.autograder = spec.autograder;
    this.extract_code = spec.extract_code ?? DEFAULT_EXTRACT_CODE;
    this.skin_override = spec.skin_override;
    this.preprocess = spec.preprocess;
    this.groupingFunctionName = spec.groupingFunctionName;

    this.groupMemberThumbnailsElem = $(".examma-ray-group-member-thumbnails");

    this.lobster = this.createLobster(spec);

    this.createControls();

    this.createRubricBar();

    setInterval(() => this.saveGradingAssignment(), 10000);
  }

  private createControls() {
    $(".examma-ray-grading-title").html(this.question.question_id);
  }

  private createRubricBar(sub?: GradingSubmission) {
    let buttons = $(".examma-ray-grading-rubric-buttons");
    buttons.addClass("list-group");
    this.rubricButtonElems.length = 0;


    buttons.empty();
    
    let skin = this.skin_override ?? (sub && createRecordedSkin(sub));
    this.rubric.forEach((ri, i) => {
      let skinnedTitle = sub ? applySkin(ri.title, skin) : ri.title;
      let skinnedDesc = sub ? applySkin(ri.description, skin) : ri.description;
      let button = $(
        `<button type="button" class="list-group-item">
          ${renderShortPointsWorthBadge(ri.points)}
          <div class="examma-ray-rubric-item-title"><b>${mk2html(skinnedTitle)}</b></div>
          ${mk2html(skinnedDesc)}
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
    
    delete asMutable(this).assn;
    this.clearGroupThumbnails();
    this.closeGroup();

  }

  public async loadGradingAssignmentFile() {

    let [fileHandle] = await window.showOpenFilePicker();
    this.fileHandle = fileHandle;
    const file = await fileHandle.getFile();
    const contents = await file.text();
    let assn = <CodeWritingGradingAssignment>JSON.parse(contents);

    if (assn.question_id !== this.question.question_id) {
      alert("The question ID for that grading assignment does not match the question ID for this rubric.");
      return;
    }

    if (assn.groups[0].submissions)
    
    this.setGradingAssignment(assn);
    $(".examma-ray-grading-assignment-name").html(file.name);

    await this.saveGradingAssignment(); // immediate save prompts for permissions to save in the future
  }

  private setGradingAssignment(assn: CodeWritingGradingAssignment) {
    this.closeGradingAssignment();

    asMutable(this).assn = assn;

    this.createGroupThumbnails();
  }

  private clearGroupThumbnails() {
    $(".examma-ray-submissions-column").empty();
    this.thumbnailElems = {};
  }

  private createGroupThumbnails() {
    if (!this.assn) { return; }
    let groups = this.assn.groups
      .filter(SUBMISSION_FILTERS[this.submissionsFilterCriterion])
      .sort(this.SUBMISSION_SORTS[this.submissionsSortCriteria]);

    if (this.submissionsSortOrdering === "dsc") {
      groups = groups.reverse();
    }

    groups.forEach(group => $(".examma-ray-submissions-column").append(this.createGroupThumbnail(group)));
  }

  private refreshGroups() {
    this.clearGroupThumbnails();
    this.createGroupThumbnails();
    if (this.currentGroup) {
      $(".examma-ray-grading-group-name").html(this.currentGroup.name);
      $(".examma-ray-grading-group-num-members").html(""+this.currentGroup.submissions.length);
    }
  }

  private createGroupThumbnail(group: CodeWritingGradingGroup) {
    assert(group.submissions.length > 0);
    let firstSub = group.submissions[group.representative_index];
    let response = firstSub.response;
    let originalSkin = createRecordedSkin(firstSub);
    let skin = this.skin_override ?? originalSkin;
    let jq = $(`
      <div class="panel panel-default examma-ray-grading-group-thumbnail">
        <div class="panel-heading">
          <span class="badge">${group.submissions.length}</span> ${group.name} 
          ${group.grading_result ? renderScoreBadge(this.pointsEarned(group.grading_result), this.question.points, group.grading_result.verified ? VERIFIED_ICON : "") : renderUngradedBadge(this.question.points)}
        </div>
        <div class="panel-body">
          <pre><code>${highlightCode(this.extract_code(response, originalSkin), CODE_LANGUAGE)}</code></pre>
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
    this.clearGroupThumbnails();
    this.createGroupThumbnails();
  }

  public setSubmissionsSortCriterion(criterion: SubmissionsSortCriterion) {
    this.submissionsSortCriteria = criterion;
    this.clearGroupThumbnails();
    this.createGroupThumbnails();
  }

  public setSubmissionsSortOrdering(ordering: SubmissionsSortOrdering) {
    this.submissionsSortOrdering = ordering;
    this.clearGroupThumbnails();
    this.createGroupThumbnails();
  }

  public async saveGradingAssignment() {
    if (!this.assn || !this.fileHandle) {
      return;
    }

    // Check if file is still there
    try {
      await this.fileHandle.getFile();
    }
    catch (e) {
      delete this.fileHandle;
      alert("Oops! The grading assignment file appears to have disappeared! Please reload the page.");
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
    $(".examma-ray-grading-group-name").html(group.name);
    $(".examma-ray-grading-group-num-members").html(""+group.submissions.length);

    this.groupMemberThumbnailsElem.empty();
    group.submissions.forEach(sub => {
      this.groupMemberThumbnailsElem.append(this.createMemberThumbnail(sub));
    })

    let rep = group.submissions[group.representative_index];

    // Update rubric buttons
    this.createRubricBar(rep);

    let code = this.applyHarness(rep);
    this.lobster.project.setFileContents(new SourceFile("file.cpp", code));

    $(".examma-ray-submissions-column").find(".panel-primary").removeClass("panel-primary");
    this.thumbnailElems[group.name].addClass("panel-primary");

    this.updatedGradingResult();
  }

  private applyHarness(rep: GradingSubmission<ResponseKind>) {
    let response = rep.response;
    let originalSkin = createRecordedSkin(rep);
    let skin = this.skin_override ?? originalSkin;
    let submittedCode = this.extract_code(response, originalSkin);

    if (this.preprocess) {
      submittedCode = this.preprocess(submittedCode);
    }

    let code = this.testHarness.replace("{{submission}}", indentString(submittedCode, 4));
    code = applySkin(code, skin);
    return code;
  }

  private closeGroup() {
    delete asMutable(this).currentGroup;
    $(".examma-ray-grading-group-name").html("[No group selected]");
    this.groupMemberThumbnailsElem.empty();
    this.lobster.project.setFileContents(new SourceFile("file.cpp", "No submissions opened"));
  }

  private createMemberThumbnail(sub: CodeWritingSubmission) {
    let response = sub.response;
    let originalSkin = createRecordedSkin(sub);
    let skin = this.skin_override ?? originalSkin;
    let jq = $(`
      <div class="panel panel-default examma-ray-group-member-thumbnail">
        <div class="panel-heading">
          <button type="button" class="btn btn-sm btn-danger examma-ray-group-member-remove-button" aria-label="Remove"><span aria-hidden="true">Remove</span></button>
          ${sub.student.name}
        </div>
        <div class="panel-body">
          <pre><code>${highlightCode(this.extract_code(response, originalSkin), CODE_LANGUAGE)}</code></pre>
        </div>
      </div>
    `);
    let closeButton = jq.find(".examma-ray-group-member-remove-button");
    closeButton.on("click", () => {
      if (this.currentGroup && this.currentGroup.submissions.length > 1) {
        this.removeFromCurrentGroup(sub);
        jq.fadeOut(() => jq.remove());
      }
    })
    return jq;
  }

  public async autoGroup() {
    if (!this.assn) {
      return;
    }

    $("#examma-ray-grouping-progress-modal").modal("show");

    let equivalenceGroups : (CodeWritingGradingGroup & { repProgram?: Program })[] = [];

    let allSubs = this.assn!.groups.flatMap(g => g.submissions.map(sub => ({
      submission: sub,
      grading_result: copyGradingResult(g.grading_result)
    })));
    for(let i = 0; i < allSubs.length; ++i) {
      let sub = allSubs[i];
      let percent = 100*i/allSubs.length;
      if (Math.floor(percent/5) % 2 === 0) {
        $(".examma-ray-grouping-progress .progress-bar").html("♪┏(・o･)┛♪┗( ･o･)┓♪")
      }
      else {
        $(".examma-ray-grouping-progress .progress-bar").html("♪┗( ･o･)┓♪┏(・o･)┛♪")
      }
      $(".examma-ray-grouping-progress .progress-bar").css("width", percent + "%");
      console.log(i);
      await this.autoGroupHelper(equivalenceGroups, sub);
    }

    // Remove program property
    equivalenceGroups.forEach(g => delete (<any>g).repProgram);

    let newAssn : CodeWritingGradingAssignment = {
      name: this.assn!.name,
      exam_id: this.assn!.exam_id,
      question_id: this.assn!.question_id,
      groups: equivalenceGroups
    };

    this.setGradingAssignment(newAssn);

    $("#examma-ray-grouping-progress-modal").modal("hide");
  }

  private getGroupingFunctionName(sub: CodeWritingSubmission) {
    let skin = this.skin_override ?? createRecordedSkin(sub);
    return applySkin(this.groupingFunctionName, skin);
  }

  private autoGroupHelper(
    equivalenceGroups: (CodeWritingGradingGroup & { repProgram?: Program })[],
    sub_gr: {
      submission: CodeWritingSubmission,
      grading_result: CodeWritingGradingResult | undefined
    }) {

    let sub = sub_gr.submission;
    let gr = sub_gr.grading_result;

    return new Promise<void>((resolve, reject) => {

      window.setTimeout(() => {
        let code = this.applyHarness(sub);

        try {
    
          let p = new SimpleProgram(code);
    
          let fn = getFunc(p, this.getGroupingFunctionName(sub));
          if (!fn) {
            // Didn't parse or can't find function, make a new group
            equivalenceGroups.push({
              name: "group_" + equivalenceGroups.length,
              representative_index: 0,
              repProgram: p,
              submissions: [sub],
              grading_result: copyGradingResult(gr)
            });
            resolve();
            return;
          }
    
          let matchingGroup = equivalenceGroups.find(group => {

            if (!areEquivalentGradingResults(group.grading_result, gr)) {
              return false;
            }

            // Only group blank submissions with other blank submissions
            if ( (group.submissions[group.representative_index].response === "" )
              !== (sub.response === "")) {
              return false;
            }
            
            let rep = group.repProgram;
            if (!rep) { return false; }
            let repFunc = getFunc(rep, this.getGroupingFunctionName(group.submissions[group.representative_index]));
            return repFunc && getFunc(p, this.getGroupingFunctionName(sub))!.isSemanticallyEquivalent(repFunc, {});
          });
    
          if (matchingGroup) {
            matchingGroup.submissions.push(sub);
          }
          else {
            equivalenceGroups.push({
              name: "group_" + equivalenceGroups.length,
              representative_index: 0,
              repProgram: p,
              submissions: [sub],
              grading_result: copyGradingResult(gr)
            });
          }
        }
        catch(e) {
          // Lobster might randomly crash on an obscure case. Just add to
          // a new group with no representative program.
          equivalenceGroups.push({
            name: "group_" + equivalenceGroups.length,
            representative_index: 0,
            submissions: [sub],
            grading_result: copyGradingResult(gr)
          })
        }
        
        resolve();
      }, 0);
   });
  }

  private removeFromCurrentGroup(subToRemove: CodeWritingSubmission) {
    if (!this.assn || !this.currentGroup || this.currentGroup.submissions.length <= 1) {
      return;
    }

    let i = this.currentGroup.submissions.findIndex(sub => sub.question_uuid === subToRemove.question_uuid);
    i !== -1 && this.currentGroup.submissions.splice(i, 1);

    this.assn.groups.push({
      name: "group_" + this.assn.groups.length,
      representative_index: 0,
      submissions: [subToRemove],
      grading_result: copyGradingResult(this.currentGroup.grading_result)
    });

    this.refreshGroups();
  }

  public setRubricItemStatus(i: number, status: CodeWritingRubricItemStatus) {
    if (!this.currentGroup?.grading_result) {
      return;
    }
    let gr = this.currentGroup.grading_result;

    if (status === "off") {
      delete gr.itemResults[this.rubric[i].id];
    }
    else {
      gr.itemResults[this.rubric[i].id] = {
        status: status
      };
    }

    this.updatedGradingResult();
  }

  public toggleRubricItem(i: number) {
    if(!this.currentGroup) {
      return;
    }

    this.currentGroup.grading_result ??= createEmptyGradingResult(this.currentGroup);

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

  private updateRubricItemButtons(gr: CodeWritingGradingResult | undefined) {

    this.rubric.forEach((ri, i) => {
      this.updateRubricItemButton(i, gr?.itemResults[ri.id]?.status || "off");
    });

    this.updateGradingFinishedButton(gr);
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

  private updateGradingFinishedButton(gr: CodeWritingGradingResult | undefined) {
    let elem = $(".examma-ray-grading-finished-button");
    elem.removeClass("btn-default").removeClass("btn-success");
    if (gr?.verified) {
      elem.html(`<i class="bi bi-check2-circle"></i> Finished`);
      elem.addClass("btn-success");
    }
    else {
      elem.html("Mark as Finished");
      elem.addClass("btn-default");
    }
  }

  public toggleGradingFinished() {
    if(!this.currentGroup) {
      return;
    }

    this.currentGroup.grading_result ??= createEmptyGradingResult(this.currentGroup);

    this.currentGroup.grading_result.verified = !this.currentGroup.grading_result.verified;

    this.updatedGradingResult();
  }

  private updatedGradingResult() {
    if (!this.currentGroup) {
      return;
    }

    let thumbElem = this.thumbnailElems[this.currentGroup.name];
    thumbElem.find(".examma-ray-score-badge").replaceWith(
      this.currentGroup.grading_result
        ? renderScoreBadge(this.pointsEarned(this.currentGroup.grading_result), this.question.points, this.currentGroup.grading_result.verified ? VERIFIED_ICON : "")
        : renderUngradedBadge(this.question.points)
    );
    
    this.updateRubricItemButtons(this.currentGroup.grading_result);
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



function getFunc(program: Program, name: string | string[]) {
  if (typeof name === "string") {
    name = [name];
  }
  for(let i = 0; i < name.length; ++i) {
    if (name[0].indexOf("::[[constructor]]") !== -1) {
      let className = name[0].slice(0, name[0].indexOf("::[[constructor]]"));
      let ctor = program.linkedClassDefinitions[className]?.constructors[0].definition;
      if (ctor) {
        return ctor;
      }
      continue;
    }

    let def = program.linkedFunctionDefinitions[name[i]]?.definitions[0];
    if (def) {
      return def;
    }
  }
  return undefined;
}

function areEquivalentGradingResults(gr1: CodeWritingGradingResult | undefined, gr2: CodeWritingGradingResult | undefined) {
  return deepEqual(gr1, gr2);
}

function createEmptyGradingResult(group: CodeWritingGradingGroup) : CodeWritingGradingResult {
  return {
    wasBlankSubmission: group.submissions[group.representative_index].response === "",
    itemResults: {},
    verified: false
  }
}

function copyGradingResult(gr: CodeWritingGradingResult | undefined) {
  if (gr === undefined) {
    return undefined;
  }

  return $.extend(true, {}, gr);
}

function createRecordedSkin(sub: CodeWritingSubmission) {
  // use a v4 uuid as the skin ID to avoid caching issues
  return {skin_id: `[recorded-${uuidv4()}]`, replacements: sub.skin_replacements};
}

const VERIFIED_ICON = `<i class="bi bi-check2-circle" style="vertical-align: text-top;"></i> `;