import 'mocha';
import { expect } from 'chai';
import { AssignedExam } from '../src/assigned_exams';
import { INVALID_IDS, VALID_IDS } from './common.spec';
import { Exam_MC_Basic } from './exam.spec';
import { Exam } from '../src/exam_components';


describe('Exam Specification', () => {

  it('Allows Valid Exam IDs', () => {
    VALID_IDS.forEach(
      id => expect(() => new AssignedExam("uuid", Exam.create(Exam_MC_Basic), {name: "student", uniqname: id}, [], false)).not.to.throw()
    );
  });

  it('Prohibits Invalid Exam IDs', () => {
    INVALID_IDS.forEach(
      id => expect(() => new AssignedExam("uuid", Exam.create(Exam_MC_Basic), {name: "student", uniqname: id}, [], false)).to.throw()
    );
  });

});