import showdown from 'showdown';
import showdownKatex from 'showdown-katex';
import showdownHighlight from 'showdown-highlight';
import hljs from 'highlight.js'
import { ExamComponentSkin } from './skins';
import { assertFalse } from './util';
import * as Handlebars from "handlebars";

const converter = new showdown.Converter({
  tables: true,
  emoji: true,
  extensions: [
    showdownKatex(),
    showdownHighlight(),
    {
      // https://github.com/showdownjs/showdown/issues/310#issuecomment-539821063
      type: 'output',
      filter: (html) => {
        const regex = /<table>/g;
        return html.replace(regex, '<table class="table table-bordered w-auto">');
      },
    }
  ]
});

export function mk2html(mk: string, skin?: ExamComponentSkin) {
  // console.log("rendering mk"); // useful for debugging repeated (i.e. non-cached) mk renders
  if (skin) {
    mk = applySkin(mk, skin);
  }
  return converter.makeHtml(mk);
}

export function mk2html_unwrapped(mk: string, skin?: ExamComponentSkin) {
  let html = mk2html(mk, skin);
  return html.startsWith("<p>") && html.endsWith("</p>")
    ? html.slice(3, -4)
    : html;
}

export function applySkin(text: string, skin: ExamComponentSkin | undefined) {
  if (!skin) {
    return text;
  }

  let template = Handlebars.compile(text, { strict: true, noEscape: true });
  try {
    return template(skin.replacements);
  }
  catch (e: any) {
    assertFalse("Error applying skin: " + e.message + " within :\n" + JSON.stringify(skin));
  }
}

export function highlightCode(text: string, language: string) {
  return hljs.highlight(language, text).value;
}