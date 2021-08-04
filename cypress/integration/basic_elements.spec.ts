

describe('Basic Page Elements', () => {

  const EXAM_URL = "simple_test/exams/test-test-simple_test.html";
  
  beforeEach(() => {
    cy.clearLocalStorage();

    cy.visit(EXAM_URL);

    cy.get("#exam-welcome-normal-modal button").click();

    cy.get("#exam-welcome-normal-modal button").should("not.be.visible");
  });

  it('Answers File Button', () => {

    cy.get(".examma-ray-exam-answers-file-button").click();

    cy.get("#exam-saver").should("be.visible");

  });

  it('Timer', () => {

    cy.get("#examma-ray-time-elapsed").should("be.visible");

    cy.get("#examma-ray-time-elapsed").contains("0h 0m 2s");
    cy.get("#examma-ray-time-elapsed").contains("0h 0m 3s");

  });

  it('Header', () => {

    cy.get(".examma-ray-header").contains("Simple Test Exam"); // exam title
    cy.get(".examma-ray-header").contains("Test Student"); // student name
    cy.get(".examma-ray-header").contains("test"); // student uniqname

  });

  it('Instructions', () => {

    cy.get(".examma-ray-instructions").contains("[Instructions]");

  });

  it('Bottom Message', () => {

    cy.get(".examma-ray-bottom-message").contains("[Bottom Message]");

  });

})