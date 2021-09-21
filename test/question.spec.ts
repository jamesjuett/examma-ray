import 'mocha';
import { expect } from 'chai';
import { ExamSubmission, fillManifest } from '../src/submissions';
import { Question } from '../src/exams';
import { CUSTOMIZE, QuestionSpecification } from '../src/specification';

const MC_Basic : QuestionSpecification = {
  id: "question_id",
  points: 1,
  mk_description: "[description]",
  response: {
    kind: "multiple_choice",
    choices: ["choice1", "choice2", "choice3", "choice4", "choice5"],
    multiple: false
  }
}

describe('Question Specification', () => {

  it('Allows Valid Question IDs', () => {
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "question_id1"}))).not.to.throw();
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "aAzZ09-_-"}))).not.to.throw();
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "a"}))).not.to.throw();
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "a_-_-_-a"}))).not.to.throw();
  });

  it('Prohibits Invalid Question IDs', () => {
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "1question_id"}))).to.throw(Error);
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: ""}))).to.throw(Error);
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "1"}))).to.throw(Error);
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "-_alsdf"}))).to.throw(Error);
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "_sflaalsdf"}))).to.throw(Error);
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "aslkdhf+="}))).to.throw(Error);
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "_______"}))).to.throw(Error);
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "++++"}))).to.throw(Error);
    expect(() => new Question(CUSTOMIZE(MC_Basic, {id: "0azaz"}))).to.throw(Error);
  });

});