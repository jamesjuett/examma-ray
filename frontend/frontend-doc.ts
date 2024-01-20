import { Blob } from 'blob-polyfill';
import storageAvailable from "storage-available";
import { ExamSubmission, OpaqueExamSubmission, OpaqueQuestionAnswer, OpaqueSectionAnswers, QuestionAnswer, createManifestFilenameBase, fillManifest, isBlankSubmission, isTransparentExamManifest, parseExamManifest, parseExamSubmission } from "../src/core/submissions";
import { extract_response, fill_response, parse_submission, stringify_response } from "../src/response/responses";

import { FILE_CHECK, FILE_DOWNLOAD, FILLED_STAR } from '../src/core/icons';

import axios from "axios";
import { Exam } from "../src/core/exam_components";
import { parseExamSpecification } from "../src/core/exam_specification";
import { activateExamComponents, activateExamContent, setupCodeEditors } from "./common";
import "./frontend-doc.css";
import { assert } from '../src/core/util';
import { AssignedExam } from '../src/core/assigned_exams';
import { ExamCompletion } from '../src/verifiers/ExamCompletion';
import { jwtDecode } from 'jwt-decode';


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
      .attr("download", `${answers.student.uniqname}-${answers.exam_id}-answers.json`)
      .attr("href", url)
      .removeClass("disabled");

    $("#exam-saver-download-status").html("Click here to download your answers.");
  });
}

function localStorageExamKey(examId: string, uniqname: string, uuid: string) {
  return examId + "-" + uniqname + "-" + uuid;
}

function autosaveToLocalStorage(answers: ExamSubmission) {
  if (storageAvailable("localStorage")) {
    console.log("autosaving...");

    let answers = extractExamAnswers();

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

  activateExamContent();

  setupCodeEditors(onUnsavedChanges);
  
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

  private readonly starMarkedMap: { [question_uuid: string]: QuestionStar };

  public constructor() {
    this.starMarkedMap = {};
  }

  /**
   * newStarElementForQuestion returns a clickable star that is tied to a question.
   *
   * Like with QuestionStar.newStarElement(), the stars produced from the same UUID
   * are all connected and will toggle on and off together.
   *
   * @param question_uuid The corresponding question's UUID
   */
  public newStarElementForQuestion(question_uuid: string): JQuery<HTMLElement> {
    if (question_uuid in this.starMarkedMap) {
      return this.starMarkedMap[question_uuid].newStarElement();
    } else {
      let star = new QuestionStar(question_uuid, false);
      this.starMarkedMap[question_uuid] = star;
      return star.newStarElement();
    }
  }
}

class QuestionStar {

  private readonly question_uuid: string;
  private marked: boolean;

  // keeps track of every element issued by newStarElement()
  private readonly star_elements: JQuery<HTMLElement>[];

  public constructor(question_uuid: string, marked: boolean) {
    this.question_uuid = question_uuid;
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
      $("#starred-question-" + this.question_uuid).show();
    } else {
      $("#starred-question-" + this.question_uuid).hide();
    }
  }
}

function setupQuestionStars() {
  let starList = new QuestionStarList();

  $(".examma-ray-question > .card > .card-header").each(function() {
    // Add a star after each question header
    let question = $(this).closest(".examma-ray-question");
    let question_uuid = question.data("question-uuid");
    let starElement = starList.newStarElementForQuestion(question_uuid);
    $(this).append(starElement);
  });

  $(".examma-ray-starred-nav").each(function () {
    // Add a star before each (initially hidden) question in the section navigation
    let question_uuid = $(this).data("question-uuid");
    let starElement = starList.newStarElementForQuestion(question_uuid);
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
      onSaved();
      $("#exam-saver").modal("hide");
    }
  });
}

function setupChangeListeners() {
  // https://stackoverflow.com/questions/7317273/warn-user-before-leaving-web-page-with-unsaved-changes
  // window.addEventListener("beforeunload", function (e) {
  //   if (!HAS_UNSAVED_CHANGES) {
  //       return undefined;
  //   }

  //   // Note many browsers will ignore this message and just show a
  //   // default one for security purposes. That's ok.
  //   let msg = "You've made changes to you answers since the last time you downloaded an answers file. Are you sure you want to leave the page?";

  //   (e || window.event).returnValue = msg; //Gecko + IE
  //   return msg; //Gecko + Webkit, Safari, Chrome etc.
  // });

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

let COMPLETION : ExamCompletion | undefined = undefined;
let CREDENTIALS : string | undefined = undefined;

async function startExam() {
  
  let examElem = $("#examma-ray-exam");
  let examId = examElem.data("exam-id");
  let examUuid = examElem.data("exam-uuid");
  let uniqname = examElem.data("uniqname");
  
  // Check whether an autosave exists in local storage
  if (storageAvailable("localStorage")) {
    let autosavedAnswers = localStorage.getItem(localStorageExamKey(examId, uniqname, examUuid));
    if (autosavedAnswers) {
      try {
        fillExamAnswers(parseExamSubmission(autosavedAnswers));
        // $("#exam-welcome-restored-modal").modal("show");
      }
      catch (e: unknown) {
        // $("#exam-welcome-restored-error-modal").modal("show");
        throw e;
      }
    }
    else {
      // $("#exam-welcome-normal-modal").modal("show");
    }

    setInterval(() => {
      let answers = extractExamAnswers();
      autosaveToLocalStorage(answers);
    }, 5000);
  }
  else {
    // $("#exam-welcome-no-autosave-modal").modal("show");
  }

  // Consider work to be saved when exam is started
  onSaved();

  // Interval to update time elapsed
  setInterval(updateTimeElapsed, 1000);

  // Connect show/hide event listeners on time elapsed element
  $('#examma-ray-time-elapsed').on('hidden.bs.collapse', function () {
    $("#examma-ray-time-elapsed-button").html("Show");
  });
  $('#examma-ray-time-elapsed').on('shown.bs.collapse', function () {
    $("#examma-ray-time-elapsed-button").html("Hide");
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
    
    COMPLETION = exam.completion && new ExamCompletion(assigned_exam, $("#examma-ray-exam-completion-status"));

    (window as any).google_sign_in_callback = (response: any) => {
      let email = (jwtDecode(response.credential) as any).email;
      $("#examma-ray-exam-sign-in-button > span").html(email.replace("@umich.edu", ""));
      CREDENTIALS = response.credential;
      
      if (CREDENTIALS) {
        setTimeout(async () => {
          await COMPLETION?.checkCompletionWithServer(CREDENTIALS!);
          if (!COMPLETION!.isComplete) {
            COMPLETION!.verify(assigned_exam, CREDENTIALS!);
          }
        })
      }
    }

    const check_answers = () => {

      assigned_exam.assignedQuestions.forEach(aq => {
        const verifier = aq.question.verifier;
        if (verifier) {
          const question_elem = $(`.examma-ray-question[data-question-uuid="${aq.uuid}"]`).first();
          const answer = extractQuestionAnswers(question_elem);
          aq.setRawSubmission(answer.response);
          if (aq.question.defaultGrader) {
            aq.grade(aq.question.defaultGrader);
          }
          verifier.updateStatus(aq, $(`.examma-ray-verifier-status[data-question-uuid="${aq.uuid}"]`));
        }
      })

    if (CREDENTIALS && COMPLETION) {
        if (!COMPLETION.isComplete) {
          COMPLETION.verify(assigned_exam, CREDENTIALS);
        }
      }

    };

    setTimeout(check_answers)

    setInterval(check_answers, 3000);

  }

}


















