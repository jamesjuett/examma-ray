import { CLIPBOARD, CLIPBOARD_CHECK, FILE_CHECK, FILE_DOWNLOAD } from "./icons";
import { assertFalse } from "./util";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { stringify_response, extract_response, fill_response, parse_submission } from "./response/responses";
import { ResponseKind } from "./response/common";
import hljs from 'highlight.js';
import "highlight.js/styles/github.css";
// import "highlight.js/styles/monokai.css";
import cpp from 'highlight.js/lib/languages/cpp';
hljs.registerLanguage('cpp', cpp);
hljs.highlightAll();

export type QuestionAnswerJSON = {
  id: string;
  kind: ResponseKind;
  response: string;
};

export type SectionAnswersJSON = {
  id: string;
  questions: QuestionAnswerJSON[];
};

export type ExamAnswersJSON = {
  uniqname: string;
  name: string;
  timestamp: number;
  sections: SectionAnswersJSON[];
}

function setButtonStatus(button: JQuery, isSaved: boolean, html: string) {
  if (isSaved) {
    button
      .html(html)
      .removeClass("btn-warning")
      .addClass("btn-success");
  }
  else {
    button
      .html(html)
      .removeClass("btn-success")
      .addClass("btn-warning");
  }
}

function extractQuestionAnswers(this: HTMLElement) : QuestionAnswerJSON {
  let question = $(this);
  let response = question.find(".examma-ray-question-response");
  return {
    id: question.data("question-id"),
    kind: response.data("response-kind"),
    response: stringify_response(extract_response(response.data("response-kind"), response))
  }
}

function extractSectionAnswers(this: HTMLElement) : SectionAnswersJSON {
  let section = $(this);
  return {
    id: section.data("section-id"),
    questions: section.find(".examma-ray-question").map(extractQuestionAnswers).get()
  }
}

function extractExamAnswers() : ExamAnswersJSON {
  let examElem = $("#examma-ray-exam");
  return {
    uniqname: examElem.data("uniqname"),
    name: examElem.data("name"),
    timestamp: Date.now(),
    sections: $(".examma-ray-section").map(extractSectionAnswers).get()
  }
}

function loadQuestionAnswer(qa: QuestionAnswerJSON) {
  let questionElem = $(`#question-${qa.id}`);
  let responseElem = questionElem.find(".examma-ray-question-response");
  let sub = parse_submission(qa.kind, qa.response);
  fill_response(responseElem, qa.kind, sub);
}

function loadExamAnswers(answers: ExamAnswersJSON) {
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
    let blob = new Blob([JSON.stringify(extractExamAnswers())], {type: "application/json"});
    let url  = URL.createObjectURL(blob);

    $("#exam-saver-download-link")
      .attr("download", "exam-answers.json")
      .attr("href", url)
      .removeClass("disabled");

    $("#exam-saver-download-status").html("Click here to download your answers.");
  });
}


TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');
let lastSavedTime = Date.now();

function updateTimeSaved() {
  $("#examma-ray-exam-saver-last-save")
    .html(`Last saved ${timeAgo.format(lastSavedTime, 'round')}.`);
}

const UNSAVED_CHANGES_HTML = `${FILE_DOWNLOAD} <span style="vertical-align: middle">Download Answers</span>`;
const SAVED_HTML = `${FILE_CHECK} <span style="vertical-align: middle">Download Answers</span>`;

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

$(function() {

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
        let answers = <ExamAnswersJSON>JSON.parse(await files[0].text());
        loadExamAnswers(answers);
        $("#exam-saver").modal("hide");
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
  

  // Any change to an input element within a question response
  // triggers unsaved changes
  // https://api.jquery.com/input-selector/
  $(".examma-ray-question-response :input").on("change", function() {
    setTimeout(onUnsavedChanges, 1000); // Timeout is to prevent this from interfering with clicking the save button
  });

  // Keyup on text inputs and textareas also triggers unsaved changes
  $("input:text, textarea").on("keyup", function() {
    setTimeout(onUnsavedChanges, 100); // Timeout is to prevent this from interfering with clicking the save button
  });
  

  // A click on the download link indicates all work has been saved
  $("#exam-saver-download-link").on("click", function(this: HTMLElement) {

    // sanity check that they actually downloaded something
    if ($(this).attr("href")) {
      onSaved();
      $("#exam-saver").modal("hide");
    }
  });

  // Interval to update time saved ago message every 10 seconds
  setInterval(updateTimeSaved, 10000);


  // Consider work to be saved when page is loaded
  onSaved();
});















