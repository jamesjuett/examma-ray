import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { stringify_response, extract_response, fill_response, parse_submission } from "./response/responses";
import { BLANK_SUBMISSION, ResponseKind } from "./response/common";
import "highlight.js/styles/github.css";
import storageAvailable from "storage-available";
import { ExamAnswers, QuestionAnswer, SectionAnswers } from "./common";

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/comment/comment.js'
import 'codemirror/keymap/sublime.js'
import { decode } from "he";
import { FILE_CHECK, FILE_DOWNLOAD } from './icons';

import 'katex/dist/katex.min.css';

import "./main.css";

function extractQuestionAnswers(this: HTMLElement) : QuestionAnswer {
  let question = $(this);
  let response = question.find(".examma-ray-question-response");
  return {
    id: question.data("question-id"),
    display_index: question.data("question-display-index"),
    kind: response.data("response-kind"),
    response: stringify_response(extract_response(response.data("response-kind"), response))
  }
}

function extractSectionAnswers(this: HTMLElement) : SectionAnswers {
  let section = $(this);
  return {
    id: section.data("section-id"),
    display_index: section.data("section-display-index"),
    questions: section.find(".examma-ray-question").map(extractQuestionAnswers).get()
  }
}

const saverID = Date.now();
let saveCount = 0;

function extractExamAnswers() : ExamAnswers {
  let examElem = $("#examma-ray-exam");
  return {
    exam_id: examElem.data("exam-id"),
    student: {
      uniqname: examElem.data("uniqname"),
      name: examElem.data("name")
    },
    timestamp: Date.now(),
    saverId: saverID,
    validated: false,
    sections: $(".examma-ray-section").map(extractSectionAnswers).get()
  }
}

function isBlankAnswers(answers: ExamAnswers) {
  return answers.sections.every(s => s.questions.every(q => q.response === ""));
}

function loadQuestionAnswer(qa: QuestionAnswer) {
  let questionElem = $(`#question-${qa.id}`);
  let responseElem = questionElem.find(".examma-ray-question-response");
  let sub = parse_submission(qa.kind, qa.response);
  fill_response(responseElem, qa.kind, sub);
}

function loadExamAnswers(answers: ExamAnswers) {
  answers.sections.map(s => s.questions.map(q => loadQuestionAnswer(q)))

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
    let blob = new Blob([JSON.stringify(extractExamAnswers(), null, 2)], {type: "application/json"});
    let url  = URL.createObjectURL(blob);

    $("#exam-saver-download-link")
      .attr("download", "exam-answers.json")
      .attr("href", url)
      .removeClass("disabled");

    $("#exam-saver-download-status").html("Click here to download your answers.");
  });
}

function localStorageExamKey(examId: string, uniqname: string) {
  return examId + "-" + uniqname;
}

function autosaveToLocalStorage() {
  if (storageAvailable("localStorage")) {
    console.log("autosaving...");

    let answers = extractExamAnswers();

    let prevAnswersLS = localStorage.getItem(localStorageExamKey(answers.exam_id, answers.student.uniqname));
    if (prevAnswersLS) {

      let prevAnswers = <ExamAnswers>JSON.parse(prevAnswersLS);

      // We want to know if we're competing with another tab/window.
      // We can detect that by checking if the previous save was made with a different saver ID,
      // and we have already saved once (otherwise we would detect starting up a tab after a previous
      // one was closed rather than a true interleaving of saves)
      if (saveCount > 0 && prevAnswers.saverId !== answers.saverId) {
        $("#multiple-tabs-modal").modal("show");
      }
      
    }


    // Only save if there is something to save
    if (!isBlankAnswers(answers)) {
      localStorage.setItem(localStorageExamKey(answers.exam_id, answers.student.uniqname), JSON.stringify(answers, null, 2));
      ++saveCount;
    }

    console.log("autosave complete!");
  }
}


TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');
let lastSavedTime = Date.now();

function updateTimeSaved() {
  $("#examma-ray-exam-saver-last-save")
    .html(`Last saved ${timeAgo.format(lastSavedTime, 'round')}.`);
}

const UNSAVED_CHANGES_HTML = `${FILE_DOWNLOAD} <span style="vertical-align: middle">Answers File</span>`;
const SAVED_HTML = `${FILE_CHECK} <span style="vertical-align: middle">Answers File</span>`;

function onUnsavedChanges() {
  $("#exam-saver-button")
    .html(UNSAVED_CHANGES_HTML)
    .removeClass("btn-success")
    .addClass("btn-warning");
}

function onSaved() {
  $("#exam-saver-button")
    .html(SAVED_HTML)
    .removeClass("btn-warning")
    .addClass("btn-success");

  lastSavedTime = Date.now();
  $("#examma-ray-exam-saver-last-save").css("visibility", "visible");
  updateTimeSaved();
}

function main() {

  setupSaverModal();

  setupChangeListeners();

  setupCodeEditors();
  
  startExam();

}

$(main);

function setupSaverModal() {

  let fileInput = $("#exam-saver-file-input");
  let loadButton = $("#exam-saver-load-button");

  // Enable/disable the "load answers" button based on whether a file is selected
  fileInput.on("change", function() {
    let files = (<HTMLInputElement>this).files;
    if (files) {
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
    // note - there is logic elsewhere to disable the button
    // if there is no file selected, so this is just here for completeness
    if (files) {
      try {
        let answers = <ExamAnswers>JSON.parse(await files[0].text());
        if (answers.exam_id === $("#examma-ray-exam").data("exam-id")) {
          if (!isBlankAnswers(answers)) {
            loadExamAnswers(answers);
            $("#exam-saver").modal("hide");
          }
          else {
            alert("Error - That answers file appears to be blank.")
          }
        }
        else {
          alert("Error - That answers file appears to be for a different exam.");
        }
      }
      catch(err) {
        alert("Sorry, an error occurred while processing that file. Is it a properly formatted save file?");
        // TODO add a more rigorous check if the file is not properly formatted than just checking for exceptions
      }
    }
  })

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
}

function setupCodeEditors() {
  // Set up code editor and CodeMirror instances
  let codeMirrors : CodeMirror.Editor[] = [];
  $(".examma-ray-code-editor").each(function() {

    let cmElem = $(this).find(".examma-ray-codemirror");
    let starterCode = decode(cmElem.html());
    cmElem.html("");
    let cm = CodeMirror(cmElem[0], {
      mode: "text/x-c++src",
      theme: "default",
      lineNumbers: true,
      tabSize: 2,
      keyMap: "sublime",
      extraKeys: {
          "Ctrl-/" : (editor) => editor.execCommand('toggleComment')
      },
      value: starterCode
    });
    codeMirrors.push(cm);

    cmElem.data("examma-ray-codemirror", cm);
  });

  $(".examma-ray-theme-button").on("click", function() {
    codeMirrors.forEach(cm => cm.setOption("theme", $(this).data("codemirror-theme")));
  })
}

function startExam() {
  
  let examElem = $("#examma-ray-exam");
  let examId = examElem.data("exam-id");
  let uniqname = examElem.data("uniqname");
  
  // Check whether an autosave exists in local storage
  if (storageAvailable("localStorage")) {
    let autosavedAnswers = localStorage.getItem(localStorageExamKey(examId, uniqname));
    if (autosavedAnswers) {
      loadExamAnswers(<ExamAnswers>JSON.parse(autosavedAnswers));
      $("#exam-welcome-restored-modal").modal("show");
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

  // Interval to update time saved ago message every 10 seconds
  setInterval(updateTimeSaved, 10000);

}















