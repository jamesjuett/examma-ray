import 'mocha';
import { expect } from 'chai';
import { readFileSync } from 'fs';

import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
const opts = {
  headless: true,
  slowMo: 100,
  timeout: 10000
};

let browser: Browser;

before(async () => browser = await puppeteer.launch(opts))

describe('index.html', () => {

  let page: Page;

  before(async () => {
    page = await browser.newPage()
    await page.setContent(readFileSync(path.resolve(__dirname, "index.html"), "utf8"));
  });

  after(async () => browser.close());

  it('should contain test wheee', async () => {
    
    expect(await (await page.$("body"))!.evaluate(elem => elem.innerHTML)).to.contain("test wheee");

  });

});