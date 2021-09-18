
import path from "path";


export function responseElem(question_uuid: string) {
  return cy.get(`*[data-question-uuid="${question_uuid}"] .examma-ray-question-response`);
}

export function clearDownloads() {
  cy.task('deleteFolder', Cypress.config("downloadsFolder"));
}

export function downloadAnswersFile(filename: string) {

  cy.get(".examma-ray-exam-answers-file-button").click();

  cy.get("#exam-saver").should("be.visible");

  cy.get("#exam-saver-download-link").click();

  return path.join(Cypress.config('downloadsFolder'), filename);

}

export function uploadAnswersFile(file: string | Cypress.FixtureData) {

  cy.get(".examma-ray-exam-answers-file-button").click();

  cy.get("#exam-saver").should("be.visible");

  cy.get("#exam-saver-file-input").attachFile(file);

  return cy.get("#exam-saver-load-button").click();

}

export function unstickSectionHeadings() {
  // Cypress will complain about the section headings overlapping page elements
  // we want to interact with due to the use of "sticky" on section headings.
  // (The elements are in fact overlapped by the headings, but if a real person
  // were using the site, they would need to scroll to see the element and then
  // they would not be covered by the section heading.)
  // Our fix is just to unstick the section headings so that they don't follow
  // when you scroll through the section.
  cy.get(".examma-ray-section-heading").then(jq => jq.css("sticky", "unset").css("-webkit-sticky", "unset").css("top", "unset"));
}