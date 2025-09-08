import 'mocha';
import { expect } from 'chai';
import { RESPONSE_HANDLERS } from '../../src/response/responses';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';


// Declare and create global window/jquery mock for testing
declare global {
  namespace NodeJS {
    interface Global {
      $: JQueryStatic;
    }
  }
}
global.$ = jquery(<any>new JSDOM("").window, true);




const FITB_HANDLER = RESPONSE_HANDLERS["fill_in_the_blank"];

describe('FITB parser', () => {

  it('identifies blank submissions', () => {
    let parsed = [
      FITB_HANDLER.parse(undefined),
      FITB_HANDLER.parse(null),
      FITB_HANDLER.parse(''),
      FITB_HANDLER.parse('  '),
      FITB_HANDLER.parse('[]')
    ];
    parsed.forEach(p => expect(p.validity).to.equal("blank"));
  });

  it('identifies malformed submissions', () => {
    const inputs = [
      '[}]',
      '["3", 3, 5]',
      '[3, 2, 9]',
      '[undefined, null]',
      'test',
      '["apple", "banana", ["cranberry"]]',
    ];
    let parsed = inputs.map(i => FITB_HANDLER.parse(i));
    parsed.forEach(
      (p,i) => expect(p).to.deep.equal({validity: "malformed", raw: inputs[i]})

    );
  });

  it('parses simple cases correctly', () => {
    let parsed = FITB_HANDLER.parse('["apple", "banana", "cranberry"]');
    expect(parsed)
      .to.deep.equal({validity: "unchecked", encoding: ["apple", "banana", "cranberry"]});
  });

});


describe('FITB renderer', () => {

  let rendered = FITB_HANDLER.render({
    kind: "fill_in_the_blank",
    content: `
this is a **test** _only_ a \`test\`

\`\`\`cpp
<input></input>
int main() {
  ____BLANK____ x = _blank_;
  int y = 3;
  int z = x + _Blank__;

  [[__Box_____\n\n]]

  [[BOX
    



  ]]

  return ___BLANK__;
}
\`\`\`
`
  }, "test_fitb", "test_fitb", undefined);

  it('renders markdown in FITB content', () => {
    expect(rendered).to.contain("this is a <strong>test</strong> <em>only</em> a <code>test</code>");
  });

  it('renders blanks correctly', () => {
    expect(rendered)
      .to.contain(`<input type="text" value="" size="8" maxlength="8" autocomplete="off" autocorrect="off" spellcheck="false" class="examma-ray-fitb-blank-input nohighlight"></input>`)
      .to.contain(`<input type="text" value="" size="2" maxlength="2" autocomplete="off" autocorrect="off" spellcheck="false" class="examma-ray-fitb-blank-input nohighlight"></input>`)
      .to.contain(`<input type="text" value="" size="3" maxlength="3" autocomplete="off" autocorrect="off" spellcheck="false" class="examma-ray-fitb-blank-input nohighlight"></input>`)
      .to.contain(`<input type="text" value="" size="5" maxlength="5" autocomplete="off" autocorrect="off" spellcheck="false" class="examma-ray-fitb-blank-input nohighlight"></input>`);
  });

  it('renders boxes correctly', () => {
    expect(rendered)
      .to.contain(`<textarea rows="3" cols="7" autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false" class="examma-ray-fitb-box-input nohighlight" style="resize: none; overflow: auto;"></textarea>`)
      .to.contain(`<textarea rows="6" autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false" class="examma-ray-fitb-box-input nohighlight" style="resize: none; overflow: auto; width: 100%;"></textarea>`);
  });

});


describe('FITB extractor', () => {

  it('extracts inputs and textarea values correctly', () => {
    expect(FITB_HANDLER.extract(
      $(`<div>
        <input type="text" value="test"></input>
      </div>`)))
      .to.be.an("array").with.ordered.members(["test"]);

    expect(FITB_HANDLER.extract(
      $(`<div>
        <input type="text" value="test1"></input>
        <span>blah</span>
        <div>
          <div>
            <input type="text" value="test2"></input>
            <textarea>test\n\ntest</textarea>
            <input type="text" value="test3"></input>
          </div>
        </div>
      </div>`)))
      .to.be.an("array")
      .with.ordered.members(["test1", "test2", "test\n\ntest", "test3"]);
  });

  it('extracts/identifies blank submission as empty array', () => {
    expect(FITB_HANDLER.extract($(`<div></div>`)))
      .to.be.an("array")
      .that.is.empty;

    expect(FITB_HANDLER.extract(
      $(`<div>
        <input type="text"></input>
        <span>blah</span>
        <div>
          <div>
            <input type="text"></input>
            <textarea></textarea>
            <input type="text"></input>
          </div>
        </div>
      </div>`)))
      .to.be.an("array")
      .that.is.empty;
  });

  it('treats whitespace-only entries as blank', () => {
    expect(FITB_HANDLER.extract($(`<div></div>`)))
      .to.be.an("array")
      .that.is.empty;

    expect(FITB_HANDLER.extract(
      $(`<div>
        <input type="text" value=""></input>
        <span>blah</span>
        <div>
          <div>
            <input type="text" value=" \n"></input>
            <textarea> \n   \n   </textarea>
            <input type="text" value="   "></input>
          </div>
        </div>
      </div>`)))
      .to.be.an("array")
      .that.is.empty;

      expect(FITB_HANDLER.extract(
        $(`<div>
          <input type="text" value="a"></input>
          <span>blah</span>
          <div>
            <div>
              <input type="text" value=" \n"></input>
              <textarea> \n   \n   </textarea>
              <input type="text" value="   "></input>
            </div>
          </div>
        </div>`)))
        .to.be.an("array")
        .with.ordered.members(["a", "", "", ""])
        .and.to.not.equal([]);
  });

});




describe('FITB filler', () => {

  it('fills inputs and textarea values correctly', () => {
    let elem = $(`<div>
      <input type="text" value="test"></input>
    </div>`);
    FITB_HANDLER.fill(elem, {validity: "viable", encoding: ["test"]});
    expect(elem.find("input, textarea").map(function() { return $(this).val(); }).get())
      .to.be.an("array")
      .with.ordered.members(["test"]);

    elem = $(`<div>
        <input type="text"></input>
        <span>blah</span>
        <div>
          <div>
            <input type="text"></input>
            <textarea></textarea>
            <input type="text"></input>
          </div>
        </div>
      </div>`);
    FITB_HANDLER.fill(elem, {validity: "viable", encoding: ["test1", "test2", "test\ntest\ntest", "test3"]});
    expect(elem.find("input, textarea").map(function() { return $(this).val(); }).get())
      .to.be.an("array")
      .with.ordered.members(["test1", "test2", "test\ntest\ntest", "test3"]);

  });

  it('overwrites existing input/textarea values', () => {

    let elem = $(`<div>
        <input type="text" value="test1"></input>
        <span>blah</span>
        <div>
          <div>
            <input type="text" value="test2"></input>
            <textarea>test\n\ntest</textarea>
            <input type="text" value="test3"></input>
          </div>
        </div>
      </div>`);
    FITB_HANDLER.fill(elem, {validity: "viable", encoding: ["test1", "test2", "test\ntest\ntest", "test3"]});
    expect(elem.find("input, textarea").map(function() { return $(this).val(); }).get())
      .to.be.an("array")
      .with.ordered.members(["test1", "test2", "test\ntest\ntest", "test3"]);
      
  });

});