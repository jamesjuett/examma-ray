import showdown from 'showdown';
import showdownKatex from 'showdown-katex';
import showdownHighlight from 'showdown-highlight';
import hljs from 'highlight.js'
import { ExamComponentSkin } from './skins';
import { assertFalse, Branded } from './util';
import * as Handlebars from "handlebars";
import { Exam } from './exam_components';
import { expectType, TypeEqual, TypeOf } from 'ts-expect';
import exp from 'constants';
import { expect } from 'chai';


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

// export type ExamContentKind = "mk" | "skin";

declare const ExamContentBrands : {
  // readonly "exam_content" : unique symbol,
  readonly "markdown" : unique symbol,
  readonly "skin" : unique symbol,
  readonly "html" : unique symbol,
}

declare const ExamContentSymbol: unique symbol;

export type ExamContentKind = keyof typeof ExamContentBrands;

/**
 * An [[ExamContent]] is a "branded" string type that may have one or more of the following:
 * - "markdown": indicates that the string may contain markdown formatting
 * - "skin": indicates that the string may contain skin placeholders like {{placeholder}}
 * 
 * In each case, the brand indicates that the string MAY contain the content, not that it
 * necessarily does.
 * 
 * For example, consider the following:
 * 
 * ```typescript
 * 
 * // Declare an exam content string that may contain markdown and/or skin placeholders
 * let content = EXAM_CONTENT<"markdown" | "skin">("a **bold** hero named {{name}}");
 * // content has type ExamContent<"markdown" | "skin">
 * 
 * let result1 = mk2html(content, {skin_id: "example", replacements: {name: "Alice"}});
 * // result1 is now 'a <strong>bold</strong> hero named Alice' with type ExamContent<"html">
 * 
 * let result2 = mk2html(content);
 * // result2 is now 'a <strong>bold</strong> hero named {{name}}' with type ExamContent<"skin">
 * // because a skin was not applied and skin placeholders may remain
 * 
 * let result3 = applySkin(content, {skin_id: "example", replacements: {name: "Alice"}});
 * // result3 is now 'a **bold** hero named Alice' with type ExamContent<"markdown">
 * 
 * let str = "a regular string";
 * mk2html(str); // Error (a plain string is not allowed)
 * 
 * let no_markdown = EXAM_CONTENT<"skin">("only a {{placeholder}} here");
 * mk2html(no_markdown); // Error (can only apply mk2html if markdown is present)
 * 
 * // An ExamContent cannot be used directly as a string
 * let str2: string = content; // Error
 * let str3: string = `here is some content: ${content}`; // Error
 * let str4: string = "here is some content: " + content; // Error
 * 
 * // You can embed it as a string using the appropriate function:
 * 
 * 
 * ```
 */
export type ExamContent<T extends ExamContentKind = never> = 
  typeof ExamContentSymbol & { [K in typeof ExamContentBrands[T]]: void };

/**
 * Designates the input string as an [[ExamContent]] of the specified kind(s).
 * Defaults to `ExamContent<ExamContentKind>`, i.e. exam content that may contain
 * any of the supported content types (e.g. markdown, html, skin placeholders).
 */
export function EXAM_CONTENT<T extends ExamContentKind = ExamContentKind>(content: string) : ExamContent<T> {
  return content as unknown as ExamContent<T>;
}

// Type Tests for ExamContent
expectType<TypeOf<ExamContent, string>>(false); // A plain string is not allowed where an ExamContent is expected
expectType<TypeOf<string, ExamContent>>(false); // An ExamContent cannot be used directly as a string


type ExcludeContent<C extends ExamContent, U extends ExamContentKind> =
  C extends ExamContent<infer K>
    ? [U] extends [K] // wrap in tuple to prevent distribution
      ? ExamContent<Exclude<K, U>>
      : C
    : never;

type IncludeContent<C extends ExamContent, U extends ExamContentKind> =
  C extends ExamContent<infer K>
    ? [U] extends [K] // wrap in tuple to prevent distribution
      ? C
      : ExamContent<K | U>
    : never;

// Type Tests for ExcludeContent
expectType<TypeEqual<ExcludeContent<ExamContent<"markdown" | "skin">, "markdown">, ExamContent<"skin">>>(true);
expectType<TypeEqual<ExcludeContent<ExamContent<"markdown" | "skin">, "skin">, ExamContent<"markdown">>>(true);
expectType<TypeEqual<ExcludeContent<ExamContent<"skin">, "markdown">, ExamContent<"skin">>>(true);
expectType<TypeEqual<ExcludeContent<ExamContent, "markdown">, ExamContent>>(true);
expectType<TypeEqual<ExcludeContent<ExamContent<"markdown" | "skin">, "markdown" | "skin">, ExamContent>>(true);

// Type Tests for IncludeContent
expectType<TypeEqual<IncludeContent<ExamContent<"markdown">, "skin">, ExamContent<"markdown" | "skin">>>(true);
expectType<TypeEqual<IncludeContent<ExamContent<"skin">, "markdown">, ExamContent<"markdown" | "skin">>>(true);
expectType<TypeEqual<IncludeContent<ExamContent<"markdown" | "skin">, "markdown">, ExamContent<"markdown" | "skin">>>(true);
expectType<TypeEqual<IncludeContent<ExamContent, "markdown">, ExamContent<"markdown">>>(true);
expectType<TypeEqual<IncludeContent<ExamContent, "markdown" | "skin">, ExamContent<"markdown" | "skin">>>(true);


export function allow_only_html<V extends ExamContent>(content: ExamContent<"html"> extends V ? V : never) : string {
  return content as unknown as string;
}

export function allow_only_html_or_markdown<V extends ExamContent>(content: ExamContent<"html" | "markdown"> extends V ? V : never) : string {
  return content as unknown as string;
}

export function may_contain<T extends ExamContentKind>(content: ExamContent<T>) : string {
  return content as unknown as string;
}


// export function 

`some content: ${allow_only_html(EXAM_CONTENT<never>("test"))}`;
`some content: ${allow_only_html(EXAM_CONTENT<"html">("test"))}`;
`some content: ${allow_only_html(EXAM_CONTENT("test"))}`;
`some content: ${allow_only_html(EXAM_CONTENT<"markdown">("test"))}`;
`some content: ${allow_only_html(mk2html(EXAM_CONTENT<"markdown">("test")))}`;
`some content: ${allow_only_html(mk2html(EXAM_CONTENT<"markdown" | "skin">("test")))}`;
`some content: ${allow_only_html(mk2html(EXAM_CONTENT<"markdown" | "skin">("test"), {skin_id: "test", replacements: {}}))}`;
`some content: ${allow_only_html("test")}`;
console.log(z + "");
// export type SkinnableString = Branded<string, "14443758-873d-4f74-a522-8fa0e198efd4">;

// let x: Branded<string, "mk" | "skin"> = "hello" as Branded<string, "mk" | "skin">;
// let y: Branded<string, "mk"> = "world" as Branded<string, "mk">;
// x = y;
// y = x;

// let a = mk2html_rewrapped("hello", "test", 2 as any);
// let b = mk2html_rewrapped(x, "test", 2 as any);
// let c : string = b;
// c = a;

// export function mk2html<T extends ExamContent<"html" | "markdown" | "skin">>(content: T, skin: ExamComponentSkin) : IncludeContent<ExcludeContent<T, "markdown" | "skin">, "html">;
// export function mk2html<T extends ExamContent<"html" | "markdown">>(content: T) : IncludeContent<ExcludeContent<T, "markdown">, "html">;
export function mk2html<T extends ExamContent<"markdown" | "skin">>(content: T, skin: ExamComponentSkin) : IncludeContent<ExcludeContent<T, "markdown" | "skin">, "html">;
export function mk2html<T extends ExamContent<"markdown" | "skin">>(content: T, skin: undefined) : IncludeContent<ExcludeContent<T, "markdown" | "skin">, "html">;
export function mk2html<T extends ExamContent<"markdown">>(content: T) : IncludeContent<ExcludeContent<T, "markdown">, "html">;
export function mk2html(content: ExamContent, skin?: ExamComponentSkin) {
  return mk2html_impl(content as unknown as string, skin) as unknown as ExamContent;
}

export function mk2html_unwrapped<T extends ExamContent<"markdown" | "skin">>(content: T, skin?: ExamComponentSkin) : IncludeContent<ExcludeContent<T, "markdown" | "skin">, "html">;
export function mk2html_unwrapped<T extends ExamContent<"markdown">>(content: T) : IncludeContent<ExcludeContent<T, "markdown">, "html">;
export function mk2html_unwrapped(mk: ExamContent, skin?: ExamComponentSkin) {
  return mk2html_unwrapped_impl(mk as unknown as string, skin) as unknown as ExamContent;
}

export function mk2html_rewrapped<T extends ExamContent<"markdown" | "skin">>(content: T, tag: string, skin?: ExamComponentSkin) : IncludeContent<ExcludeContent<T, "markdown" | "skin">, "html">;
export function mk2html_rewrapped<T extends ExamContent<"markdown">>(content: T, tag: string) : IncludeContent<ExcludeContent<T, "markdown">, "html">;
export function mk2html_rewrapped(mk: ExamContent, tag: string, skin?: ExamComponentSkin) {
  return mk2html_rewrapped_impl(mk as unknown as string, tag, skin) as unknown as ExamContent;
}



export function applySkin<T extends ExamContent<"skin">>(content: T, skin?: ExamComponentSkin) : ExcludeContent<T, "skin"> {
  return applySkin_impl(content as unknown as string, skin) as unknown as ExcludeContent<T, "skin">;
}


export function highlightCode<V extends ExamContent>(content: ExamContent<never> extends V ? V : never, language: string) : ExamContent<"html"> {
  return highlightCode_impl(content as unknown as string, language) as unknown as ExamContent<"html">;
}

highlightCode("test", "cpp");
highlightCode(EXAM_CONTENT("test"), "cpp");
highlightCode(EXAM_CONTENT<"markdown">("test"), "cpp");
highlightCode(EXAM_CONTENT<"skin">("test"), "cpp");
highlightCode(EXAM_CONTENT<"markdown" | "skin">("test"), "cpp");
highlightCode(EXAM_CONTENT<never>("test"), "cpp");





function mk2html_impl(content: string, skin?: ExamComponentSkin) {

  // console.log("rendering mk"); // useful for debugging repeated (i.e. non-cached) mk renders
  if (skin) {
    return mk2html_with_skin_impl(content, skin);
  }
  else {
    if (mk_cache.has(content)) {
      return mk_cache.get(content)!;
    }

    let rendered = skinFriendlyMakeHtml_impl(content);
    mk_cache.set(content, rendered);
    return rendered;
  }
}

function mk2html_with_skin_impl(content: string, skin: ExamComponentSkin) {
  // console.log("rendering mk"); // useful for debugging repeated (i.e. non-cached) mk renders
  if (!skinned_mk_cache.has(skin.skin_id)) {
    skinned_mk_cache.set(skin.skin_id, new Map<string,string>());
  }

  let cache_for_this_skin = skinned_mk_cache.get(skin.skin_id)!;
  if (cache_for_this_skin.has(content)) {
    return cache_for_this_skin.get(content)!;
  }

  let rendered = skinFriendlyMakeHtml_impl(applySkin_impl(content, skin));
  cache_for_this_skin.set(content, rendered);
  return rendered;
}

function mk2html_unwrapped_impl(content: string, skin?: ExamComponentSkin) {
  // casts needed because implementation signature of mk2html below is not an overload
  let html = mk2html_impl(content, skin);
  return html.startsWith("<p>") && html.endsWith("</p>")
    ? html.slice(3, -4)
    : html;
}

function mk2html_rewrapped_impl(mk: string, tag: string, skin?: ExamComponentSkin) {
  // casts needed because implementation signature of mk2html_unwrapped below is not an overload
  return `<${tag}>${mk2html_unwrapped_impl(mk, skin)}</${tag}>`; 
}

function applySkin_impl(content: string, skin?: ExamComponentSkin) {
  if (!skin) {
    return content;
  }

  let template = Handlebars.compile(content, { strict: true, noEscape: true });
  try {
    return template(Object.assign({skin_id: skin.skin_id}, skin.replacements));
  }
  catch (e: any) {
    assertFalse("Error applying skin: " + e.message + " within :\n" + JSON.stringify(skin));
  }
}

const SKIN_PLACEHOLDER_SUB = "wiuglanadghxnwngslsehshd";
const SKIN_PLACEHOLDER_SUB_REGEX = new RegExp(SKIN_PLACEHOLDER_SUB, "g");

/**
 * Uninstantiated skins with patterns like "{{placeholder}}" don't play nicely
 * with syntax highlighting in markdown code blocks since they mess with parsing.
 * So we systematically replace them with placeholders that do render nicely,
 */
function skinFriendlyMakeHtml_impl(mk_str: string) {
  let saved: string[] = [];
  // replace all the {{blah}} with placeholders, while saving each {{blah}}
  mk_str = mk_str.replace(/\{\{[^\{\}]*\}\}/g, (match) => {
    saved.push(match);
    return SKIN_PLACEHOLDER_SUB;
  });

  let html = converter.makeHtml(mk_str);
  
  let i = 0;
  return html.replace(SKIN_PLACEHOLDER_SUB_REGEX, () => {
    return saved[i++];
  });
}

function highlightCode_impl(text: string, language: string) {
  return hljs.highlight(language, text).value;
}