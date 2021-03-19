import { Question } from "./autograder";
import { CLIPBOARD, CLIPBOARD_CHECK } from "./icons";
import { BLANK_SUBMISSION, FITBSubmission, MCSubmission, parse_submission, QuestionKind, SASSubmission, SubmissionType } from "./parsers";
import { assertFalse } from "./util";

const UNSAVED_CHANGES = `${CLIPBOARD} <span style="vertical-align: middle;">Mark as saved</span>`;
const SECTION_UNSAVED_CHANGES = `${CLIPBOARD} <span style="vertical-align: middle;">Unsaved Changes (Click Here)</span>`;
const SAVED_CHANGES = `${CLIPBOARD_CHECK} <span style="vertical-align: middle;">Saved</span>`;
const SECTION_SAVED_CHANGES = `${CLIPBOARD_CHECK} <span style="vertical-align: middle;">Saved</span>`;

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
    id: section.attr("id")!,
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

  $("#test-upload").on("click", async () => {
    let files = (<HTMLInputElement>$("#exam-saver-file-input")[0]).files;
    if (files) {
      let answers = <ExamAnswers>JSON.parse(await files[0].text());
      // TODO add check if not properly formatted
      loadExamAnswers(answers);
    }
  })

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
    
    // section.find(".examma-ray-question").each(function(i){
    //   statuses.push(true);
    //   let question = $(this);
    //   let question_id = $(this).attr("id");
    //   let response = question.find(".examma-ray-question-response");

    //   question.find(":input").on("change", function() {

    //     // Update corresponding save text
    //     $(`#${question_id}-saver-text`).html(extract_response(response.data("response-kind"), response));


    //     // Update corresponding question save button to have unsaved changes
    //     setButtonStatus($(`#${question_id}-saver-button`), false, UNSAVED_CHANGES);
    //     statuses[i] = false;

    //     // Update save button for whole section to have unsaved changes
    //     setButtonStatus($(`#${section_id}-saver-button`), false, SECTION_UNSAVED_CHANGES);
    //   });

    // });

    // section_saver.find(".examma-ray-question-saver-button").each(function(i) {
    //   $(this).on("click", function() {
    //     setButtonStatus($(this), true, SAVED_CHANGES);
    //     statuses[i] = true;
        
    //     // Check section to see if all are saved
    //     if (statuses.every(status => status)) {
    //       setButtonStatus(section_saver_button, true, SECTION_SAVED_CHANGES);
    //     }
    //   });
    // });
    


  });
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