import type { ExamRenderer } from "../../src/core";
import { ExamPlugin } from "../../src/core/plugin";
import type { RuntimeExam } from "../runtime_exam";

export interface ExamPluginRuntime<State_t extends {} = {}> {
  readonly plugin: ExamPlugin;
  // readonly state_type_validator: Type<State_t>;
  activate?(runtime_exam: RuntimeExam, dependencies: Record<string, ExamPluginRuntime>) : void;
  attach? (exam_renderer: ExamRenderer) : void;
  // loadState?(state: State_t): void;
  // saveState?(): State_t;
  deactivate?(): void;
};

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