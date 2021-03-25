import 'mocha';
import { expect } from 'chai';
import { mk2html } from '../render';

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

});