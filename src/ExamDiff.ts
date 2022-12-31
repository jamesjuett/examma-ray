import { ExamComponentOrChooserSpecification, ExamSpecification, QuestionSpecification, SectionChooserSpecification, SectionSpecification } from "./core/exam_specification";
import { ExamComponentSkin } from "./core/skins";
import { diff as just_diff } from "just-diff";
import deepEqual from "deep-equal";


export namespace ExamDiff {

  type ShallowSpecProperty<T> =
    T extends readonly (infer E)[] ? ShallowSpecProperty<E>[] :
    T extends ExamComponentSkin ? { skin_id: string } :
    T extends QuestionSpecification ? { question_id: string } :
    T extends SectionSpecification ? { section_id: string } :
    T extends ExamSpecification ? { exam_id: string } :
    ShallowSpecification<T>;

  type ShallowSpecification<T> = {
    [P in keyof T]: ShallowSpecProperty<T[P]>
  };

  export function shallowCopy<T extends ExamComponentOrChooserSpecification = ExamComponentOrChooserSpecification>(spec: ExamComponentOrChooserSpecification) : ShallowSpecification<T> {
    return <ShallowSpecification<T>>Object.fromEntries(
      Object.entries(spec).map(([k,v]) => [
        k,
        Array.isArray(v) ? v.map(shallowReplacement) :
        typeof v === "object" ? shallowReplacement(v) :
        v
      ])
    );
  }

  type ReplaceableComponent = {
    skin_id? : string,
    question_id? : string,
    section_id? : string,
    exam_id? : string,
    component_kind?: string,
  };

  function shallowReplacement(obj: ReplaceableComponent | ReplaceableComponent[]) : {} {
    if (Array.isArray(obj)) {
      return obj.map(shallowReplacement);
    }
    
    return obj.skin_id ? { skin_id: obj.skin_id } :
    obj.question_id ? { question_id: obj.question_id } :
    obj.section_id ? { section_id: obj.section_id } :
    obj.exam_id ? { exam_id: obj.exam_id } :
    obj.component_kind ? shallowCopy(<ExamComponentOrChooserSpecification>obj) :
    obj;
  }

  export function exam_shallow_diff(spec1: ExamSpecification, spec2: ExamSpecification) {
    return just_diff(shallowCopy(spec1), shallowCopy(spec2));
  }

  type ExamComponentDiff<T extends ExamComponentOrChooserSpecification> = Partial<Record<keyof T, boolean>>;

  export function shallowDiff<T extends ExamComponentOrChooserSpecification>(spec1: T, spec2: T) : ExamComponentDiff<T> | undefined {
    type ShallowT = ShallowSpecification<T>;
    const shallow_spec1 : ShallowT = shallowCopy(spec1);
    const shallow_spec2 : ShallowT = shallowCopy(spec2);
    const diff = <ExamComponentDiff<T>>Object.fromEntries(
      Object.keys(shallow_spec1)
        .filter(k => !deepEqual(shallow_spec1[<keyof ShallowT>k], shallow_spec2[<keyof ShallowT>k], {strict: true}))
        .map(k => [k,true])
    );

    return Object.values(diff).some(v => v) ? diff : undefined;
  }
}