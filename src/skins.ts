
export type QuestionSkin = {
  readonly id: string,
  replacements: {
    [index: string]: string
  }
};

export const DEFAULT_SKIN: QuestionSkin = {
  id: "__DEFAULT",
  replacements: { }
}

export function createCompositeSkin(sectionSkin: QuestionSkin, questionSkin: QuestionSkin) {
  return {
    id: sectionSkin.id + "-" + questionSkin.id,
    replacements: Object.assign({}, sectionSkin.replacements, questionSkin.replacements)
  };
}