import 'mocha';
import { expect } from 'chai';
import { AssignedExam, Exam } from '../src/exams';
import { CUSTOMIZE, ExamSpecification, QuestionSpecification, SectionSpecification } from '../src/specification';
import { MC_Basic } from './question.spec';
import { INVALID_IDS, VALID_IDS } from './common.spec';
import { Section_MC_Basic } from './section.spec';
import { Exam_MC_Basic } from './exam.spec';


describe('Exam Specification', () => {

  it('Allows Valid Exam IDs', () => {
    VALID_IDS.forEach(
      id => expect(() => new AssignedExam("uuid", new Exam(Exam_MC_Basic), {name: "student", uniqname: id}, [], false)).not.to.throw()
    );
  });

  it('Prohibits Invalid Exam IDs', () => {
    INVALID_IDS.forEach(
      id => expect(() => new AssignedExam("uuid", new Exam(Exam_MC_Basic), {name: "student", uniqname: id}, [], false)).to.throw()
    );
  });

});