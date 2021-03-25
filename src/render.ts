import showdown from 'showdown';
import showdownKatex from 'showdown-katex';
import showdownHighlight from 'showdown-highlight';

const converter = new showdown.Converter({
  extensions: [
    showdownKatex(),
    showdownHighlight()
  ]
});

export function mk2html(mk: string) {
  return converter.makeHtml(mk);
}