import type { AssignedSection } from "../src/core";
import type { ExamPlugin } from "../src/core/plugin";

export class SectionReferencePlugin implements ExamPlugin<{}, {}> {
  public static readonly plugin_id = "section-reference";
  public readonly plugin_id = SectionReferencePlugin.plugin_id;
  public readonly dependencies = [];

  public renderer = {
    config: () => ({}),
    initial_state: () => ({}),
    section_right_column: (as: AssignedSection) => as.html_reference ? {
      right_column_id: "reference",
      tab_header: "Reference",
      tab_content: `
        <div class="examma-ray-section-reference">
          <h6>Reference Material (Section ${as.displayIndex})</h6>
          ${as.html_reference}
        </div>
      `
    } : undefined
  }
};


