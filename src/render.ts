import showdown from 'showdown';
import showdownKatex from 'showdown-katex';
import showdownHighlight from 'showdown-highlight';
import hljs from 'highlight.js'
import { QuestionSkin } from './skins';
import { assert, assertFalse } from './util';
import * as Handlebars from "handlebars";

const converter = new showdown.Converter({
  tables: true,
  emoji: true,
  extensions: [
    showdownKatex(),
    showdownHighlight()
  ]
});

export function mk2html(mk: string, skin?: QuestionSkin) {
  if (skin) {
    mk = applySkin(mk, skin);
  }
  return converter.makeHtml(mk);
}

export function applySkin(text: string, skin: QuestionSkin | undefined) {
  if (!skin) {
    return text;
  }

  let template = Handlebars.compile(text, { strict: true, noEscape: true });
  try {
    return template(skin.replacements);
  }
  catch (e) {
    assertFalse("Error applying skin: " + e.message + " within :\n" + JSON.stringify(skin));
  }
}

export function highlightCode(text: string, language: string) {
  return hljs.highlight(language, text).value;
}