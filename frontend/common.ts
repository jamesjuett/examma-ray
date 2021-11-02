export function activateExamComponents() {
  // Active section reference width slider
  $(".examma-ray-section-reference-width-slider").on("input", function() {
    let column = $(this).closest(".examma-ray-section-reference-column");
    let newWidth = $(this).val() + "%";
    column.css("width", newWidth);
    column.find(".examma-ray-section-reference-width-value").html(newWidth);
  });
}