import { Blob } from "blob-polyfill";
import storageAvailable from "storage-available";
import { areExamSubmissionsEquivalent, createManifestFilenameBase, ExamSubmission, fillManifest, isBlankSubmission, isTransparentExamManifest, OpaqueExamSubmission, OpaqueQuestionAnswer, OpaqueSectionAnswers, parseExamManifest, parseExamSubmission, QuestionAnswer } from "../src/core/submissions";
import { BLANK_SUBMISSION, extract_response, fill_response, parse_submission, stringify_response } from "../src/response/responses";

import { FILE_CHECK, FILE_MINUS } from '../src/core/icons';

import axios from "axios";
import { AssignedExam } from "../src/core/assigned_exams";
import { Exam } from "../src/core/exam_components";
import { parseExamSpecification } from "../src/core/exam_specification";
import { assert } from "../src/core/util";
import { activateExamComponents, activateExamContent, setupCodeEditors } from "./common";
import { ExamCompletion } from "./plugins/ExamCompletion";
import { Participant } from "./plugins/Participant";
import { setupQuestionStars } from "./question_stars";
import { on } from "events";


function extractQuestionAnswers(question_elem: JQuery) : OpaqueQuestionAnswer {
  let response = question_elem.find(".examma-ray-question-response");
  return {
    uuid: question_elem.data("question-uuid"),
    display_index: question_elem.data("question-display-index"),
    kind: response.data("response-kind"),
    response: stringify_response(extract_response(response.data("response-kind"), response))
  }
}

function extractSectionAnswers(section_elem: JQuery) : OpaqueSectionAnswers {
  return {
    uuid: section_elem.data("section-uuid"),
    display_index: section_elem.data("section-display-index"),
    questions: section_elem.find(".examma-ray-question").map((i,elem) => extractQuestionAnswers($(elem))).get()
  }
}

let TIME_STARTED = Date.now();

function updateTimeElapsed() {
  let seconds = Math.floor((Date.now() - TIME_STARTED) / 1000);
  let hours = Math.floor(seconds / 3600);
  seconds = seconds - hours * 3600;
  let minutes = Math.floor(seconds / 60);
  seconds = seconds - minutes * 60;
  $("#examma-ray-time-elapsed").html(
    `${hours}h ${minutes}m ${seconds}s`
  );
}

const saverID = Date.now();
let saveCount = 0;

function extractExamAnswers() : OpaqueExamSubmission {
  let examElem = $("#examma-ray-exam");
  return {
    exam_id: examElem.data("exam-id"),
    uuid: examElem.data("exam-uuid"),
    student: {
      uniqname: examElem.data("uniqname"),
      name: examElem.data("name")
    },
    time_started: TIME_STARTED,
    timestamp: Date.now(),
    saverId: saverID,
    sections: $(".examma-ray-section").map((i, elem) => extractSectionAnswers($(elem))).get()
  }
}

function stringifyExamAnswers(answers: OpaqueExamSubmission) : string {
  return JSON.stringify(answers, null, 2);
}

function fillQuestionAnswer(qa: QuestionAnswer) {
  let questionElem = $(`#question-${qa.uuid}`);
  let responseElem = questionElem.find(".examma-ray-question-response");
  if (responseElem.length > 0 && qa.kind === responseElem.data("response-kind")) {
    let sub = parse_submission(qa.kind, qa.response);
    
    // Discard malformed submissions and treat them as blank
    if (sub.validity === "malformed" || sub.validity === "blank") {
      fill_response(responseElem, qa.kind, BLANK_SUBMISSION());
      return;
    }

    // HACK: In order to do client-side validation, we need some refactoring
    // to make at least the specific question/response data for this question available
    // on the client side. We can't call validate_submission() without that.
    // For now, we irresponsibly assume all well-formed, non-blank submissions are viable.
    // sub = validate_submission(response, sub);
    fill_response(
      responseElem,
      qa.kind,
      { validity: "viable", encoding: sub.encoding }
    );
  }
}

function fillExamAnswers(answers: ExamSubmission) {
  answers.sections.map(s => s.questions.map(q => fillQuestionAnswer(q)))
  if (answers.time_started) {
    TIME_STARTED = answers.time_started;
  }
  // Consider work to be unsaved after loading - will resolve after autosave
  onUnsavedChanges();
}

function updateExamSaverModal() {
  $("#exam-saver-download-status").html("Preparing download file...");
  $("#exam-saver-download-link")
    .removeAttr("href")
    .removeAttr("download")
    .addClass("disabled");

  // Timeout so that the "Preparing..." message actually gets shown before we do the work
  setTimeout(() => {
    let answers = extractExamAnswers();
    let blob = new Blob([stringifyExamAnswers(answers)], {type: "application/json"});
    let url  = URL.createObjectURL(blob);

    $("#exam-saver-download-link")
      .attr("download", `${answers.student.uniqname}-${answers.exam_id}-answers.json`)
      .attr("href", url)
      .removeClass("disabled");

    $("#exam-saver-download-status").html("Click here to download your answers.");
  });
}

function localStorageExamKey(examId: string, uniqname: string, uuid: string) {
  return examId + "-" + uniqname + "-" + uuid;
}

function autosave(answers: ExamSubmission) {
  if(LAST_SAVED_ANSWERS && areExamSubmissionsEquivalent(answers, LAST_SAVED_ANSWERS)) {
    onNothingToSave();
    return;
  }
  const stringified_answers = stringifyExamAnswers(answers);

  if (storageAvailable("localStorage")) {
    console.log("autosaving...");

    let prevAnswersLS = localStorage.getItem(localStorageExamKey(answers.exam_id, answers.student.uniqname, answers.uuid));
    if (prevAnswersLS) {

      let prevAnswers = parseExamSubmission(prevAnswersLS);

      // We want to know if we're competing with another tab/window.
      // We can detect that by checking if the previous save was made with a different saver ID,
      // and we have already saved once (otherwise we would detect starting up a tab after a previous
      // one was closed rather than a true interleaving of saves)
      if (saveCount > 0 && prevAnswers.saverId !== answers.saverId) {
        $("#multiple-tabs-modal").modal("show");
        // Note that we don't return here and still continue on to save below.
        // This is ok, because we presume all multiple tabs/windows open have
        // the same data intially since the new ones load from local storage,
        // and we presume that the user will get the warning before they do much
        // damage. It's also necessary that we keep saving, because that is how
        // the other tabs detect our saves interleaved with theirs and show the modal.
      }
    }

    // Only save if there is something to save
    if (!isBlankSubmission(answers)) {
      localStorage.setItem(localStorageExamKey(answers.exam_id, answers.student.uniqname, answers.uuid), stringified_answers);
      ++saveCount;

      attempt_submit(answers, stringified_answers);
      onSaved(answers);
    }

    console.log("autosave complete!");
  }
}

async function attempt_submit(answers: OpaqueExamSubmission, stringified_answers: string) {
  const exam_uuid = $("#examma-ray-exam").data("exam-uuid");

  try {
    // check to see if we're on the exam website by looking for cookie with the name "bearer"
    const bearer_token = document.cookie.split('; ').find(row => row.startsWith('bearer='))?.split('=')[1];
    if (bearer_token && bearer_token !== "") {
      // If so, we can also autosave to the server
      await axios({
        url: `/student_api/exams/${exam_uuid}/live_submission`,
        method: "PUT",
        data: {submission: stringified_answers},
        headers: {
          'Authorization': 'bearer ' + bearer_token
        }
      });
      console.log("autosave to server complete!");

      // If successful, consider work to be saved
      onSaved(answers);
    }
  }
  catch (e) {
    // ignore errors for now
    // console.log("autosave to server failed!");
    // console.log(e);
  }
}



const UNSAVED_CHANGES_HTML = `${FILE_MINUS} <span style="vertical-align: middle">Answers</span>`;
const SAVED_HTML = `${FILE_CHECK} <span style="vertical-align: middle">Answers</span>`;

// Here's the model for tracking whether all work
// is saved or not. The exam starts in state A via onNothingToSave().
//
// Start
// - Begin exam -> State A via onNothingToSave()
//
// State A: Nothing to save
// - Interaction with response elements -> State B via onUnsavedChanges()
// - Load new work from answers file -> State B via onUnsavedChanges()
// - Load new work from autosave -> State B via onUnsavedChanges()
// 
// State B: Potentially unsaved changes
// - Attempt autosave, but no need since extracted answers match last save -> State A via onNothingToSave()
// 
// Critically, the only thing that happens when an autosave occurs and calls onSaved()
// is to update the LAST_SAVED_ANSWERS variable. This means that if there are
// concurrent changes while the autosave is happening, we will remain in State B
// until we check again and see that our current answers match the last saved answers.
// 

let LAST_SAVED_ANSWERS : OpaqueExamSubmission | undefined = undefined;

function onUnsavedChanges() {
  $(".examma-ray-exam-answers-file-button")
    .removeClass("btn-primary")
    .removeClass("btn-success")
    .addClass("btn-warning")
    .html(UNSAVED_CHANGES_HTML);
}

function onNothingToSave() {
  $(".examma-ray-exam-answers-file-button")
    .removeClass("btn-primary")
    .removeClass("btn-warning")
    .addClass("btn-success")
    .html(SAVED_HTML);
}

function onSaved(answers: OpaqueExamSubmission | undefined) {
  LAST_SAVED_ANSWERS = answers;
}

function setupSaverModal() {

  let fileInput = $("#exam-saver-file-input");
  let loadButton = $("#exam-saver-load-button");

  // Enable/disable the "load answers" button based on whether a file is selected
  fileInput.on("change", function() {
    let files = (<HTMLInputElement>this).files;
    if (files && files.length > 0) {
      loadButton.prop("disabled", false).removeClass("disabled");
    }
    else {
      loadButton.prop("disabled", true).addClass("disabled");
    }
  });

  // Handle clicks on the "load answers" button
  loadButton.on("click", async () => {
    let files = (<HTMLInputElement>fileInput[0]).files;

    // only do something if there was a file selected
    // note - there is logic elsewhere to disable the button if there
    // is no file selected, so this is just here for completeness
    if (files && files.length > 0) {
      try {
        let answers = parseExamSubmission(await files[0].text());
        if (answers.uuid !== $("#examma-ray-exam").data("exam-uuid")) {
          alert("Error - That answers file appears to be for a different exam.");
        }
        else if (answers.student.uniqname !== $("#examma-ray-exam").data("uniqname")) {
          alert("Error - That answers file appears to be for a different student.");
        }
        else {
          if (!isBlankSubmission(answers)) {
            fillExamAnswers(answers);
            $("#exam-saver").modal("hide");
          }
          else {
            alert("Error - That answers file appears to be blank.")
          }
        }
      }
      catch(err) {
        alert("Sorry, an error occurred while processing that file. Is it a properly formatted answers file?");
        // TODO add a more rigorous check if the file is not properly formatted than just checking for exceptions
      }
    }
    fileInput.val("");
    loadButton.prop("disabled", true).addClass("disabled");
  });

  // When the exam saver modal is shown, generate the data a potential
  // download of all current answers
  $('#exam-saver').on('shown.bs.modal', function () {
    updateExamSaverModal();
  });

  // A click on the download link indicates all work has been saved
  $("#exam-saver-download-link").on("click", function(this: HTMLElement) {

    // sanity check that they actually downloaded something
    if ($(this).attr("href")) {
      // We do not call anything related to unsaved changes here
      // because downloading answers is considered orthogonal
      $("#exam-saver").modal("hide");
    }
  });
}

function setupChangeListeners(warn_on_unload: boolean) {
  // https://stackoverflow.com/questions/7317273/warn-user-before-leaving-web-page-with-unsaved-changes
  if (warn_on_unload) {
    // NOTE: this doesn't work on some browsers unless the event listener is added
    // as the onbeforeunload property
    window.addEventListener("beforeunload", function (e) {
      // if there are no unsaved changes, we don't need to do warn them
      const answers = extractExamAnswers();
      if (LAST_SAVED_ANSWERS && areExamSubmissionsEquivalent(extractExamAnswers(), LAST_SAVED_ANSWERS)) {
          return undefined;
      }

      // Note many browsers will ignore this message and just show a
      // default one for security purposes. That's ok.
      let msg = "You've made changes to you answers since the last time you downloaded an answers file. Are you sure you want to leave the page?";

      (e || window.event).returnValue = msg; //Gecko + IE
      return msg; //Gecko + Webkit, Safari, Chrome etc.
    });
  }

  // Any change to an input element within a question response
  // triggers unsaved changes
  // https://api.jquery.com/input-selector/
  $(".examma-ray-question-response :input").on("change", function() {
    setTimeout(onUnsavedChanges, 500); // Timeout is to prevent this from interfering with clicking the save button
  });

  // Keyup on text inputs and textareas also triggers unsaved changes
  $("input:text, textarea").on("keyup", function() {
    setTimeout(onUnsavedChanges, 500); // Timeout is to prevent this from interfering with clicking the save button
  });

  // Note that change listeners for CodeMirror editors are set up elsewhere
}

let CREDENTIALS : string | undefined = undefined;

async function startExam(is_exam: boolean) {
  
  let examElem = $("#examma-ray-exam");
  let examId = examElem.data("exam-id");
  let examUuid = examElem.data("exam-uuid");
  let uniqname = examElem.data("uniqname");

  // Consider work to be saved when exam is started
  // but without specific saved answers
  onNothingToSave();
  
  // Check whether an autosave exists in local storage
  if (storageAvailable("localStorage")) {
    let autosavedAnswers = localStorage.getItem(localStorageExamKey(examId, uniqname, examUuid));
    if (autosavedAnswers) {
      try {
        fillExamAnswers(parseExamSubmission(autosavedAnswers));
        onUnsavedChanges();
        autosave(extractExamAnswers()); // Theoretically this should not do anything since we just loaded from autosave
        is_exam && $("#exam-welcome-restored-modal").modal("show");
      }
      catch (e: unknown) {
        is_exam && $("#exam-welcome-restored-error-modal").modal("show");
        throw e;
      }
    }
    else {
      is_exam && $("#exam-welcome-normal-modal").modal("show");
    }

    setInterval(() => {
      let answers = extractExamAnswers();
      autosave(answers);
    }, 5000);
  }
  else {
    is_exam && $("#exam-welcome-no-autosave-modal").modal("show");
  }

  // Interval to update time elapsed
  setInterval(updateTimeElapsed, 1000);

  // Connect show/hide event listeners on time elapsed element
  $('#examma-ray-time-elapsed').on('hidden.bs.collapse', function () {
    $("#examma-ray-time-elapsed-button").html("Show");
  });
  $('#examma-ray-time-elapsed').on('shown.bs.collapse', function () {
    $("#examma-ray-time-elapsed-button").html("Hide");
  });

  $('[data-spy="scroll"]').on('activate.bs.scrollspy', function () {
    // Future location for scroll events
    // console.log($("#er-exam-nav").find(".er-section-nav-link.active").data("section-uuid"));
  });

  if ($("#examma-ray-exam").data("clientside-content") === "yes") {

    const exam_spec_response = await axios({
      url: `../spec/exam-spec.json`,
      method: "GET",
      data: {},
      responseType: "text",
      transformResponse: [v => v] // Avoid default transformation that attempts JSON parsing (so we can parse our special way below)
    });
    const exam_spec = parseExamSpecification(exam_spec_response.data);
  
    const exam = Exam.create(exam_spec);
  
    const exam_manifest_response = await axios({
      url: `../manifests/${createManifestFilenameBase(uniqname, examUuid)}.json`,
      method: "GET",
      data: {},
      responseType: "text",
      transformResponse: [v => v] // Avoid default transformation that attempts JSON parsing (so we can parse our special way below)
    });
  
    const manifest = parseExamManifest(exam_manifest_response.data);
    assert(isTransparentExamManifest(manifest));
    const assigned_exam = AssignedExam.createFromSubmission(exam, fillManifest(manifest, extractExamAnswers()));
    const participant = new Participant(assigned_exam);
    
    const completion = exam.completion && new ExamCompletion(participant, $("#examma-ray-exam-completion-status"));

    (window as any).google_sign_in_callback = (response: any) => {
      const google_id_token = response.credential;
      assert(assigned_exam.exam.credentials_strategy); // otherwise callback should never have happened
      if (google_id_token && completion) {
        participant.signIn(google_id_token, assigned_exam.exam.credentials_strategy.auth_endpoint);
      }
    }

    let first : boolean = true;

    const check_answers = () => {

      assigned_exam.assignedQuestions.forEach(aq => {
        const verifier = aq.question.verifier;
        const question_elem = $(`.examma-ray-question[data-question-uuid="${aq.uuid}"]`).first();
        const answer = extractQuestionAnswers(question_elem);
        
        if (!first && answer.response === aq.rawSubmission) {
          // submission hasn't changed, nothing to do
          return;
        }

        aq.setRawSubmission(answer.response);
        if (aq.question.defaultGrader) {
          aq.grade(aq.question.defaultGrader);

          if (aq.isGraded()) {
            aq.question.defaultGrader.annotateResponseElem(<any>aq, $(`.examma-ray-question[data-question-uuid="${aq.uuid}"] .examma-ray-question-response`).first())
          }
        }
        if (verifier) {
          verifier.updateStatus(aq, $(`.examma-ray-verifier-status[data-question-uuid="${aq.uuid}"]`));
        }
      })

      completion?.refresh();
        
      first = false;
    };

    setTimeout(check_answers)

    setInterval(check_answers, 3000);

  }

}

// const plugins: ExamPlugin[] = [];

type RuntimeExamOptions = {
  /**
   * Whether or not this is an "exam" and should show certain modals.
   */
  is_exam?: boolean,
  
  // plugins?: readonly ExamPlugin[]
};

const DEFAULT_OPTIONS : Readonly<RuntimeExamOptions> = {
  // custom_css is undefined,
  // plugins: [ SECTION_REFERENCE_PLUGIN ]
};

export class RuntimeExam {

  public options: Readonly<RuntimeExamOptions>;
  // public plugins_by_id: Readonly<RuntimePluginCollection>;
  // public plugins: readonly ExamPlugin[];

  public constructor(options: Partial<RuntimeExamOptions> = {}) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    // this.plugins = this.options.plugins?.slice() ?? [];
    // this.plugins_by_id = collect_plugins(this.plugins);

    // this.plugins.forEach(p => {
    //   p.depends_on.forEach(dep => dep.plugin_id)
    // });
    
    try {
      setupQuestionStars();
    }
    catch (e) {
      // just in case
    }
  
    setupSaverModal();
  
    setupChangeListeners(false);
  
    activateExamComponents();
  
    activateExamContent();
  
    setupCodeEditors(onUnsavedChanges);
    
    startExam(!!this.options.is_exam);
  }

}
