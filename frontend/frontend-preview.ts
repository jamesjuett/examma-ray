import { activateExam, activateExamComponents, setupCodeEditors } from "./common";

function setupSkinPickers() {
  $(".er-section-skin-picker-link").on("click", function() {
    const section_id = $(this).data("section-id");
    const skin_id = $(this).data("skin-id");
    const skin_num = $(this).data("skin-num");

    $(`#section-${section_id} .examma-ray-section`).hide();
    $(`#section-${section_id} .examma-ray-section[data-skin-id="${skin_id}"]`).show();

    // All dropdown buttons should show the current skin ID now
    $(`#section-${section_id} .er-current-section-skin-id`).html(skin_id);
    $(`#section-${section_id} .er-current-section-skin-num`).html(skin_num);
  });
  
  $(".er-question-skin-picker-link").on("click", function() {
    const question_id = $(this).data("question-id");
    const skin_id = $(this).data("skin-id");
    const skin_num = $(this).data("skin-num");

    $(`#question-${question_id} .examma-ray-question`).hide();
    $(`#question-${question_id} .examma-ray-question[data-skin-id="${skin_id}"]`).show();

    // All dropdown buttons should show the current skin ID now
    $(`#question-${question_id} .er-current-question-skin-id`).html(skin_id);
    $(`#question-${question_id} .er-current-question-skin-num`).html(skin_num);
  });
}

function activatePreviewComponents() {

  $("#er-preview-show-originals-button").on("click",
    () => {
      $(".question-content-original").show();
      $(".question-content-solution").hide();
      $(".question-content-solution-header").hide();
    }
  );
  $("#er-preview-show-solutions-button").on("click",
    () => {
      $(".question-content-solution").show();
      $(".question-content-solution-header").show();
      $(".question-content-original").hide();
    }
  );

}

function main() {

  activateExamComponents();

  activatePreviewComponents();

  activateExam();

  setupCodeEditors(() => {});

  setupSkinPickers();

  $('[data-toggle="tooltip"]').tooltip();

}

if (typeof $ === "function") {
  $(main);
}
else {
  alert("It appears some required 3rd party libraries did not load. Please try refreshing the page (might take a few tries). If the problem persists, contact your course staff or instructors.")
}