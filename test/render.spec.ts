import "mocha";
import { expect } from "chai";
import { applySkin, EXAM_CONTENT, ExamContent, mk2html } from "../src/core/render";
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

describe("mk2html() type tests", () => {

  // NOTE: the function calls here don't actually throw at runtime

  it("should not accept plain strings or non-markdown content", () => {

    // @ts-expect-erroar
    mk2html("test");

    // @ts-expect-erraor
    mk2html(EXAM_CONTENT<never>("test"));

    // @ts-expect-error
    mk2html(EXAM_CONTENT<"skin">("test"));

  });
  
  it("should remove the markdown brand", () => {
    
    const result1 = mk2html(EXAM_CONTENT<"markdown">("test"));
    expectType<TypeEqual<ExamContent, typeof result1>>(true);
    
    const result2 = mk2html(EXAM_CONTENT<"markdown" | "skin">("test"));
    expectType<TypeEqual<ExamContent<"skin">, typeof result2>>(true);
    
  });
  
  it("Should not allow applying a skin to non-skinned content", () => {

    // @ts-expect-error
    mk2html(EXAM_CONTENT<"markdown">("test"), {skin_id: "test", replacements: {}});

  });

  it("should remove the markdown + skin brands when called with a skin", () => {
    
    const result1 = mk2html(EXAM_CONTENT<"markdown" | "skin">("test"), {skin_id: "test", replacements: {}});
    expectType<TypeEqual<ExamContent, typeof result1>>(true);
    
  });
  
});

describe("applySkin() function", () => {

  it("should make replacements between {{ and }}", () => {
    let rendered = applySkin(
      "this {is} a {{test}} of the {{test }}{{function}}",
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
    expect(rendered)
      .to.equal("this {is} a apple of the applebanana");
  });

  it("should throw if a replacement is missing", () => {
    expect(() => applySkin(
      "this {is} a {{test}} of the {{test }}{{function}}",
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
    let rendered = mk2html("this is a **test** _only_ a `test`");
    expect(rendered)
      .to.equal("<p>this is a <strong>test</strong> <em>only</em> a <code>test</code></p>");
  });

  it("should highlight code blocks with highlight.js", () => {
    let rendered = mk2html("```cpp\nint main() { cout << \"hello\" << endl; }\n```");
    expect(rendered)
      .to.contain("hljs")
      .and.contain("<pre><code")
      .and.contain("main")
  });

  it("should respect the specified code language", () => {
    ["cpp", "matlab", "typescript", "python", "java"].forEach(lang =>
      expect(mk2html("```"+lang+"\nint main() { cout << \"hello\" << endl; }\n```"))
        .to.contain(`hljs ${lang} language-${lang}`));
  });

  it("should render math between $$ and $$ with katex", () => {
    expect(mk2html("$$x + y_2$$"))
      .to.contain("katex");
  });

  it("should not render math within a code block", () => {
    expect(mk2html("```cpp\n// $$x + y_2$$\n```"))
      .to.not.contain("katex");
  });

  it("should apply a skin (before markdown/math rendering) if called with one", () => {
    let rendered = mk2html("this is a {{test}} _only_ a {{math}} `test`", {
      skin_id: "test",
      replacements: {
        "test": "**lizard**",
        "math": "$$x + y$$"
      }
    });
    expect(rendered)
      .to.contain("<p>this is a <strong>lizard</strong> <em>only</em>")
      .and.to.contain("<code>test</code></p>")
      .and.to.contain("katex");
  });

});