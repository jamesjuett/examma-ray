import showdown from 'showdown';
import showdownKatex from 'showdown-katex';
import showdownHighlight from 'showdown-highlight';
import Mustache from 'mustache';
import hljs from 'highlight.js'
import { QuestionSkin } from './skins';

const converter = new showdown.Converter({
  extensions: [
    showdownKatex(),
    showdownHighlight()
  ]
});

export function mk2html(mk: string, skin?: QuestionSkin) {
  if (skin) {
    mk = Mustache.render(mk, skin.replacements);
  }
  return converter.makeHtml(mk);
}

export function applySkin(text: string, skin: QuestionSkin | undefined) {
  return skin ? Mustache.render(text, skin.replacements) : text;
}

export function highlightCode(text: string, language: string) {
  return hljs.highlight(language, text).value;
}