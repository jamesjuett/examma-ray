import { SkinChooserSpecification } from "./exam_specification";

export type SkinReplacements = {
  [index: string]: string
};

export type ExamComponentSkin = {
  readonly component_kind?: "skin",
  readonly skin_id: string,
  readonly non_composite_skin_id?: string,
  readonly replacements: SkinReplacements
};

export const DEFAULT_SKIN: ExamComponentSkin = {
  skin_id: "__DEFAULT",
  replacements: { }
}

export function createCompositeSkin(sectionSkin: ExamComponentSkin, questionSkin: ExamComponentSkin) : ExamComponentSkin{
  return {
    skin_id: sectionSkin.skin_id + "-" + questionSkin.skin_id,
    non_composite_skin_id: questionSkin.skin_id,
    replacements: Object.assign({}, sectionSkin.replacements, questionSkin.replacements)
  };
}

export function SINGLE_REPLACEMENT_SKINS(target: string, replacements: readonly string[]) : ExamComponentSkin[] {
  return replacements.map(rep => {
    let reps: {[index: string]: string} = {};
    reps[target] = rep;
    return {
      skin_id: target + "_" + rep,
      replacements: reps
    };
  });
}


export function RANDOM_SKIN(skins: readonly ExamComponentSkin[]) : SkinChooserSpecification {
  return {
    component_kind: "chooser_specification",
    chooser_kind: "skin",
    choices: skins,
    strategy: {
      kind: "random_1",
    }
  };
}

// export interface SkinChooser {
//   readonly component_kind: "chooser";
//   readonly chooser_kind: "skin";
//   choose(exam: Exam, student: StudentInfo, rand: Randomizer): readonly ExamComponentSkin[];
//   getById(id: string): ExamComponentSkin | undefined;
// };

// export function RANDOM_SKIN(skins: readonly ExamComponentSkin[]) : SkinChooser {
//   let skinMap : {[index: string]: ExamComponentSkin | undefined} = {};
//   skins.forEach(s => skinMap[s.skin_id] = s);
//   return {
//     component_kind: "chooser",
//     choose: (exam: Exam, student: StudentInfo, rand: Randomizer) => {
//       assert(skins.length > 0, `Error - array of skin choices is empty.`);
//       return rand === CHOOSE_ALL ? skins : [rand.choose(skins)]
//     },
//     getById: (id: string) => skinMap[id]
//   };
// }