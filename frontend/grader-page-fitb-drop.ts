// import hljs from 'highlight.js/lib/core'
import { encode } from "he";
import "highlight.js/styles/github.css";

import 'katex/dist/katex.min.css';

import "./frontend.css";
import "./grader-page-fitb-drop.css";
import { activateExamContent } from "./common";
import { activateFITBDropBank } from "../src/response/fitb-drop";
import axios from "axios";
import { parseExamSpecification } from "../src/core/exam_specification";
import { Exam } from "../src/core/exam_components";

function refreshRubricFilters() {
  // find all checked rubric indices
  let checked_indices: number[] = $('.rubric-item-filter:checked').map(function() {
    return $(this).data("rubric-index");
  }).get();

  // show all badges matching this rubric index, hide all others
  $(".rubric-result").hide();
  checked_indices.forEach(i => {
    $(`.rubric-result-${i}`).show();
  });
}

$(async function() {
  activateExamContent();
  $(".examma-ray-fitb-grader-drop-bank .examma-ray-fitb-drop-bank").each(function() {
      let bank = $(this);
      let group_id = bank.data("examma-ray-fitb-drop-group-id")
      activateFITBDropBank(bank, group_id);
    });
  refreshRubricFilters();
  $('.rubric-item-filter').on("change", refreshRubricFilters);

  const exam_spec_response = await axios({
    url: `../spec/exam-spec.json`,
    method: "GET",
    data: {},
    responseType: "text",
    transformResponse: [v => v] // Avoid default transformation that attempts JSON parsing (so we can parse our special way below)
  });
  const exam_spec = parseExamSpecification(exam_spec_response.data);

  const exam = Exam.create(exam_spec);
  alert(exam.exam_id);
});