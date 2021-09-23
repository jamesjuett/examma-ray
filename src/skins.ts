import { Exam } from "./exam_components";
import { CHOOSE_ALL, Randomizer } from "./randomization";
import { StudentInfo } from "./specification";
import { assert } from "./util";

export type SkinReplacements = {
  [index: string]: string
};

export type ExamComponentSkin = {
  readonly component_kind?: "skin",
  readonly id: string,
  readonly non_composite_id?: string,
  replacements: SkinReplacements
};

export const DEFAULT_SKIN: ExamComponentSkin = {
  id: "__DEFAULT",
  replacements: { }
}

export function createCompositeSkin(sectionSkin: ExamComponentSkin, questionSkin: ExamComponentSkin) : ExamComponentSkin{
  return {
    id: sectionSkin.id + "-" + questionSkin.id,
    non_composite_id: questionSkin.id,
    replacements: Object.assign({}, sectionSkin.replacements, questionSkin.replacements)
  };
}

export function SINGLE_REPLACEMENT_SKINS(target: string, replacements: readonly string[]) : ExamComponentSkin[] {
  return replacements.map(rep => {
    let reps: {[index: string]: string} = {};
    reps[target] = rep;
    return {
      id: target + "_" + rep,
      replacements: reps
    };
  });
}


export interface SkinChooser {
  readonly component_kind: "chooser";
  choose(exam: Exam, student: StudentInfo, rand: Randomizer): readonly ExamComponentSkin[];
  getById(id: string): ExamComponentSkin | undefined;
};

export function RANDOM_SKIN(skins: readonly ExamComponentSkin[]) : SkinChooser {
  let skinMap : {[index: string]: ExamComponentSkin | undefined} = {};
  skins.forEach(s => skinMap[s.id] = s);
  return {
    component_kind: "chooser",
    choose: (exam: Exam, student: StudentInfo, rand: Randomizer) => {
      assert(skins.length > 0, `Error - array of skin choices is empty.`);
      return rand === CHOOSE_ALL ? skins : [rand.choose(skins)]
    },
    getById: (id: string) => skinMap[id]
  };
}