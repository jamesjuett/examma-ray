import { SECTION_REFERENCE_PLUGIN } from "../../plugins/SectionReference";
import type { AssignedExam, AssignedSection } from "../../src/core";
import { SimpleJSON } from "../../src/core/util";
import type { RuntimeExam } from "../runtime_exam";
import copy from "fast-copy";

type DependencyIDs_t<T> = { [P in keyof T]: T[P] extends ExamPlugin ? T[P]["plugin_id"] : never };


// type TupleToObject<T extends readonly string[], V> = {
//   [K in T[number]]: V;
// };


// Lol I wonder if there's a better way to do this that I don't know about

type ElementTypes<T extends readonly ExamPlugin[]> = T extends readonly (infer ElementType)[] ? ElementType : never;
type ExtractDependencyById<T, P> = T extends {plugin_id: P} ? T : never;
type DependencyMap<Dependencies extends readonly ExamPlugin[]> = {
  [P in DependencyIDs_t<Dependencies>[number]]: ExtractDependencyById<ElementTypes<Dependencies>, P>;
}

export interface ExamPluginRenderer<State_t extends SimpleJSON> {
  state: (ae: AssignedExam) => State_t,
  section_nav?: (as: AssignedSection) => string,
  section_right_column?: (as: AssignedSection) => {
    right_column_id: string,
    tab_header: (as: AssignedSection) => string,
    tab_content: (as: AssignedSection) => string,
  } | undefined
}

export interface ExamPluginRuntime<State_t extends SimpleJSON> {
  activate?(runtime_exam: RuntimeExam): void;
  loadState?(state: State_t): void;
  saveState?(): State_t;
  deactivate?(): void;
}

export abstract class Test<T extends readonly unknown[]> {
  public test(...args: T): void {
  }
};

let t!: Test<[string, number]>;
t.test("hello", 5);

export type RuntimePluginType<E extends ExamPlugin> = ReturnType<E["createRuntime"]>;
export type RuntimePluginTypes<Es extends readonly ExamPlugin[]> = {
  [P in keyof Es]: RuntimePluginType<Es[P]>;
}

export type ExamPlugin<State_t extends SimpleJSON = SimpleJSON, Dependencies extends readonly ExamPlugin<SimpleJSON, readonly ExamPlugin[]>[] = []> = {
  readonly plugin_id: string;
  readonly depends_on: Readonly<Dependencies>;

  createRenderer(): ExamPluginRenderer<State_t>;

  createRuntime(runtime_exam: RuntimeExam, ...deps: RuntimePluginTypes<Dependencies>): ExamPluginRuntime<State_t>;
};

// export function ExammaRayPlugin<State_t extends SimpleJSON, Dependencies extends readonly ExamPlugin[]>(plugin: ExamPlugin<State_t, Dependencies>) {
//   return plugin;
// }

// let testPlugin! : ExamPlugin<{url: string}, [typeof SectionReferencePlugin]>;
// testPlugin.createRuntime()

export type PluginCollection = {
  [plugin_id: string]: ExamPlugin | undefined
}

export function collect_plugins(plugins: readonly ExamPlugin[]) : PluginCollection {

  const plugins_by_id: PluginCollection = {};

  // Check plugins in order to ensure no duplicates
  // and dependencies are present before dependents
  for(const p of plugins) {
    // No duplicates
    if (plugins_by_id[p.plugin_id]) {
      throw new Error(`Duplicate plugin id: ${p.plugin_id}`);
    }
    // Verify dependencies
    p.depends_on?.forEach(dep => {
      if (!plugins_by_id[dep.plugin_id]) {
        throw new Error(`Plugin ${p.plugin_id} depends on missing plugin ${dep.plugin_id}`);
      }
    });
    plugins_by_id[p.plugin_id] = p;
  }

  return plugins_by_id;
}

// export type ExamPluginInstance<State_t extends SimpleJSON = SimpleJSON> = ExamPlugin<State_t> & State_t;

// export function instantiate_plugin<State_t extends SimpleJSON>(plugin: ExamPlugin<State_t>, initial_state: State_t) : ExamPluginInstance<State_t> {
//   return Object.assign(Object.create(plugin) as ExamPlugin<State_t>, copy(initial_state));
// }

// export function parse_plugin<State_t extends SimpleJSON>(plugin: ExamPlugin<State_t>, state_str: string) : ExamPluginInstance<State_t> {
//   return Object.assign(Object.create(plugin) as ExamPlugin<State_t>, JSON.parse(state_str));
// }

// export function stringify_plugin<State_t extends SimpleJSON>(plugin: ExamPluginInstance<State_t>) : string{
//   return Object.assign(Object.create(plugin) as ExamPlugin<State_t>, JSON.stringify(plugin));
// }