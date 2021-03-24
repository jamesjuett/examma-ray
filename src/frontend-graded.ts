import hljs from 'highlight.js/lib/core'
import "highlight.js/styles/github.css";
import cpp from 'highlight.js/lib/languages/cpp';
import "./main.css";

hljs.registerLanguage('cpp', cpp);
hljs.highlightAll();
