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

function singleResponseElem() {
  return cy.get('#question-test-full_test_exam-q-test_question_mc_single .examma-ray-question-response.examma-ray-question-response-multiple_choice[data-response-kind="multiple_choice"]');
}

function multipleResponseElem() {
  return cy.get('#question-test-full_test_exam-q-test_question_mc_multiple .examma-ray-question-response.examma-ray-question-response-multiple_choice[data-response-kind="multiple_choice"]');
}

function multipleResponseLimitElem() {
  return cy.get('#question-test-full_test_exam-q-test_question_mc_multiple_limit_3 .examma-ray-question-response.examma-ray-question-response-multiple_choice[data-response-kind="multiple_choice"]');
}

describe('MC Response', () => {

  const choices_text = ["Choice A", "Choice B", "Choice C", "Choice D", "Choice E"];
  
  beforeEach(() => {

    clearDownloads();
    loadFreshPage();

  });

  it('Response Element', () => {

    singleResponseElem().should("be.visible");
    multipleResponseElem().should("be.visible");
    multipleResponseLimitElem().should("be.visible");

  });

  it('Render Single Choice Radio Inputs', () => {

    singleResponseElem().find('input[type=radio]').should("have.length", 5);
    singleResponseElem().find('input[type=radio]').each((jq, i) => {
      expect(jq.attr("id")).to.equal(`test-full_test_exam-q-test_question_mc_single_choice_${i}`);
      expect(jq.attr("name")).to.equal("test-full_test_exam-q-test_question_mc_single_choice");
      expect(jq.attr("value")).to.equal(`${i}`);
    });

  });

  it('Render Single Choice Labels', () => {
    singleResponseElem().find('label.examma-ray-mc-option').should("have.length", 5);
    singleResponseElem().find('label.examma-ray-mc-option').each((jq, i) => {
      expect(jq.attr("for")).to.equal(`test-full_test_exam-q-test_question_mc_single_choice_${i}`);
      expect(jq.html()).to.contain(choices_text[i]);
    });

  });

  it('Render Multiple Choice Radio Inputs', () => {

    multipleResponseElem().find('input[type=checkbox]').should("have.length", 5);
    multipleResponseElem().find('input[type=checkbox]').each((jq, i) => {
      expect(jq.attr("id")).to.equal(`test-full_test_exam-q-test_question_mc_multiple_choice_${i}`);
      expect(jq.attr("name")).to.equal("test-full_test_exam-q-test_question_mc_multiple_choice");
      expect(jq.attr("value")).to.equal(`${i}`);
    });
  });

  it('Render Multiple Choice Labels', () => {
    singleResponseElem().find('label.examma-ray-mc-option').should("have.length", 5);
    singleResponseElem().find('label.examma-ray-mc-option').each((jq, i) => {
      expect(jq.attr("for")).to.equal(`test-full_test_exam-q-test_question_mc_single_choice_${i}`);
      expect(jq.html()).to.contain(choices_text[i]);
    });

  });

  it('Select With Mouse (Single)', () => {

    singleResponseElem().find('input[type=radio]:checked')
      .should("have.length", 0);

    [0,1,2,3,4].forEach(i => {
      singleResponseElem().find('input[type=radio]').eq(i).click();
      singleResponseElem().find('input[type=radio]:checked').siblings("label")
        .should("have.length", 1)
        .should("contain", choices_text[i]);
    });

  });
  

  it('Select With Mouse via Label (Single)', () => {

    singleResponseElem().find('input[type=radio]:checked')
      .should("have.length", 0);

    [0,1,2,3,4].forEach(i => {
      singleResponseElem().find('label').eq(i).click();
      singleResponseElem().find('input[type=radio]:checked').siblings("label")
        .should("have.length", 1)
        .should("contain", choices_text[i]);
    });

  });

  it('Select With Mouse (Multiple)', () => {

    multipleResponseElem().find('input[type=checkbox]:checked')
      .should("have.length", 0);

    // click all
    let totalClicked = 0;
    [0,1,2,3,4].forEach(i => {
      multipleResponseElem().find('input[type=checkbox]').eq(i).click();
      multipleResponseElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", ++totalClicked)
        .should("contain", choices_text[i]);
    });

    // unclick all
    [4, 3, 2, 1].forEach(i => {
      multipleResponseElem().find('input[type=checkbox]').eq(i).click();
      multipleResponseElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", --totalClicked)
        .should("not.contain", choices_text[i]);
    });

    // uncheck last one
    multipleResponseElem().find('input[type=checkbox]').eq(0).click();
    multipleResponseElem().find('input[type=checkbox]:checked').should("not.exist");

  });
  

  it('Select With Mouse via Label (Multiple)', () => {

    multipleResponseElem().find('input[type=checkbox]:checked')
      .should("have.length", 0);

    // click all
    let totalClicked = 0;
    [0,1,2,3,4].forEach(i => {
      multipleResponseElem().find('label').eq(i).click();
      multipleResponseElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", ++totalClicked)
        .contains(choices_text[i]);
    });

    // unclick all but last
    [4, 3, 2, 1].forEach(i => {
      multipleResponseElem().find('label').eq(i).click();
      multipleResponseElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", --totalClicked)
        .should("not.contain", choices_text[i]);
    });

    // uncheck last one
    multipleResponseElem().find('label').eq(0).click();
    multipleResponseElem().find('input[type=checkbox]:checked').should("not.exist");

  });

  

  it('Respect Checkbox Limit', () => {

    const LIMIT = 2;

    multipleResponseLimitElem().find('input[type=checkbox]:checked')
      .should("have.length", 0);
      
    multipleResponseLimitElem().find('input[type=checkbox]').should("be.enabled");

    // click all
    let totalClicked = 0;
    multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);

    [0,1,2].forEach(i => {
      multipleResponseLimitElem().find('input[type=checkbox]').eq(i).click();
      multipleResponseLimitElem().find('input[type=checkbox]').should("be.enabled");
      multipleResponseLimitElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", ++totalClicked)
        .should("contain", choices_text[i]);
      multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);
    });

    multipleResponseLimitElem().find('input[type=checkbox]:checked').should("be.enabled");
    multipleResponseLimitElem().find('input[type=checkbox]:not(:checked)').should("be.disabled");

    // inputs from other questions should not be disabled
    singleResponseElem().find('input').should("be.enabled");
    multipleResponseElem().find('input').should("be.enabled");

    // unclick all but one
    [2, 1].forEach(i => {
      multipleResponseLimitElem().find('input[type=checkbox]').eq(i).click();
      multipleResponseLimitElem().find('input[type=checkbox]').should("be.enabled");
      multipleResponseLimitElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", --totalClicked)
        .should("not.contain", choices_text[i]);
      multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);
    });

    // click some more
    [3, 4].forEach(i => {
      multipleResponseLimitElem().find('input[type=checkbox]').eq(i).click();
      multipleResponseLimitElem().find('input[type=checkbox]').should("be.enabled");
      multipleResponseLimitElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", ++totalClicked)
        .should("contain", choices_text[i]);
      multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);
    });

    multipleResponseLimitElem().find('input[type=checkbox]:checked').should("be.enabled");
    multipleResponseLimitElem().find('input[type=checkbox]:not(:checked)').should("be.disabled");

    // unclick all but one
    [4, 3].forEach(i => {
      multipleResponseLimitElem().find('input[type=checkbox]').eq(i).click();
      multipleResponseLimitElem().find('input[type=checkbox]').should("be.enabled");
      multipleResponseLimitElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", --totalClicked)
        .should("not.contain", choices_text[i]);
      multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);
    });

    // uncheck last one
    multipleResponseLimitElem().find('input[type=checkbox]').eq(0).click();
    multipleResponseLimitElem().find('input[type=checkbox]:checked').should("not.exist");
    --totalClicked;
    
    multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);

  });

  it('Respect Checkbox Limit via Label', () => {

    const LIMIT = 2;

    multipleResponseLimitElem().find('input[type=checkbox]:checked')
      .should("have.length", 0);
      
    multipleResponseLimitElem().find('input[type=checkbox]').should("be.enabled");

    // click all
    let totalClicked = 0;
    multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);

    [0,1,2].forEach(i => {
      multipleResponseLimitElem().find('label').eq(i).click();
      multipleResponseLimitElem().find('input[type=checkbox]').should("be.enabled");
      multipleResponseLimitElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", ++totalClicked)
        .should("contain", choices_text[i]);
      multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);
    });

    multipleResponseLimitElem().find('input[type=checkbox]:checked').should("be.enabled");
    multipleResponseLimitElem().find('input[type=checkbox]:not(:checked)').should("be.disabled");

    // unclick all but one
    [2, 1].forEach(i => {
      multipleResponseLimitElem().find('label').eq(i).click();
      multipleResponseLimitElem().find('input[type=checkbox]').should("be.enabled");
      multipleResponseLimitElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", --totalClicked)
        .should("not.contain", choices_text[i]);
      multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);
    });

    // click some more
    [3, 4].forEach(i => {
      multipleResponseLimitElem().find('label').eq(i).click();
      multipleResponseLimitElem().find('input[type=checkbox]').should("be.enabled");
      multipleResponseLimitElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", ++totalClicked)
        .should("contain", choices_text[i]);
      multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);
    });

    multipleResponseLimitElem().find('input[type=checkbox]:checked').should("be.enabled");
    multipleResponseLimitElem().find('input[type=checkbox]:not(:checked)').should("be.disabled");

    // unclick all but one
    [4, 3].forEach(i => {
      multipleResponseLimitElem().find('label').eq(i).click();
      multipleResponseLimitElem().find('input[type=checkbox]').should("be.enabled");
      multipleResponseLimitElem().find('input[type=checkbox]:checked').siblings("label")
        .should("have.length", --totalClicked)
        .should("not.contain", choices_text[i]);
      multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);
    });

    // uncheck last one
    multipleResponseLimitElem().find('input[type=checkbox]').eq(0).click();
    multipleResponseLimitElem().find('input[type=checkbox]:checked').should("not.exist");
    --totalClicked;
    
    multipleResponseLimitElem().find('.examma-ray-mc-num-selected').contains(""+totalClicked);

  });

  it("Restores From Local Storage", () => {

    // Make a change so that autosave will modify local storage
    singleResponseElem().find('input').eq(0).click({force: true});
    [1,2].forEach(i => multipleResponseElem().find('input').eq(i).click({force: true}));
    [3,4].forEach(i => multipleResponseLimitElem().find('input').eq(i).click({force: true}));

    // Wait for autosave
    cy.wait(7000);
    cy.getLocalStorage("full_test_exam-test-test-full_test_exam").should("not.be.null");

    // Compare current state of response element to state after page reload
    cy.reload();
    unstickSectionHeadings();
    
    cy.get("#exam-welcome-restored-modal button").click();
    cy.get("#exam-welcome-restored-modal button").should("not.be.visible");

    cy.getLocalStorage("full_test_exam-test-test-full_test_exam").should("not.be.null");
    
    singleResponseElem().find('input').eq(0).should("be.checked");
    [1,2].forEach(i => multipleResponseElem().find('input').eq(i).should("be.checked"));
    [3,4].forEach(i => multipleResponseLimitElem().find('input').eq(i).should("be.checked"));
    
    [1,2,3,4].forEach(i => singleResponseElem().find('input').eq(i).should("not.be.checked"));
    [0,3,4].forEach(i => multipleResponseElem().find('input').eq(i).should("not.be.checked"));
    [0,1,2].forEach(i => multipleResponseLimitElem().find('input').eq(i).should("not.be.checked"));
    
  });

  it("Downloads to Answers File", () => {
    
    singleResponseElem().find('input').eq(0).click({force: true});
    multipleResponseElem().find('input').eq(1).click({force: true});
    multipleResponseElem().find('input').eq(2).click({force: true});
    multipleResponseLimitElem().find('input').eq(3).click({force: true});
    multipleResponseLimitElem().find('input').eq(4).click({force: true});

    let filepath = downloadAnswersFile("test-answers.json");

    cy.readFile(filepath, { timeout: 10000 }).should(json => {
      expect(json).to.containSubset(expected_download);
    });
    
  });

  it("Download + Restore from Answers File", () => {

    singleResponseElem().find('input').eq(0).scrollIntoView().click({force: true});
    [1,2].forEach(i => multipleResponseElem().find('input').eq(i).scrollIntoView().click({force: true}));
    [3,4].forEach(i => multipleResponseLimitElem().find('input').eq(i).scrollIntoView().click({force: true}));
    
    // Compare current state of response element to state after clearing local storage, reloading page, uploading exam.
      
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
    
      singleResponseElem().find('input').eq(0).should("be.checked");
      [1,2].forEach(i => multipleResponseElem().find('input').eq(i).should("be.checked"));
      [3,4].forEach(i => multipleResponseLimitElem().find('input').eq(i).should("be.checked"));
      
      [1,2,3,4].forEach(i => singleResponseElem().find('input').eq(i).should("not.be.checked"));
      [0,3,4].forEach(i => multipleResponseElem().find('input').eq(i).should("not.be.checked"));
      [0,1,2].forEach(i => multipleResponseLimitElem().find('input').eq(i).should("not.be.checked"));
    });

    
  });

})