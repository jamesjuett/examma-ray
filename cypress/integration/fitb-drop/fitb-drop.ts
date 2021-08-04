

function responseElem() {
  return cy.get(".examma-ray-question-response");
}

describe('FITB-Drop Response', () => {

  const EXAM_URL = "full_test_exam/exams/test-test-full_test_exam.html";
  
  beforeEach(() => {
    cy.clearLocalStorage();

    cy.visit(EXAM_URL);

    cy.get("#exam-welcome-normal-modal button").click();

    cy.get("#exam-welcome-normal-modal button").should("not.be.visible");
  });

  it('Response Element', () => {

    responseElem().should("be.visible");

    responseElem().should("have.class", "examma-ray-question-response-fitb-drop");

  });

  it('Drag/Drop', () => {

    cy.get('.examma-ray-fitb-drop-bank [data-examma-ray-fitb-drop-id="item2"]').trigger("pointerdown", {force: true, button: 0});
    cy.get('.sortable-chosen').trigger("dragstart", {force: true});
    cy.get('.examma-ray-fitb-drop-location').last().trigger("dragenter");
    cy.get('.sortable-chosen.sortable-ghost > *').first().trigger("drop");
    cy.get('.examma-ray-fitb-drop-location').last().contains("item-test-2")

  });

})