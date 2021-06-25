import { RandomSeed, create as createRNG } from 'random-seed';
import { Exam, Question, Section, StudentInfo } from './exams';
import { CHOOSE_ALL } from './specification';
import { assert } from './util';


class SeededRandomizerImpl {

  private rng: RandomSeed;

  public constructor(seed: string) {
    this.rng = createRNG(seed);
  }

  public float() {
    return this.rng.random;
  }

  public range(n: number) {
    return this.rng.range(n);
  };

  public choose<T>(choices: readonly T[]) {
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

}

export interface SeededRandomizer extends SeededRandomizerImpl {

}

export type Randomizer = SeededRandomizer | typeof CHOOSE_ALL;

export function createSectionChoiceRandomizer(student_randomization_seed: string, exam: Exam) : SeededRandomizer {
  return new SeededRandomizerImpl(student_randomization_seed + "-" + exam.exam_id);
}

export function createQuestionChoiceRandomizer(student_randomization_seed: string, exam: Exam, section: Section) : SeededRandomizer {
  return new SeededRandomizerImpl(student_randomization_seed + "-" + exam.exam_id + "-" + section.section_id);
}

export function createSectionSkinRandomizer(student_randomization_seed: string, exam: Exam, section: Section) : SeededRandomizer {
  // Note that it's important the seed for the section skin randomizer is different from the section randomizer.
  // Otherwise, students who get one section would always get the same section skin.
  return new SeededRandomizerImpl(student_randomization_seed + "-" + exam.exam_id + "-" + section.section_id + "-skin");
}

export function createQuestionSkinRandomizer(student_randomization_seed: string, exam: Exam, question: Question) : SeededRandomizer {
  return new SeededRandomizerImpl(student_randomization_seed + "-" + exam.exam_id + "-" + question.question_id + "-skin");
}