import { QuestionKind } from "./autograder";
import { CLIPBOARD, CLIPBOARD_CHECK } from "./icons";

const UNSAVED_CHANGES = `${CLIPBOARD} <span style="vertical-align: middle;">Mark as saved</span>`;
const SECTION_UNSAVED_CHANGES = `${CLIPBOARD} <span style="vertical-align: middle;">Unsaved Changes (Click Here)</span>`;
const SAVED_CHANGES = `${CLIPBOARD_CHECK} <span style="vertical-align: middle;">Saved</span>`;
const SECTION_SAVED_CHANGES = `${CLIPBOARD_CHECK} <span style="vertical-align: middle;">Saved</span>`;

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

function extractQuestionAnswers(this: HTMLElement) {
  let question = $(this);
  let response = question.find(".examma-ray-question-response");
  return {
    id: question.attr("id"),
    response: extract_response(response.data("response-kind"), response)
  }
}

function extractSectionAnswers(this: HTMLElement) {
  let section = $(this);
  return {
    id: section.attr("id"),
    questions: section.find(".examma-ray-question").map(extractQuestionAnswers).get()
  }
}

function extractExamAnswers() {
  return {
    uniqname: "TODO",
    name: "TODO",
    timestamp: Date.now(),
    sections: $(".examma-ray-section").map(extractSectionAnswers).get()
  }
}

function prepareAnswersDownloadFile() {
  let blob = new Blob([JSON.stringify(extractExamAnswers())], {type: "application/json"});
  let url  = URL.createObjectURL(blob);

  $("#exam-saver-download-link")
    .attr("download", "exam-answers.json")
    .attr("href", url)
    .removeClass("disabled");

  $("#exam-saver-download-status").html("Click here to download your answers.");
}

function updateExamSaverModal() {
  $("#exam-saver-download-status").html("Preparing download file...");
  $("#exam-saver-download-link")
    .removeAttr("href")
    .removeAttr("download")
    .addClass("disabled");

  setTimeout(prepareAnswersDownloadFile);
}

$(function() {

  // Set up exam saver modal
  $('#exam-saver').on('shown.bs.modal', function () {
    updateExamSaverModal();
  })


  setButtonStatus($(".examma-ray-question-saver-button"), true, SAVED_CHANGES);
    
  $(".examma-ray-section").each(function() {
    let section = $(this);
    let section_id = section.attr("id");

    let section_saver = $(`#${section_id}-saver`);
    let section_saver_button = $(`#${section_id}-saver-button`);

    let statuses : boolean[] = [];

    // Initially set button to saved
    setButtonStatus($(`#${section_id}-saver-button`), true, SECTION_SAVED_CHANGES);
    
    section.find(".examma-ray-question").each(function(i){
      statuses.push(true);
      let question = $(this);
      let question_id = $(this).attr("id");
      let response = question.find(".examma-ray-question-response");

      question.find(":input").on("change", function() {

        // Update corresponding save text
        $(`#${question_id}-saver-text`).html(extract_response(response.data("response-kind"), response));


        // Update corresponding question save button to have unsaved changes
        setButtonStatus($(`#${question_id}-saver-button`), false, UNSAVED_CHANGES);
        statuses[i] = false;

        // Update save button for whole section to have unsaved changes
        setButtonStatus($(`#${section_id}-saver-button`), false, SECTION_UNSAVED_CHANGES);
      });

    });

    section_saver.find(".examma-ray-question-saver-button").each(function(i) {
      $(this).on("click", function() {
        setButtonStatus($(this), true, SAVED_CHANGES);
        statuses[i] = true;
        
        // Check section to see if all are saved
        if (statuses.every(status => status)) {
          setButtonStatus(section_saver_button, true, SECTION_SAVED_CHANGES);
        }
      });
    });
    


  });
});


function DEFAULT_MC_RENDERER(responseElem: JQuery) {
  return <string>(responseElem.find("input:checked").val() ?? "");
}

function DEFAULT_CODE_FITB_RENDERER(responseElem: JQuery) {
  return `TODO
  `;
}

function DEFAULT_SAS_RENDERER(responseElem: JQuery) {
  return `TODO
  `;
}

export const RESPONSE_EXTRACTORS : {
  [QT in QuestionKind]: (responseElem: JQuery) => string
} = {
  "multiple_choice": DEFAULT_MC_RENDERER,
  "code_fitb": DEFAULT_CODE_FITB_RENDERER,
  "select_a_statement": DEFAULT_SAS_RENDERER,
}

function extract_response(questionKind: QuestionKind, responseElem: JQuery) : string {
  return RESPONSE_EXTRACTORS[questionKind](responseElem);
}