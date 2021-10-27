import { clearDownloads, downloadAnswersFile, responseElem, unstickSectionHeadings, uploadAnswersFile } from "../common";
import expected from "./expected_download.json";

import chaiSubset from "chai-subset";
chai.use(chaiSubset);

function loadFreshPage() {

  const EXAM_URL = "fitb-drop-reference/exams/test-test-fitb-drop-reference.html";
  
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

  it('Question Banks Rendered in Reference', () => {

    cy.get('.examma-ray-section-reference .examma-ray-fitb-drop-bank[data-examma-ray-fitb-drop-group-id="fitb_drop_test_1"]');
    cy.get('.examma-ray-section-reference .examma-ray-fitb-drop-bank[data-examma-ray-fitb-drop-group-id="fitb_drop_test_2"]');
    cy.get('.examma-ray-section-reference .examma-ray-fitb-drop-bank[data-examma-ray-fitb-drop-group-id="fitb_drop_test_3"]');

  });

  it('Drag/Drop Within Q1', () => {

    responseElem("test-fitb-drop-reference-q-fitb_drop_test_1").find('.examma-ray-fitb-drop-bank *[data-examma-ray-fitb-drop-id="item2"]').scrollIntoView().trigger("pointerdown", {button: 0});
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_1").find('.sortable-chosen').scrollIntoView().trigger("dragstart");
    cy.wait(100);
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_1").find('.examma-ray-fitb-drop-location').last().scrollIntoView().trigger("dragenter");
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_1").find('.sortable-chosen.sortable-ghost > *').first().scrollIntoView().trigger("drop");
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_1").find('.examma-ray-fitb-drop-location').last().contains("item-test-2");

  });

  it('Drag/Drop Prohibited From Q1 to Q2', () => {

    responseElem("test-fitb-drop-reference-q-fitb_drop_test_1").find('.examma-ray-fitb-drop-bank *[data-examma-ray-fitb-drop-id="item2"]').scrollIntoView().trigger("pointerdown", {button: 0});
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_1").find('.sortable-chosen').scrollIntoView().trigger("dragstart");
    cy.wait(100);
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_2").find('.examma-ray-fitb-drop-location').last().scrollIntoView().trigger("dragenter");
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_1").find('.sortable-chosen.sortable-ghost > *').first().scrollIntoView().trigger("drop");
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_2").find('.examma-ray-fitb-drop-location').last().contains("item-test-2").should("not.exist");;

  });

  it('Drag/Drop From Reference Q1 Bank to Q1', () => {
    let bank = '.examma-ray-section-reference .examma-ray-fitb-drop-bank[data-examma-ray-fitb-drop-group-id="fitb_drop_test_1"]';
    cy.get(bank).find('*[data-examma-ray-fitb-drop-id="item2"]').scrollIntoView().trigger("pointerdown", {button: 0});
    cy.get(bank).find('.sortable-chosen').scrollIntoView().trigger("dragstart");
    cy.wait(100);
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_1").find('.examma-ray-fitb-drop-location').last().scrollIntoView().trigger("dragenter");
    cy.get('.sortable-chosen.sortable-ghost > *').first().scrollIntoView().trigger("drop");
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_1").find('.examma-ray-fitb-drop-location').last().contains("item-test-2");
  });

  it('Drag/Drop From Reference Q2 Bank to Q2', () => {
    let bank = '.examma-ray-section-reference .examma-ray-fitb-drop-bank[data-examma-ray-fitb-drop-group-id="fitb_drop_test_2"]';
    cy.get(bank).find('*[data-examma-ray-fitb-drop-id="item2"]').scrollIntoView().trigger("pointerdown", {button: 0});
    cy.get(bank).find('.sortable-chosen').scrollIntoView().trigger("dragstart");
    cy.wait(100);
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_2").find('.examma-ray-fitb-drop-location').last().scrollIntoView().trigger("dragenter");
    cy.get('.sortable-chosen.sortable-ghost > *').first().scrollIntoView().trigger("drop");
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_2").find('.examma-ray-fitb-drop-location').last().contains("item-test-2");
  });

  it('Drag/Drop Prohibited From Reference Q2 Bank to Q3', () => {
    let bank = '.examma-ray-section-reference .examma-ray-fitb-drop-bank[data-examma-ray-fitb-drop-group-id="fitb_drop_test_2"]';
    cy.get(bank).find('*[data-examma-ray-fitb-drop-id="item2"]').scrollIntoView().trigger("pointerdown", {button: 0});
    cy.get(bank).find('.sortable-chosen').scrollIntoView().trigger("dragstart");
    cy.wait(100);
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_3").find('.examma-ray-fitb-drop-location').last().scrollIntoView().trigger("dragenter");
    cy.get('.sortable-chosen.sortable-ghost > *').first().scrollIntoView().trigger("drop");
    responseElem("test-fitb-drop-reference-q-fitb_drop_test_3").find('.examma-ray-fitb-drop-location').last().contains("item-test-2").should("not.exist");
  });


})