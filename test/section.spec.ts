import 'mocha';
import { expect } from 'chai';
import { CUSTOMIZE, SectionSpecification } from '../src/specification';
import { MC_Basic } from './question.spec';
import { INVALID_IDS, VALID_IDS } from './common.spec';
import { Section } from '../src/exam_components';

export const Section_MC_Basic : SectionSpecification = {
  id: "section_id",
  title: "[section title]",
  mk_description: "[description]",
  questions: [MC_Basic]
};



describe('Section Specification', () => {

  it('Allows Valid Section IDs', () => {
    VALID_IDS.forEach(
      id => expect(() => Section.create(CUSTOMIZE(Section_MC_Basic, {id: id}))).not.to.throw()
    );
  });

  it('Prohibits Invalid Section IDs', () => {
    INVALID_IDS.forEach(
      id => expect(() => Section.create(CUSTOMIZE(Section_MC_Basic, {id: id}))).to.throw()
    );
  });

});