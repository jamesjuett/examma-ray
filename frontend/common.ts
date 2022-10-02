import "highlight.js/styles/github.css";
import 'katex/dist/katex.min.css';
import "./frontend.css";

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import './codemirror-modes';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/keymap/sublime.js';
import { decode } from "he";

import { activateBank } from "../src/response/fitb-drop";
import { ResponseKind } from "../src/response/common";
import { activate_response } from '../src/response/responses';

export function activateExamComponents() {
  // Active section reference width slider
  $(".examma-ray-section-reference-width-slider").on("input", function() {
    let column = $(this).closest(".examma-ray-section-reference-column");
    let newWidth = $(this).val() + "%";
    column.css("width", newWidth);
    column.find(".examma-ray-section-reference-width-value").html(newWidth);
  });
}

function activateResponse(this: HTMLElement) {
  let response = $(this);
  activate_response(<ResponseKind>response.data("response-kind"), false, response);
}

export function activateExam() {

  // Activate any FITB Drop banks in reference material
  $(".examma-ray-section-reference .examma-ray-fitb-drop-bank").each(function() {
    let bank = $(this);
    let group_id = bank.data("examma-ray-fitb-drop-group-id")
    activateBank(bank, group_id);
  });

  $(".examma-ray-question-response").map(activateResponse).get()
}

export function setupCodeEditors(onChange: () => void) {
  // Set up code editor and CodeMirror instances
  let codeMirrors : CodeMirror.Editor[] = [];
  $(".examma-ray-code-editor").each(function() {

    let cmElem = $(this).find(".examma-ray-codemirror");
    let starterCode = decode(cmElem.html());
    let mime_type = cmElem.data("codemirror-mime-type");
    cmElem.html("");
    let cm = CodeMirror(cmElem[0], {
      mode: mime_type,
      theme: "default",
      lineNumbers: false,
      tabSize: 2,
      keyMap: "sublime",
      extraKeys: {
          "Ctrl-/" : (editor) => editor.execCommand('toggleComment')
      },
      value: starterCode
    });
    codeMirrors.push(cm);
    cm.on("change", onChange);

    cmElem.data("examma-ray-codemirror", cm);
  });

  $(".examma-ray-theme-button").on("click", function() {
    $(".examma-ray-theme-button").removeClass("active");
    $(`.examma-ray-theme-button[data-codemirror-theme="${$(this).data("codemirror-theme")}"]`).addClass("active");
    codeMirrors.forEach(cm => cm.setOption("theme", $(this).data("codemirror-theme")));
  })
}