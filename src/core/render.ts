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

const mk_cache = new Map<string, string>();
const skinned_mk_cache = new Map<string, Map<string, string>>();

// function renderMarkdown() {
  
// }

export function mk2html(mk: string, skin?: ExamComponentSkin) {
  // console.log("rendering mk"); // useful for debugging repeated (i.e. non-cached) mk renders
  if (skin) {
    return mk2html_with_skin(mk, skin);
  }
  else {
    if (mk_cache.has(mk)) {
      return mk_cache.get(mk)!;
    }

    let rendered = runSubRenderers(converter.makeHtml(mk));
    mk_cache.set(mk, rendered);
    return rendered;
  }
}

function mk2html_with_skin(mk: string, skin: ExamComponentSkin) {
  // console.log("rendering mk"); // useful for debugging repeated (i.e. non-cached) mk renders
  if (!skinned_mk_cache.has(skin.skin_id)) {
    skinned_mk_cache.set(skin.skin_id, new Map<string,string>());
  }

  let cache_for_this_skin = skinned_mk_cache.get(skin.skin_id)!;
  if (cache_for_this_skin.has(mk)) {
    return cache_for_this_skin.get(mk)!;
  }

  let rendered = runSubRenderers(converter.makeHtml(applySkin(mk, skin)), skin);
  cache_for_this_skin.set(mk, rendered);
  return rendered;
}

export function mk2html_unwrapped(mk: string, skin?: ExamComponentSkin) {
  let html = mk2html(mk, skin);
  return html.startsWith("<p>") && html.endsWith("</p>")
    ? html.slice(3, -4)
    : html;
}

export function mk2html_rewrapped(mk: string, tag: string, skin?: ExamComponentSkin) {
  return `<${tag}>${mk2html_unwrapped(mk, skin)}</${tag}>`; 
}

export function applySkin(text: string, skin: ExamComponentSkin | undefined) {
  if (!skin) {
    return text;
  }

  let template = Handlebars.compile(text, { strict: true, noEscape: true });
  try {
    return template(Object.assign({skin_id: skin.skin_id}, skin.replacements));
  }
  catch (e: any) {
    assertFalse("Error applying skin: " + e.message + " within :\n" + JSON.stringify(skin));
  }
}

export function highlightCode(text: string, language: string) {
  return hljs.highlight(language, text).value;
}

type SubRenderer = (skin?: ExamComponentSkin) => string;
const SUB_RENDERER_PLACEHOLDER = "wiuglanadghxnwngslsehshd";
const SUB_RENDERER_PLACEHOLDER_REGEX = new RegExp(SUB_RENDERER_PLACEHOLDER + "([0-9]+)", "g");
const SUB_RENDERERS : SubRenderer[] = [];
let current_sub_renderer = 0;

export function createSubRenderer(subRenderer: SubRenderer) {
  SUB_RENDERERS.push(subRenderer);
  return " " + SUB_RENDERER_PLACEHOLDER + (current_sub_renderer++) + " ";
}

function runSubRenderers(mk: string, skin?: ExamComponentSkin) {
  return mk.replace(SUB_RENDERER_PLACEHOLDER_REGEX, (match, index) => {
    return SUB_RENDERERS[parseInt(index)](skin);
  });
}