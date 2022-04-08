import { stringify_response, extract_response, fill_response, parse_submission, activate_response } from "../src/response/responses";
import "highlight.js/styles/github.css";
import storageAvailable from "storage-available";
import { ExamSubmission, QuestionAnswer, SectionAnswers } from "../src/core/submissions";
import { Blob } from 'blob-polyfill';

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import './codemirror-modes';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/keymap/sublime.js';
import { decode } from "he";
import { FILE_CHECK, FILE_DOWNLOAD, FILLED_STAR } from '../src/core/icons';

import 'katex/dist/katex.min.css';

import "./frontend.css";
import { activateBank } from "../src/response/fitb-drop";
import { activateExamComponents } from "./common";

function activateResponse(this: HTMLElement) {
  let response = $(this);
  activate_response(response.data("response-kind"), response);
}

function activateExam() {

  // Activate any FITB Drop banks in reference material
  $(".examma-ray-section-reference .examma-ray-fitb-drop-bank").each(function() {
    let bank = $(this);
    let group_id = bank.data("examma-ray-fitb-drop-group-id")
    activateBank(bank, group_id);
  });

  $(".examma-ray-question-response").map(activateResponse).get()
}

function extractQuestionAnswers(this: HTMLElement) : QuestionAnswer {
  let question = $(this);
  let response = question.find(".examma-ray-question-response");
  return {
    question_id: "",
    skin_id: "",
    uuid: question.data("question-uuid"),
    display_index: question.data("question-display-index"),
    kind: response.data("response-kind"),
    response: stringify_response(extract_response(response.data("response-kind"), response))
  }
}

function extractSectionAnswers(this: HTMLElement) : SectionAnswers {
  let section = $(this);
  return {
    section_id: "",
    skin_id: "",
    uuid: section.data("section-uuid"),
    display_index: section.data("section-display-index"),
    questions: section.find(".examma-ray-question").map(extractQuestionAnswers).get()
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

function extractExamAnswers() : ExamSubmission {
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
    trusted: false,
    sections: $(".examma-ray-section").map(extractSectionAnswers).get()
  }
}

function isBlankAnswers(answers: ExamSubmission) {
  return answers.sections.every(s => s.questions.every(q => q.response === ""));
}

function fillQuestionAnswer(qa: QuestionAnswer) {
  let questionElem = $(`#question-${qa.uuid}`);
  let responseElem = questionElem.find(".examma-ray-question-response");
  if (responseElem.length > 0 && qa.kind === responseElem.data("response-kind")) {
    let sub = parse_submission(qa.kind, qa.response);
    fill_response(responseElem, qa.kind, sub);
  }
}

function fillExamAnswers(answers: ExamSubmission) {
  answers.sections.map(s => s.questions.map(q => fillQuestionAnswer(q)))
  if (answers.time_started) {
    TIME_STARTED = answers.time_started;
  }
  // Consider work to be saved after loading
  onSaved();
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
    let blob = new Blob([JSON.stringify(answers, null, 2)], {type: "application/json"});
    let url  = URL.createObjectURL(blob);

    $("#exam-saver-download-link")
      .attr("download", `${answers.student.uniqname}-answers.json`)
      .attr("href", url)
      .removeClass("disabled");

    $("#exam-saver-download-status").html("Click here to download your answers.");
  });
}

function localStorageExamKey(examId: string, uniqname: string, uuid: string) {
  return examId + "-" + uniqname + "-" + uuid;
}

function autosaveToLocalStorage() {
  if (storageAvailable("localStorage")) {
    console.log("autosaving...");

    let answers = extractExamAnswers();

    let prevAnswersLS = localStorage.getItem(localStorageExamKey(answers.exam_id, answers.student.uniqname, answers.uuid));
    if (prevAnswersLS) {

      let prevAnswers = <ExamSubmission>JSON.parse(prevAnswersLS);

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
    if (!isBlankAnswers(answers)) {
      localStorage.setItem(localStorageExamKey(answers.exam_id, answers.student.uniqname, answers.uuid), JSON.stringify(answers, null, 2));
      ++saveCount;
    }

    console.log("autosave complete!");
  }
}


const UNSAVED_CHANGES_HTML = `${FILE_DOWNLOAD} <span style="vertical-align: middle">Answers File</span>`;
const SAVED_HTML = `${FILE_CHECK} <span style="vertical-align: middle">Answers File</span>`;

let HAS_UNSAVED_CHANGES = false;

function onUnsavedChanges() {
  $(".examma-ray-exam-answers-file-button")
    .html(UNSAVED_CHANGES_HTML);

  HAS_UNSAVED_CHANGES = true;
}

function onSaved() {
  $(".examma-ray-exam-answers-file-button")
    .html(SAVED_HTML);

  HAS_UNSAVED_CHANGES = false;
}

function main() {
  console.log("Attempting to start exam...");

  try {
    setupQuestionStars();
  }
  catch (e) {
    // just in case
  }

  setupSaverModal();

  setupChangeListeners();

  activateExamComponents();

  activateExam();

  setupCodeEditors();
  
  startExam();

  console.log("Exam Started!");

}

if (typeof $ === "function") {
  $(main);
}
else {
  alert("It appears some required 3rd party libraries did not load. Please try refreshing the page (might take a few tries). If the problem persists, contact your course staff or instructors.")
}

class QuestionStarList {
  constructor() {
    this.starMarkedMap = {};
  }

  /**
   * newStarElementForQuestion returns a clickable star that is tied to a question.
   *
   * Like with QuestionStar.newStarElement(), the stars produced from the same UUID
   * are all connected and will toggle on and off together.
   *
   * @param question_id The corresponding question's UUID
   */
  public newStarElementForQuestion(question_id: string): JQuery<HTMLElement> {
    if (question_id in this.starMarkedMap) {
      return this.starMarkedMap[question_id].newStarElement();
    } else {
      let star = new QuestionStar(question_id, false);
      this.starMarkedMap[question_id] = star;
      return star.newStarElement();
    }
  }

  private readonly starMarkedMap: { [question_id: string]: QuestionStar }
}

class QuestionStar {

  private readonly question_id: string
  private marked: boolean

  // keeps track of every element issued by newStarElement()
  private readonly star_elements: JQuery<HTMLElement>[]
  
  constructor(question_id: string, marked: boolean) {
    this.question_id = question_id;
    this.marked = marked;
    this.star_elements = [];
  }

  /**
   * newStarElement returns a new HTML element with a clickable star.
   *
   * All stars produced by this QuestionStar object are 'connected',
   * such that clicking any one will update all the others.
   */
  public newStarElement(): JQuery<HTMLElement> {
    let star = $(
      `<span class="examma-ray-question-star">
        ${FILLED_STAR}
      </span>`
    );

    star.on("click", this.toggle.bind(this))
    this.star_elements.push(star);
    return star;
  }

  private toggle() {
    this.marked = !this.marked;

    // Update every star element that was created through newStarElement()
    for (let element of this.star_elements) {
      if (this.marked) {
        element.addClass("examma-ray-question-star-marked");
      } else {
        element.removeClass("examma-ray-question-star-marked");
      }
    }

    // Show/hide the corresponding question in the section outline
    if (this.marked) {
      $("#starred-question-" + this.question_id).show();
    } else {
      $("#starred-question-" + this.question_id).hide();
    }
  }
}

function setupQuestionStars() {
  let starList = new QuestionStarList();

  $(".examma-ray-question > .card > .card-header").each(function() {
    // Add a star after each question header
    let question = $(this).closest(".examma-ray-question");
    let question_id = question.data("question-uuid");
    let starElement = starList.newStarElementForQuestion(question_id);
    $(this).append(starElement);
  });

  $(".examma-ray-starred-nav").each(function () {
    // Add a star before each (initially hidden) question in the section navigation
    let question_id = $(this).data("question-uuid");
    let starElement = starList.newStarElementForQuestion(question_id);
    $(this).prepend(starElement);
  });
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
        let answers = <ExamSubmission>JSON.parse(await files[0].text());
        if (answers.uuid !== $("#examma-ray-exam").data("exam-uuid")) {
          alert("Error - That answers file appears to be for a different exam.");
        }
        else if (answers.student.uniqname !== $("#examma-ray-exam").data("uniqname")) {
          alert("Error - That answers file appears to be for a different student.");
        }
        else {
          if (!isBlankAnswers(answers)) {
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
      onSaved();
      $("#exam-saver").modal("hide");
    }
  });
}

function setupChangeListeners() {
  // https://stackoverflow.com/questions/7317273/warn-user-before-leaving-web-page-with-unsaved-changes
  window.addEventListener("beforeunload", function (e) {
    // EDITED - show the warning always, even if they don't have unsaved changes
    // if (!HAS_UNSAVED_CHANGES) {
    //     return undefined;
    // }

    // Note many browsers will ignore this message and just show a
    // default one for security purposes. That's ok.
    let msg = "You've made changes to you answers since the last time you downloaded an answers file. Are you sure you want to leave the page?";

    (e || window.event).returnValue = msg; //Gecko + IE
    return msg; //Gecko + Webkit, Safari, Chrome etc.
  });

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

function setupCodeEditors() {
  // Set up code editor and CodeMirror instances
  let codeMirrors : CodeMirror.Editor[] = [];
  $(".examma-ray-code-editor").each(function() {

    let cmElem = $(this).find(".examma-ray-codemirror");
    let starterCode = decode(cmElem.html());
    let mime_type = cmElem.data("codemirror-mime-type");
    cmElem.html("");
    let cm = CodeMirror(cmElem[0], {
      mode: mime_type,
      theme: "default",
      lineNumbers: false,
      tabSize: 2,
      keyMap: "sublime",
      extraKeys: {
          "Ctrl-/" : (editor) => editor.execCommand('toggleComment')
      },
      value: starterCode
    });
    codeMirrors.push(cm);
    cm.on("change", onUnsavedChanges);

    cmElem.data("examma-ray-codemirror", cm);
  });

  $(".examma-ray-theme-button").on("click", function() {
    $(".examma-ray-theme-button").removeClass("active");
    $(`.examma-ray-theme-button[data-codemirror-theme="${$(this).data("codemirror-theme")}"]`).addClass("active");
    codeMirrors.forEach(cm => cm.setOption("theme", $(this).data("codemirror-theme")));
  })
}

function startExam() {
  
  let examElem = $("#examma-ray-exam");
  let examId = examElem.data("exam-id");
  let examUuid = examElem.data("exam-uuid");
  let uniqname = examElem.data("uniqname");
  
  // Check whether an autosave exists in local storage
  if (storageAvailable("localStorage")) {
    let autosavedAnswers = localStorage.getItem(localStorageExamKey(examId, uniqname, examUuid));
    if (autosavedAnswers) {
      try {
        fillExamAnswers(<ExamSubmission>JSON.parse(autosavedAnswers));
        $("#exam-welcome-restored-modal").modal("show");
      }
      catch (e: unknown) {
        $("#exam-welcome-restored-error-modal").modal("show");
        throw e;
      }
    }
    else {
      $("#exam-welcome-normal-modal").modal("show");
    }

    // Interval to autosave to local storage every 5 seconds
    setInterval(autosaveToLocalStorage, 5000);
  }
  else {
    $("#exam-welcome-no-autosave-modal").modal("show");
  }

  // Consider work to be saved when exam is started
  onSaved();

  // Interval to update time elapsed
  setInterval(updateTimeElapsed, 1000);

  // Connect show/hide event listeners on time elapsed element
  $('#examma-ray-time-elapsed').on('hidden.bs.collapse', function () {
    $("#examma-ray-time-elapsed-button").html("Show");
  })
  $('#examma-ray-time-elapsed').on('shown.bs.collapse', function () {
    $("#examma-ray-time-elapsed-button").html("Hide");
  })
}
















