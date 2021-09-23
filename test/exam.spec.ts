import 'mocha';
import { expect } from 'chai';
import { CUSTOMIZE, ExamSpecification } from '../src/specification';
import { INVALID_IDS, VALID_IDS } from './common.spec';
import { Section_MC_Basic } from './section.spec';
import { Exam } from '../src/exam_constructs';

export const Exam_MC_Basic : ExamSpecification = {
  id: "exam_id",
  title: "[exam title]",
  mk_intructions: "[instructions]",
  sections: [Section_MC_Basic]
};



describe('Exam Specification', () => {

  it('Allows Valid Exam IDs', () => {
    VALID_IDS.forEach(
      id => expect(() => Exam.create(CUSTOMIZE(Exam_MC_Basic, {id: id}))).not.to.throw()
    );
  });

  it('Prohibits Invalid Exam IDs', () => {
    INVALID_IDS.forEach(
      id => expect(() => Exam.create(CUSTOMIZE(Exam_MC_Basic, {id: id}))).to.throw()
    );
  });

});