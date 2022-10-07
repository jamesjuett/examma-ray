import { activateExam, activateExamComponents, setupCodeEditors } from "./common";

function setupSkinPickers() {
  $(".er-section-skin-picker-link").on("click", function() {
    const section_id = $(this).data("section-id");
    const skin_id = $(this).data("skin-id");

    $(`#section-${section_id} .examma-ray-section`).hide();
    $(`#section-${section_id} .examma-ray-section[data-skin-id="${skin_id}"]`).show();
  })
}

function main() {

  activateExamComponents();

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