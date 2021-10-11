import { clearDownloads, downloadAnswersFile, unstickSectionHeadings, uploadAnswersFile } from "../common";
import expected_download from "./expected_download.json";

import chaiSubset from "chai-subset";
chai.use(chaiSubset);

function loadFreshPage() {

  const EXAM_URL = "full_test_exam/exams/test-test-full_test_exam.html";
  
  cy.clearLocalStorage();

  cy.visit(EXAM_URL);
  unstickSectionHeadings();

  cy.get("#exam-welcome-normal-modal button").click();

  cy.get("#exam-welcome-normal-modal button").should("not.be.visible");

}

function responseElem() {
  return cy.get('#question-test-full_test_exam-q-fitb_drop_test .examma-ray-question-response.examma-ray-question-response-fitb_drop[data-response-kind="fitb_drop"]');
}

function checkOriginals() {
  cy.get('.examma-ray-fitb-drop-originals .examma-ray-fitb-droppable').should("have.length", 3);
  cy.get('.examma-ray-fitb-drop-originals .examma-ray-fitb-droppable[data-examma-ray-fitb-drop-id="item1"').should("have.length", 1);
  cy.get('.examma-ray-fitb-drop-originals .examma-ray-fitb-droppable[data-examma-ray-fitb-drop-id="item2"').should("have.length", 1);
  cy.get('.examma-ray-fitb-drop-originals .examma-ray-fitb-droppable[data-examma-ray-fitb-drop-id="item3"').should("have.length", 1);
}

function checkBank() {
  cy.get('.examma-ray-fitb-drop-bank .examma-ray-fitb-droppable').should("have.length", 3);
  cy.get('.examma-ray-fitb-drop-originals .examma-ray-fitb-droppable[data-examma-ray-fitb-drop-id="item1"').should("have.length", 1);
  cy.get('.examma-ray-fitb-drop-originals .examma-ray-fitb-droppable[data-examma-ray-fitb-drop-id="item2"').should("have.length", 1);
  cy.get('.examma-ray-fitb-drop-originals .examma-ray-fitb-droppable[data-examma-ray-fitb-drop-id="item3"').should("have.length", 1);
}

describe('FITB-Drop Response', () => {
  
  beforeEach(() => {

    clearDownloads();
    loadFreshPage();

  });

  it('Response Element', () => {

    responseElem().should("be.visible");

  });

  it('Render Originals', () => {

    checkOriginals();

  });

  it('Render Bank', () => {

    checkBank();

  });

  it('Render Drop Locations', () => {

    // 1 from originals item1, 1 from bank item1, 3 from content, 1 from starter with nested drop location
    responseElem().find('.examma-ray-fitb-drop-location').should("have.length", 6);

  });

  it('Render Blanks/Boxes', () => {

    // 1 from originals item1, 1 from bank item1, 1 from content, 1 from starter with nested blank
    responseElem().find('.examma-ray-fitb-blank-input').should("have.length", 4);

    // 1 from content
    responseElem().find('.examma-ray-fitb-box-input').should("have.length", 1);

  });

  it('Render Starter', () => {

    responseElem().find('.examma-ray-fitb-drop-location').eq(2).contains("item-test-2");
    responseElem().find('.examma-ray-fitb-drop-location').eq(3).contains("for(int");
    responseElem().find('.examma-ray-fitb-drop-location').eq(4).should("be.empty");
    responseElem().find('.examma-ray-fitb-blank-input').eq(2).should("have.value", "starter-blank");
    responseElem().find('.examma-ray-fitb-box-input').should("have.value", "starter\nbox");

  });

  it('Simple Drag/Drop', () => {

    responseElem().find('.examma-ray-fitb-drop-bank [data-examma-ray-fitb-drop-id="item2"]').trigger("pointerdown", {button: 0});
    responseElem().find('.sortable-chosen').trigger("dragstart");
    cy.wait(100);
    responseElem().find('.examma-ray-fitb-drop-location').last().trigger("dragenter");
    responseElem().find('.sortable-chosen.sortable-ghost > *').first().trigger("drop");
    responseElem().find('.examma-ray-fitb-drop-location').last().contains("item-test-2");

    // bank and originals should be unchanged
    checkOriginals();
    checkBank();

  });

  it('Drag/Drop Into Nested Location', () => {

    responseElem().find('.examma-ray-fitb-drop-bank [data-examma-ray-fitb-drop-id="item3"]').trigger("pointerdown", {button: 0});
    responseElem().find('.sortable-chosen').trigger("dragstart");
    cy.wait(100);
    responseElem().find('.examma-ray-fitb-drop-location').eq(4).trigger("dragenter");
    responseElem().find('.sortable-chosen.sortable-ghost > *').first().trigger("drop");
    responseElem().find('.examma-ray-fitb-drop-location').eq(4).contains("item-test-3");

    // bank and originals should be unchanged
    checkOriginals();
    checkBank();
    
  });

  it('Drag/Drop Into 2nd Level Nested Location', () => {

    responseElem().find('.examma-ray-fitb-drop-bank [data-examma-ray-fitb-drop-id="item1"]').trigger("pointerdown", {button: 0});
    responseElem().find('.sortable-chosen').trigger("dragstart");
    cy.wait(100);
    responseElem().find('.examma-ray-fitb-drop-location').eq(4).trigger("dragenter");
    responseElem().find('.sortable-chosen.sortable-ghost > *').first().trigger("drop");
    responseElem().find('.examma-ray-fitb-drop-location').eq(4).contains("for(int");

    // should be one additional drag location
    responseElem().find('.examma-ray-fitb-drop-location').should("have.length", 7);

    responseElem().find('.examma-ray-fitb-drop-bank [data-examma-ray-fitb-drop-id="item2"]').trigger("pointerdown", {button: 0});
    responseElem().find('.sortable-chosen').trigger("dragstart");
    cy.wait(100);
    responseElem().find('.examma-ray-fitb-drop-location').eq(5).trigger("dragenter");
    responseElem().find('.sortable-chosen.sortable-ghost > *').first().trigger("drop");
    responseElem().find('.examma-ray-fitb-drop-location').eq(4).contains("item-test-2");
    responseElem().find('.examma-ray-fitb-drop-location').eq(5).contains("item-test-2");

    // bank and originals should be unchanged
    checkOriginals();
    checkBank();
    
  });

  

  it('Modify Blanks', () => {

    responseElem().find('.examma-ray-fitb-blank-input').eq(2).type("!");
    responseElem().find('.examma-ray-fitb-blank-input').eq(2).should("have.value", "starter-blank!");

    responseElem().find('.examma-ray-fitb-blank-input').eq(2).clear().type("new text");
    responseElem().find('.examma-ray-fitb-blank-input').eq(2).should("have.value", "new text");
    
  });

  
  it('Respect Maxlength on Blanks', () => {

    responseElem().find('.examma-ray-fitb-blank-input').eq(2).type("123456");
    responseElem().find('.examma-ray-fitb-blank-input').eq(2).should("have.value", "starter-blank123");
    
  });

  it('Modify Boxes', () => {

    responseElem().find('.examma-ray-fitb-box-input').first().type("!");
    responseElem().find('.examma-ray-fitb-box-input').first().should("have.value", "starter\nbox!");

    responseElem().find('.examma-ray-fitb-box-input').first().clear().type("new text");
    responseElem().find('.examma-ray-fitb-box-input').first().should("have.value", "new text");
    
  });

  it("Restores From Local Storage", () => {

    // Make a change so that autosave will modify local storage

    responseElem().find('.examma-ray-fitb-box-input').first().type("!");

    // Wait for autosave
    cy.wait(7000);
    cy.getLocalStorage("full_test_exam-test-test-full_test_exam").should("not.be.null");

    // Compare current state of response element to state after page reload
    responseElem().then((original) => {
      cy.reload();
      unstickSectionHeadings();
      
      cy.get("#exam-welcome-restored-modal button").click();
      cy.get("#exam-welcome-restored-modal button").should("not.be.visible");
  
      cy.getLocalStorage("full_test_exam-test-test-full_test_exam").should("not.be.null");
      
      responseElem().should((restored) => restored.html().trim() === original.html().trim());
    })
    
  });

  it("Downloads to Answers File", () => {

    let filepath = downloadAnswersFile("test-answers.json");

    cy.readFile(filepath, { timeout: 10000 }).should(json => {
      expect(json).to.containSubset(expected_download);
    });
    
  });

  it("Download + Restore from Answers File", () => {

    // Make a change to the answer - edit input blank
    responseElem().find('.examma-ray-fitb-blank-input').eq(2).type("!");

    // Make a change to the answer - drag/drop
    responseElem().find('.examma-ray-fitb-drop-bank [data-examma-ray-fitb-drop-id="item2"]').trigger("pointerdown", {button: 0});
    responseElem().find('.sortable-chosen').trigger("dragstart");
    cy.wait(100);
    responseElem().find('.examma-ray-fitb-drop-location').last().trigger("dragenter");
    responseElem().find('.sortable-chosen.sortable-ghost > *').first().trigger("drop");
    responseElem().find('.examma-ray-fitb-drop-location').last().contains("item-test-2");
    
    // Compare current state of response element to state after clearing local storage, reloading page, uploading exam.
    responseElem().then((original) => {
      
      const filename = "test-answers.json";
      const filepath = downloadAnswersFile(filename);

      loadFreshPage();
  
      // sanity check no local storage
      cy.getLocalStorage("full_test_exam-test-test-full_test_exam").should("be.null");

      cy.readFile(filepath, { timeout: 10000 }).then(json => {

        uploadAnswersFile({
          fileName: filename,
          fileContent: json,
          encoding: "utf8",
        });

        responseElem().should((restored) => restored.html().trim() === original.html().trim());
      });

    });
    
  });

})