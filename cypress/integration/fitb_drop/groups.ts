import { clearDownloads, downloadAnswersFile, responseElem, unstickSectionHeadings, uploadAnswersFile } from "../common";
import expected from "./expected_download.json";

import chaiSubset from "chai-subset";
chai.use(chaiSubset);

function loadFreshPage() {

  const EXAM_URL = "fitb-drop-multiple/exams/test-test-fitb-drop-multiple.html";
  
  cy.clearLocalStorage();

  cy.visit(EXAM_URL);
  unstickSectionHeadings();

  cy.get("#exam-welcome-normal-modal button").click();

  cy.get("#exam-welcome-normal-modal button").should("not.be.visible");

}

describe('FITB-Drop Response Groups', () => {
  
  beforeEach(() => {

    clearDownloads();
    loadFreshPage();

  });

  it('Drag/Drop Within Q1', () => {

    responseElem("test-fitb-drop-multiple-q-fitb_drop_test_1").find('.examma-ray-fitb-drop-bank [data-examma-ray-fitb-drop-id="item2"]').trigger("pointerdown", {button: 0});
    responseElem("test-fitb-drop-multiple-q-fitb_drop_test_1").find('.sortable-chosen').trigger("dragstart");
    cy.wait(100);
    responseElem("test-fitb-drop-multiple-q-fitb_drop_test_1").find('.examma-ray-fitb-drop-location').last().trigger("dragenter");
    responseElem("test-fitb-drop-multiple-q-fitb_drop_test_1").find('.sortable-chosen.sortable-ghost > *').first().trigger("drop");
    responseElem("test-fitb-drop-multiple-q-fitb_drop_test_1").find('.examma-ray-fitb-drop-location').last().contains("item-test-2");

  });

  it('Drag/Drop Prohibited From Q1 to Q2', () => {

    responseElem("test-fitb-drop-multiple-q-fitb_drop_test_1").find('.examma-ray-fitb-drop-bank [data-examma-ray-fitb-drop-id="item2"]').trigger("pointerdown", {button: 0});
    responseElem("test-fitb-drop-multiple-q-fitb_drop_test_1").find('.sortable-chosen').trigger("dragstart");
    cy.wait(100);
    responseElem("test-fitb-drop-multiple-q-fitb_drop_test_2").find('.examma-ray-fitb-drop-location').last().trigger("dragenter");
    responseElem("test-fitb-drop-multiple-q-fitb_drop_test_1").find('.sortable-chosen.sortable-ghost > *').first().trigger("drop");
    responseElem("test-fitb-drop-multiple-q-fitb_drop_test_2").find('.examma-ray-fitb-drop-location').last().contains("item-test-2").should("not.exist");;

  });


})