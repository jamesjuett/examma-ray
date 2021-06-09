// import hljs from 'highlight.js/lib/core'
import "highlight.js/styles/github.css";

import 'katex/dist/katex.min.css';
import { ExamRegradeRequest, QuestionRegradeRequest, SectionRegradeRequest } from "../src/regrades/regrades";

import "./frontend.css";



function extractQuestionRegradeRequest(this: HTMLElement) : QuestionRegradeRequest {
  let question = $(this);
  return {
    uuid: question.data("question-uuid"),
    display_index: question.data("question-display-index"),
    marked_for_regrade: question.find(".examma-ray-regrade-checkbox").is( ":checked" ),
    regrade_request: question.find(".examma-ray-regrade-entry").val() as string
  };
}

function extractSectionRegradeRequest(this: HTMLElement) : SectionRegradeRequest {
  let section = $(this);
  return {
    uuid: section.data("section-uuid"),
    display_index: section.data("section-display-index"),
    question_requests: section.find(".examma-ray-question").map(extractQuestionRegradeRequest).get()
  }
}

const saverID = Date.now();
let saveCount = 0;

function extractExamRegradeRequest() : ExamRegradeRequest {
  let examElem = $("#examma-ray-exam");
  return {
    exam_id: examElem.data("exam-id"),
    uuid: examElem.data("exam-uuid"),
    student: {
      uniqname: examElem.data("uniqname"),
      name: examElem.data("name")
    },
    timestamp: Date.now(),
    saverId: saverID,
    section_requests: $(".examma-ray-section").map(extractSectionRegradeRequest).get()
  }
}