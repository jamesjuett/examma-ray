describe('Welcome Modals', () => {

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('Shows the normal welcome modal', () => {

    cy.visit('test-test-simple_test.html');

    cy.get("#exam-welcome-normal-modal button").click();

    cy.get("#exam-welcome-normal-modal button").should("not.be.visible");

  });

  it('Shows the disabled local storage modal', () => {

    cy.disableLocalStorage({
      withError: new Error("Local storage disabled for test.")
    });
    cy.visit('test-test-simple_test.html');

    cy.get("#exam-welcome-no-autosave-modal button").click();

    cy.get("#exam-welcome-no-autosave-modal button").should("not.be.visible");

  });

  it('Shows the answers restored modal', () => {

    cy.visit('test-test-simple_test.html');

    cy.get("#exam-welcome-normal-modal button").click();

    cy.get("#exam-welcome-normal-modal button").should("not.be.visible");

    // Make a change so that autosave will modify local storage
    cy.get("input[type=radio]").first().click();

    // Wait for autosave
    cy.wait(7000);
    cy.getLocalStorage("simple_test-test-test-simple_test").should("not.be.null");

    cy.reload();
    
    cy.get("#exam-welcome-restored-modal button").click();

    cy.get("#exam-welcome-restored-modal button").should("not.be.visible");;
    cy.getLocalStorage("simple_test-test-test-simple_test").should("not.be.null");
    
  });
})