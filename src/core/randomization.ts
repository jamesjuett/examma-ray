import { RandomSeed, create as createRNG } from 'random-seed';
import { shuffle } from 'shuffle-seed';
import { Exam, Question, Section } from './exam_components';
import { assert } from './util';

export class SeededRandomizer {

  private rng: RandomSeed;

  public constructor(seed: string) {
    this.rng = createRNG(seed);
  }
  
  /**
   * @returns A random floating point number between 0 (inclusive) and 1 (exclusive).
   */
  public float() {
    return this.rng.random();
  }

  /**
   * @returns A random integer between 0 (inclusive) and n (exclusive).
   */
  public range(n: number) {
    return this.rng.range(n);
  };

  /**
   * An old method for randomly choosing one element from an array. Does not
   * produce behavior consistent with `chooseN(choices, 1)`.
   * @deprecated Do not use in new code. Use `chooseOne(choices)` instead.
   */
  public legacyChooseOne<T>(choices: readonly T[]) {
    assert(choices.length > 0, "No choices available.");
    return choices[this.rng.range(choices.length)];
  };

  /**
   * @requires `choices` is non-empty.
   * @returns One of the elements of `choices`, selected randomly.
   */
  public chooseOne<T>(choices: readonly T[]) {
    assert(choices.length > 0, "No choices available.");

    // Implemented in terms of chooseN to ensure randomization is
    // deterministic regardless of whether you use chooseOne(choices)
    // or chooseN(choices, 1)
    return this.chooseN(choices, 1)[0];
  };

  /**
   * Randomly selects `n` elements from `choices` (repetition is not allowed).
   * @requires `choices` is non-empty and `n` is less than or equal to the length of `choices`.
   * @returns An array of `n` elements from `choices`, selected randomly.
   */
  public chooseN<T>(choices: readonly T[], n: number) {
    assert(choices.length >= n, "Number to randomly choose is larger than number of choices.");

    // Prefer not to consume any randomness when it's not necessary.
    // That way, the use of a superfulous randomization like chooseN([x], 1)
    // will be deterministically equivalent to not using that randomization.
    if (choices.length === 1) {
      return choices;
    }
    
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

export type Randomizer = SeededRandomizer;

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