import 'mocha';
import { expect } from 'chai';
import { readFileSync } from 'fs';

import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import { Exam, RenderMode } from '../src/exams';
import { ExamGenerator } from "../src/ExamGenerator";
import { Section_Simple_Test } from './test-exams/content/simple/test';
import { ExamUtils } from '../src/ExamUtils';

const opts = {
  headless: true,
  timeout: 10000
};

let browser: Browser;

before(async () => browser = await puppeteer.launch(opts))

describe('index.html', function() {
  this.timeout(20000);

  let page: Page;

  before(async () => {
    let exam = new Exam({
      id: "simple_test",
      title: "Simple Test Exam",
      mk_intructions: "[Instructions]",
      mk_questions_message: `[Questions Message]`,
      sections: [
        Section_Simple_Test
      ]
    });

    let gen = new ExamGenerator(exam, {
      student_ids: "uniqname",
      students: [
        {
          name: "Test Student",
          uniqname: "test"
        }
      ],
      frontend_js_path: "js/frontend.js"
    });
    gen.writeAll();
    page = await browser.newPage()
    page.on('console', message =>
    console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
  .on('pageerror', ({ message }) => console.log(message))
  .on('response', response =>
    console.log(`${response.status()} ${response.url()}`))
  .on('requestfailed', request =>
    console.log(`${request.failure().errorText} ${request.url()}`))
    // console.log(gen.renderExams()[0]);
    await page.setContent(gen.renderExams()[0]);
    await page.addScriptTag({ path: 'dist/frontend/frontend.js' });

    await page.waitForTimeout(3000);
    // await page.click("#exam-welcome-normal-modal");
    // await page.click("input[type=radio]");
    await page.pdf({
      printBackground: true,
      path: "webpage.pdf",
      format: "letter",
      margin: {
          top: "20px",
          bottom: "40px",
          left: "20px",
          right: "20px"
      }
    });
    await page.evaluate(() => console.log($));
  });

  after(async () => browser.close());

  it('should contain test wheee', async () => {
    expect(await page.$eval("body", elem => elem.innerHTML)).to.contain("est");

  });

  it('should contain test wheee2', async () => {
    expect(await page.$eval("body", elem => elem.innerHTML)).to.contain("est");

  });

});