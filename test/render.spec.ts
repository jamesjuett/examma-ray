import 'mocha';
import { expect } from 'chai';
import { applySkin, mk2html } from '../src/core/render';

describe('applySkin() function', () => {

  it('should make replacements between {{ and }}', () => {
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

});



describe('mk2html() function', () => {

  it('should render basic markdown', () => {
    let rendered = mk2html("this is a **test** _only_ a `test`");
    expect(rendered)
      .to.equal("<p>this is a <strong>test</strong> <em>only</em> a <code>test</code></p>");
  });

  it('should highlight code blocks with highlight.js', () => {
    let rendered = mk2html("```cpp\nint main() { cout << \"hello\" << endl; }\n```");
    expect(rendered)
      .to.contain("hljs")
      .and.contain("<pre><code")
      .and.contain("main")
  });

  it('should respect the specified code language', () => {
    ["cpp", "matlab", "typescript", "python", "java"].forEach(lang =>
      expect(mk2html("```"+lang+"\nint main() { cout << \"hello\" << endl; }\n```"))
        .to.contain(`hljs ${lang} language-${lang}`));
  });

  it('should render math between $$ and $$ with katex', () => {
    expect(mk2html("$$x + y_2$$"))
      .to.contain("katex");
  });

  it('should not render math within a code block', () => {
    expect(mk2html("```cpp\n// $$x + y_2$$\n```"))
      .to.not.contain("katex");
  });

  it('should apply a skin (before markdown/math rendering) if called with one', () => {
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