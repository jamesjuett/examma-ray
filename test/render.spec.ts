import "mocha";
import { expect } from "chai";
import { applySkin, embed_content, EXAM_CONTENT, ExamContent, highlightCode, mk2html } from "../src/core/render";
import { expectType, TypeEqual } from "ts-expect";
import { Exam } from "../src/core";

describe("ExamContent type tests", () => {

  it("should allow creating ExamContent with EXAM_CONTENT()", () => {
    let a: ExamContent = EXAM_CONTENT("test");
    let b: ExamContent<"markdown"> = EXAM_CONTENT<"markdown">("test");
    let c: ExamContent<"skin"> = EXAM_CONTENT<"skin">("test");
    let d: ExamContent<"markdown" | "skin"> = EXAM_CONTENT<"markdown" | "skin">("test");
  });
  
  it("should not allow creating ExamContent with a plain string", () => {
    // @ts-expect-error
    let a: ExamContent = "test";
    // @ts-expect-error
    let b: ExamContent<"markdown"> = "test";
    // @ts-expect-error
    let c: ExamContent<"skin"> = "test";
    // @ts-expect-error
    let d: ExamContent<"markdown" | "skin"> = "test";
  });

  it("should not allow using ExamContent in template strings or concatenation", () => {
    let a: ExamContent = EXAM_CONTENT("test");
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    let b = `test ${a}`;
    // @ts-expect-error
    let c = "test " + a;
    // @ts-expect-error
    let d = a + " test";
  });
});

describe("embed_content() type tests", () => {

  it("should only allow embedding appropriate content types", () => {

    // ERROR - not inteded for use with plain strings
    // @ts-expect-error
    `some content: ${embed_content<"html">("test")}`;

    // OK - fine to embed plain text as html
    `some content: ${embed_content<"html">(EXAM_CONTENT<never>("test"))}`;

    // OK - fine to embed content that may contain html as html
    `some content: ${embed_content<"html">(EXAM_CONTENT<"html">("test"))}`;

    // ERROR - content type is a superset of embed request, not just plain html here
    // @ts-expect-error
    `some content: ${embed_content<"html">(EXAM_CONTENT<"html" | "markdown" | "skin">("test"))}`;

    // ERROR - same as above, EXAM_CONTENT defaults to EXAM_CONTENT<"html" | "markdown" | "skin">
    // @ts-expect-error
    `some content: ${embed_content<"html">(EXAM_CONTENT("test"))}`;

    // OK - content type matches embed request
    `some content: ${embed_content<"html" | "markdown">(EXAM_CONTENT<"markdown" | "html">("test"))}`;
    
    // OK - content type is a subset of embed request
    `some content: ${embed_content<"html" | "markdown">(EXAM_CONTENT<"html">("test"))}`;
    
    // OK - content type transformed to only html by mk2html
    `some content: ${embed_content<"html">(mk2html(EXAM_CONTENT<"markdown" | "html">("test")))}`;

    // ERROR - skin was not provided to mk2html, which means skin placeholders may persist and not embeddable as html
    // @ts-expect-error
    `some content: ${embed_content<"html">(mk2html(EXAM_CONTENT<"markdown" | "html" | "skin">("test")))}`;

    // Ok - constrast to above, here the skin placeholders were presumably filled (and it throws otherwise)
    `some content: ${embed_content<"html">(mk2html(EXAM_CONTENT<"markdown" | "html" | "skin">("test"), {skin_id: "test", replacements: {}}))}`;
  });

});

describe("mk2html() type tests", () => {

  // NOTE: the function calls here don't actually throw at runtime

  it("should not accept plain strings", () => {

    // @ts-expect-error
    mk2html("test");

  });
  
  it("should adjust content types correctly", () => {
    
    const result1 = mk2html(EXAM_CONTENT<"markdown">("test"));
    expectType<TypeEqual<ExamContent<"html">, typeof result1>>(true);
    
    const result2 = mk2html(EXAM_CONTENT<"markdown" | "skin">("test"));
    expectType<TypeEqual<ExamContent<"skin" | "html">, typeof result2>>(true);
    
    const result3 = mk2html(EXAM_CONTENT<"markdown" | "skin">("test"), {skin_id: "test", replacements: {}});
    expectType<TypeEqual<ExamContent<"html">, typeof result3>>(true);
    
  });
  
});

describe("applySkin() function", () => {

  it("should make replacements between {{ and }}", () => {
    let rendered = applySkin(
      EXAM_CONTENT("this {is} a {{test}} of the {{test }}{{function}}"),
      {
        skin_id: "test",
        replacements: {
          "test": "apple",
          "function": "banana",
          "is": "should be ignored",
          "the": "should be ignored"
        }
      }
    );
    expect(embed_content<"html" | "markdown">(rendered))
      .to.equal("this {is} a apple of the applebanana");
  });

  it("should throw if a replacement is missing", () => {
    expect(() => applySkin(
      EXAM_CONTENT("this {is} a {{test}} of the {{test }}{{function}}"),
      {
        skin_id: "test",
        replacements: {
          "test": "apple",
          // "function" is missing
          "is": "should be ignored",
          "the": "should be ignored"
        }
      }
    )).to.throw();
  });

});



describe("mk2html() function", () => {

  it("should render basic markdown", () => {
    let rendered = mk2html(EXAM_CONTENT("this is a **test** _only_ a `test`"));
    expect(rendered)
      .to.equal("<p>this is a <strong>test</strong> <em>only</em> a <code>test</code></p>");
  });

  it("should highlight code blocks with highlight.js", () => {
    let rendered = mk2html(EXAM_CONTENT("```cpp\nint main() { cout << \"hello\" << endl; }\n```"));
    expect(rendered)
      .to.contain("hljs")
      .and.contain("<pre><code")
      .and.contain("main")
  });

  it("should respect the specified code language", () => {
    ["cpp", "matlab", "typescript", "python", "java"].forEach(lang =>
      expect(mk2html(EXAM_CONTENT("```"+lang+"\nint main() { cout << \"hello\" << endl; }\n```")))
        .to.contain(`hljs ${lang} language-${lang}`));
  });

  it("should render math between $$ and $$ with katex", () => {
    expect(mk2html(EXAM_CONTENT("$$x + y_2$$")))
      .to.contain("katex");
  });

  it("should not render math within a code block", () => {
    expect(mk2html(EXAM_CONTENT("```cpp\n// $$x + y_2$$\n```")))
      .to.not.contain("katex");
  });

  it("should apply a skin (before markdown/math rendering) if called with one", () => {
    let rendered = mk2html(EXAM_CONTENT("this is a {{test}} _only_ a {{math}} `test`"), {
      skin_id: "test",
      replacements: {
        "test": "**lizard**",
        "math": "$$x + y$$"
      }
    });
    expect(embed_content<"html">(rendered))
      .to.contain("<p>this is a <strong>lizard</strong> <em>only</em>")
      .and.to.contain("<code>test</code></p>")
      .and.to.contain("katex");
  });

});

describe("highlightCode() type tests", () => {

  it("should accept plain exam content but not regular strings", () => {

    highlightCode(EXAM_CONTENT<never>("test"), "cpp");

    // @ts-expect-error
    highlightCode("test", "cpp");

  });

  it("should not accept exam content containing html, markdown, or skin placeholders", () => {
    
    // @ts-expect-error
    highlightCode(EXAM_CONTENT("test"), "cpp");
    
    // @ts-expect-error
    highlightCode(EXAM_CONTENT<"markdown">("test"), "cpp");
    
    // @ts-expect-error
    highlightCode(EXAM_CONTENT<"skin">("test"), "cpp");
    
    // @ts-expect-error
    highlightCode(EXAM_CONTENT<"markdown" | "skin">("test"), "cpp");

  });
});