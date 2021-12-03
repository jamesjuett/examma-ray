import { RandomSeed, create as createRNG } from 'random-seed';
import { shuffle } from 'shuffle-seed';
import { Exam, Question, Section } from './exam_components';
import { assert } from './util';


export const CHOOSE_ALL = Symbol("choose_all");

export class SeededRandomizer {

  private rng: RandomSeed;

  public constructor(seed: string) {
    this.rng = createRNG(seed);
  }

  public float() {
    return this.rng.random();
  }

  public range(n: number) {
    return this.rng.range(n);
  };

  public choose_one<T>(choices: readonly T[]) {
    assert(choices.length > 0, "No choices available.");
    return choices[this.rng.range(choices.length)];
  };

  public chooseN<T>(choices: readonly T[], n: number) {
    assert(choices.length >= n, "Number to randomly choose is larger than number of choices.");
    return choices
      .slice()
      .map(c => ({ i: this.rng.random(), c: c }))
      .sort((a, b) => a.i - b.i)
      .map(x => x.c)
      .slice(0, n);
  }

  public shuffle<T>(original: readonly T[]) {
    return shuffle(original, ""+this.float());
  }

}

export type Randomizer = SeededRandomizer | typeof CHOOSE_ALL;

export function createSectionChoiceRandomizer(student_randomization_seed: string, exam: Exam) : SeededRandomizer {
  return new SeededRandomizer(student_randomization_seed + "-" + exam.exam_id);
}

export function createQuestionChoiceRandomizer(student_randomization_seed: string, exam: Exam, section: Section) : SeededRandomizer {
  return new SeededRandomizer(student_randomization_seed + "-" + exam.exam_id + "-" + section.section_id);
}

export function createSectionSkinRandomizer(student_randomization_seed: string, exam: Exam, section: Section) : SeededRandomizer {
  // Note that it's important the seed for the section skin randomizer is different from the section randomizer.
  // Otherwise, students who get one section would always get the same section skin.
  return new SeededRandomizer(student_randomization_seed + "-" + exam.exam_id + "-" + section.section_id + "-skin");
}

export function createQuestionSkinRandomizer(student_randomization_seed: string, exam: Exam, question: Question) : SeededRandomizer {
  return new SeededRandomizer(student_randomization_seed + "-" + exam.exam_id + "-" + question.question_id + "-skin");
}