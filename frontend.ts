import { CLIPBOARD, CLIPBOARD_CHECK, FILE_CHECK, FILE_DOWNLOAD } from "./icons";
import { BLANK_SUBMISSION, FITBSubmission, MCSubmission, parse_submission, QuestionKind, SASSubmission, SubmissionType } from "./parsers";
import { assertFalse } from "./util";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

export type QuestionAnswer = {
  id: string;
  kind: QuestionKind;
  response: string;
};

export type SectionAnswer = {
  id: string;
  questions: QuestionAnswer[];
};

export type ExamAnswers = {
  uniqname: string;
  name: string;
  timestamp: number;
  sections: SectionAnswer[];
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

function extractQuestionAnswers(this: HTMLElement) : QuestionAnswer {
  let question = $(this);
  let response = question.find(".examma-ray-question-response");
  return {
    id: question.data("question-id"),
    kind: response.data("response-kind"),
    response: stringify_response(extract_response(response.data("response-kind"), response))
  }
}

function extractSectionAnswers(this: HTMLElement) : SectionAnswer {
  let section = $(this);
  return {
    id: section.data("section-id"),
    questions: section.find(".examma-ray-question").map(extractQuestionAnswers).get()
  }
}

function extractExamAnswers() : ExamAnswers {
  let examElem = $("#examma-ray-exam");
  return {
    uniqname: examElem.data("uniqname"),
    name: examElem.data("name"),
    timestamp: Date.now(),
    sections: $(".examma-ray-section").map(extractSectionAnswers).get()
  }
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
        let answers = <ExamAnswers>JSON.parse(await files[0].text());
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
    onUnsavedChanges();
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


function DEFAULT_MC_EXTRACTOR(responseElem: JQuery) {
  return responseElem.find("input:checked").map(i => i).get();
}

function DEFAULT_CODE_FITB_EXTRACTOR(responseElem: JQuery) {
  return assertFalse();
}

function DEFAULT_SAS_EXTRACTOR(responseElem: JQuery) {
  return assertFalse();
}

export const RESPONSE_EXTRACTORS : {
  [QT in QuestionKind]: (responseElem: JQuery) => SubmissionType<QT>
} = {
  "multiple_choice": DEFAULT_MC_EXTRACTOR,
  "code_fitb": DEFAULT_CODE_FITB_EXTRACTOR,
  "select_a_statement": DEFAULT_SAS_EXTRACTOR,
}

function extract_response<QT extends QuestionKind>(questionKind: QT, responseElem: JQuery) : SubmissionType<QT> {
  return (<(responseElem: JQuery) => SubmissionType<QT>>RESPONSE_EXTRACTORS[questionKind])(responseElem);
}

function stringify_response<QT extends QuestionKind>(submission: SubmissionType<QT>) {
  return submission === BLANK_SUBMISSION ? "" : JSON.stringify(submission);
}

function DEFAULT_MC_FILLER(elem: JQuery, submission: MCSubmission) {
  // blank out all radio buttons
  let inputs = elem.find("input");
  inputs.prop("checked", false);

  if (submission !== BLANK_SUBMISSION) {
    let inputElems = inputs.get();
    submission.forEach(n => $(inputElems[n]).prop("checked", true));
  }
}

function DEFAULT_CODE_FITB_FILLER(elem: JQuery, submission: FITBSubmission) {
  // TODO
}

function DEFAULT_SAS_FILLER(elem: JQuery, submission: SASSubmission) {
  // TODO
}

export const RESPONSE_FILLERS : {
  [QT in QuestionKind]: (elem: JQuery, submission: SubmissionType<QT>) => void
} = {
  "multiple_choice": <any>DEFAULT_MC_FILLER,
  "code_fitb": <any>DEFAULT_CODE_FITB_FILLER,
  "select_a_statement": <any>DEFAULT_SAS_FILLER,
}

function fill_response<QT extends QuestionKind>(elem: JQuery, kind: QT, response: SubmissionType<QT>) : void {
  return (<(elem: JQuery, submission: SubmissionType<QT>) => void>RESPONSE_FILLERS[kind])(elem, response);
}