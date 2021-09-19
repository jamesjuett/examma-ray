import { sectionElem } from "./common";


describe('Reference Material', () => {

  const EXAM_URL = "multi_section_test_exam/exams/test-test-multi_section_test_exam.html";
  
  beforeEach(() => {
    cy.clearLocalStorage();

    cy.visit(EXAM_URL);

    cy.get("#exam-welcome-normal-modal button").click();

    cy.get("#exam-welcome-normal-modal button").should("not.be.visible");
  });

  it('Reference Material Present For Sections 1, 2, 3', () => {

    sectionElem("test-multi_section_test_exam-s-section1").find(".examma-ray-section-reference").contains("[Section Reference 1]");
    sectionElem("test-multi_section_test_exam-s-section2").find(".examma-ray-section-reference").contains("[Section Reference 2]");
    sectionElem("test-multi_section_test_exam-s-section3").find(".examma-ray-section-reference").contains("[Section Reference 3]");

  });

  it('Reference Headers Present For Sections 1, 2, 3', () => {

    sectionElem("test-multi_section_test_exam-s-section1").find(".examma-ray-section-reference h6").contains("Reference Material (Section 1)");
    sectionElem("test-multi_section_test_exam-s-section2").find(".examma-ray-section-reference h6").contains("Reference Material (Section 2)");
    sectionElem("test-multi_section_test_exam-s-section3").find(".examma-ray-section-reference h6").contains("Reference Material (Section 3)");

  });

  it('Initial Reference Width', () => {

    // Check actual css widths
    sectionElem("test-multi_section_test_exam-s-section1").find(".examma-ray-section-reference-column").should((jq) => {
      expect(jq[0].style.getPropertyValue("width")).to.equal("20%")
    });
    sectionElem("test-multi_section_test_exam-s-section2").find(".examma-ray-section-reference-column").should((jq) => {
      expect(jq[0].style.getPropertyValue("width")).to.equal("40%")
    });
    sectionElem("test-multi_section_test_exam-s-section3").find(".examma-ray-section-reference-column").should((jq) => {
      expect(jq[0].style.getPropertyValue("width")).to.equal("60%")
    });

  });

  it('Resize Reference Width', () => {
    checkResize("test-multi_section_test_exam-s-section1", 10);
    checkResize("test-multi_section_test_exam-s-section1", 20);
    checkResize("test-multi_section_test_exam-s-section1", 30);
    checkResize("test-multi_section_test_exam-s-section1", 50);
    checkResize("test-multi_section_test_exam-s-section1", 90);
    checkResize("test-multi_section_test_exam-s-section1", 40);
    
    checkResize("test-multi_section_test_exam-s-section2", 10);
    checkResize("test-multi_section_test_exam-s-section2", 20);
    checkResize("test-multi_section_test_exam-s-section2", 30);
    checkResize("test-multi_section_test_exam-s-section2", 50);
    checkResize("test-multi_section_test_exam-s-section2", 90);
    checkResize("test-multi_section_test_exam-s-section2", 40);
    
    checkResize("test-multi_section_test_exam-s-section3", 10);
    checkResize("test-multi_section_test_exam-s-section3", 20);
    checkResize("test-multi_section_test_exam-s-section3", 30);
    checkResize("test-multi_section_test_exam-s-section3", 50);
    checkResize("test-multi_section_test_exam-s-section3", 90);
    checkResize("test-multi_section_test_exam-s-section3", 40);
  });


});

function checkResize(section_uuid: string, value: number) {

  // Resize section to given %
  sectionElem(section_uuid)
    .find(".examma-ray-section-reference-column .examma-ray-section-reference-width-slider")
    .invoke("val", value)
    .trigger("input");

  // check css style
  sectionElem(section_uuid).find(".examma-ray-section-reference-column").should((jq) => {
    expect(jq[0].style.getPropertyValue("width")).to.equal(value + "%")
  });

  // check test shown
  sectionElem(section_uuid).find(".examma-ray-section-reference-column .examma-ray-section-reference-width-value").contains(value + "%")

}