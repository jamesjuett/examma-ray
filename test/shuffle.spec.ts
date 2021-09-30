import 'mocha';
import { expect } from 'chai';
import { AssignedExam } from '../src/core/assigned_exams';
import { INVALID_IDS, VALID_IDS } from './common.spec';
import { Exam_MC_Basic } from './exam.spec';
import { Exam } from '../src/core/exam_components';


describe('Shuffle Choosers', () => {

  it('Allows Valid Student Uniqnames', () => {
    VALID_IDS.forEach(
      id => expect(() => new AssignedExam("uuid", Exam.create(Exam_MC_Basic), {name: "student", uniqname: id}, [], false)).not.to.throw()
    );
  });

  it('Prohibits Invalid Student Uniqnames', () => {
    INVALID_IDS.forEach(
      id => expect(() => new AssignedExam("uuid", Exam.create(Exam_MC_Basic), {name: "student", uniqname: id}, [], false)).to.throw()
    );
  });

});