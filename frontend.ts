import { CLIPBOARD, CLIPBOARD_CHECK } from "./icons";

const UNSAVED_CHANGES = `${CLIPBOARD} <span style="vertical-align: middle;">Mark as saved</span>`;
const SAVED_CHANGES = `${CLIPBOARD_CHECK} <span style="vertical-align: middle;">Saved</span>`;

function setButtonStatus(button: JQuery, isSaved: boolean) {
  if (isSaved) {
    button
      .data("saved", true)
      .html(SAVED_CHANGES)
      .removeClass("btn-warning")
      .addClass("btn-success");
  }
  else {
    button
      .data("saved", false)
      .html(UNSAVED_CHANGES)
      .removeClass("btn-success")
      .addClass("btn-warning");
  }
}

$(function() {
  setButtonStatus($(".examma-ray-question-saver-button"), false);
    
  $(".examma-ray-section").each(function() {
    let section = $(this);
    let section_id = section.attr("id");

    let section_saver = $(`#${section_id}-saver`);
    let section_saver_button = $(`#${section_id}-saver-button`);

    let statuses : boolean[] = [];
    
    section.find(".examma-ray-question").each(function(i){
      statuses.push(false);
      let question_id = $(this).attr("id");

      $(this).find(":input").on("change", function() {
        // Update corresponding question save button to have unsaved changes
        setButtonStatus($(`#${question_id}-saver-button`), false);
        statuses[i] = false;

        // Update save button for whole section to have unsaved changes
        setButtonStatus($(`#${section_id}-saver-button`), false);
      });

    });

    section_saver.find(".examma-ray-question-saver-button").each(function(i) {
      $(this).on("click", function() {
        setButtonStatus($(this), true);
        statuses[i] = true;
        
        // Check section to see if all are saved
        if (statuses.every(status => status)) {
          setButtonStatus(section_saver_button, true);
        }
      });
    });
    


  });
});