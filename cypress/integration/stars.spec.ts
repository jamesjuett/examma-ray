
describe('Question Stars', () => {
  const EXAM_URL = "multi_section_test_exam/exams/test-test-multi_section_test_exam.html";

  beforeEach(() => {
    cy.clearLocalStorage();

    cy.visit(EXAM_URL);

    cy.get("#exam-welcome-normal-modal button").click();

    cy.get("#exam-welcome-normal-modal button").should("not.be.visible");
  });

  it('Question Star Button Updates Outline', () => {
    // question in outline should be hidden
    cy.get("#starred-question-test-multi_section_test_exam-q-test_question_mc_single_1 .examma-ray-question-star").should("not.be.visible");

    // toggle on
    cy.get("#question-test-multi_section_test_exam-q-test_question_mc_single_1 .examma-ray-question-star").click({force: true});
    cy.get("#question-test-multi_section_test_exam-q-test_question_mc_single_1 .examma-ray-question-star").should("have.class", "examma-ray-question-star-marked");
    cy.get("#starred-question-test-multi_section_test_exam-q-test_question_mc_single_1 .examma-ray-question-star").should("be.visible");
    cy.get("#starred-question-test-multi_section_test_exam-q-test_question_mc_single_1 .examma-ray-question-star").should("have.class", "examma-ray-question-star-marked");

    // toggle off (from outline)
    cy.get("#starred-question-test-multi_section_test_exam-q-test_question_mc_single_1 .examma-ray-question-star").click({force: true});
    cy.get("#question-test-multi_section_test_exam-q-test_question_mc_single_1 .examma-ray-question-star").should("not.have.class", "examma-ray-question-star-marked");
    cy.get("#starred-question-test-multi_section_test_exam-q-test_question_mc_single_1 .examma-ray-question-star").should("not.be.visible");
    cy.get("#starred-question-test-multi_section_test_exam-q-test_question_mc_single_1 .examma-ray-question-star").should("not.have.class", "examma-ray-question-star-marked");
  })
})
