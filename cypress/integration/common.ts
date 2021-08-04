
import path from "path";

export function clearDownloads() {
  cy.task('deleteFolder', Cypress.config("downloadsFolder"));
}

export function downloadAnswersFile(filename: string) {

  cy.get(".examma-ray-exam-answers-file-button").click();

  cy.get("#exam-saver").should("be.visible");

  cy.get("#exam-saver-download-link").click();

  return path.join(Cypress.config('downloadsFolder'), filename);

}

export function uploadAnswersFile(filename: string) {

  cy.get(".examma-ray-exam-answers-file-button").click();

  cy.get("#exam-saver").should("be.visible");

  cy.get("#exam-saver-file-input").attachFile(filename);

  return cy.get("#exam-saver-load-button").click();

}