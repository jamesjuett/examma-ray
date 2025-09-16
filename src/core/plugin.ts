import toposort from "toposort";
import type { ExamRendererPlugin } from "./exam_renderer";
import { assertExists, assertFalse } from "./util";

export interface ExamPlugin<Config_t extends {} = {}, State_t extends {} = {}> {
  readonly plugin_id: string;
  readonly dependencies: readonly string[];
  // readonly options_type_validator: Type<Options_t>;
  // readonly state_type_validator: Type<State_t>;
  readonly renderer?: ExamRendererPlugin<Config_t, State_t>;
};

export type PluginCollection = {
  readonly ordered: readonly ExamPlugin[];
  readonly by_id: { [plugin_id: string]: ExamPlugin | undefined };
};

export function NO_PLUGINS() : PluginCollection {
  return { ordered: [], by_id: {} };
}

export function PLUGINS(plugins: readonly ExamPlugin[]) : PluginCollection {

  // Ensure plugins are unique
  const plugin_map = new Map<string, ExamPlugin>();
  for(const plugin of plugins) {
    if (plugin_map.has(plugin.plugin_id)) {
      assertFalse(`Duplicate plugin id: ${plugin.plugin_id}.`);
    }
    plugin_map.set(plugin.plugin_id, plugin);
  }

  // Ensure dependencies are present
  for(const plugin of plugins) {
    for(const dep_id of plugin.dependencies) {
      if (!plugin_map.get(dep_id)) {
        assertFalse(`Plugin ${plugin.plugin_id} depends on missing plugin ${dep_id}.`);
      }
    }
  }

  // Create an edge for each dependency/plugin pair. The dependency
  // must come first, so the edge goes from dependency to plugin.
  // (Because we confirmed earlier that all instances with the same ID are
  // indeed the same object, it's fine to do the sort based on objects instances)
  const edges = plugins.flatMap(
    plugin => plugin.dependencies.map(
      dep_id => [dep_id, plugin.plugin_id] as [string, string]
    )
  );

  const sorted = toposort(edges);
  
  // Any that weren't included in the sort (e.g. have no dependencies and
  // nothing depends on them) can just be added at the end in any order.
  for(const plugin of plugins) {
    if (!sorted.includes(plugin.plugin_id)) {
      sorted.push(plugin.plugin_id);
    }
  }

  return {
    ordered: toposort(edges).map(plugin_id => assertExists(plugin_map.get(plugin_id))),
    by_id: Object.fromEntries(plugin_map),
  };
}
