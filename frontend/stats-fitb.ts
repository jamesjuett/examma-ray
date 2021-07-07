// import hljs from 'highlight.js/lib/core'
import { encode } from "he";
import "highlight.js/styles/github.css";

import 'katex/dist/katex.min.css';

import "./frontend.css";


$(function() {
  $('button.examma-ray-blank-saver').on("click", function() {
    let blank_num = $(this).data("blank-num");
    let checked = $("input[type=checkbox]:checked").filter(function() {
      return $(this).data("blank-num") === blank_num;
    }).map(function() {
      return '"'+
        $(this).data("blank-submission")
          .replace(/\"/g,'\\"')
          .replace(/\n/g,'\\n')
        +'"';
    }).get().join(",\n");
    $(".checked-submissions-content").html(encode(checked));
    $(".checked-submissions-modal").modal("show")
  })
});