// import type { AssignedSection } from "../../src/core";
// import { SimpleJSON } from "../../src/core/util";
// import type { RuntimeExam } from "../runtime_exam";
// import copy, { State } from "fast-copy";

// export type PluginRenderer<State_t extends SimpleJSON> = {
//   section_nav?: (this: State_t, s: AssignedSection) => string,
//   section_right_column?: (this: State_t, s: AssignedSection) => {
//     right_column_id: string,
//     tab_header: (this: State_t, s: AssignedSection) => string,
//     tab_content: (this: State_t, s: AssignedSection) => string,
//   } | undefined
// }

// export type ExamPlugin<State_t extends SimpleJSON = {}, Dependencies extends readonly ExamPlugin[] = []> = {
//   plugin_id: string,
//   depends_on?: [...Dependencies],
//   render: PluginRenderer<State_t>,
//   activate?: (runtime_exam: RuntimeExam, initial_state: State_t) => void,
// };

// export type PluginCollection = {
//   [plugin_id: string]: ExamPlugin | undefined
// }

// export function collect_plugins(plugins: readonly ExamPlugin[]) : PluginCollection {

//   const plugins_by_id: PluginCollection = {};

//   // Check plugins in order to ensure no duplicates
//   // and dependencies are present before dependents
//   for(const p of plugins) {
//     // No duplicates
//     if (plugins_by_id[p.plugin_id]) {
//       throw new Error(`Duplicate plugin id: ${p.plugin_id}`);
//     }
//     // Verify dependencies
//     p.depends_on?.forEach(dep => {
//       if (!plugins_by_id[dep.plugin_id]) {
//         throw new Error(`Plugin ${p.plugin_id} depends on missing plugin ${dep.plugin_id}`);
//       }
//     });
//     plugins_by_id[p.plugin_id] = p;
//   }

//   return plugins_by_id;
// }

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