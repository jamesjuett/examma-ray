import avatar from 'animal-avatar-generator';
import type { AssignedSection } from "../src/core";
import { ExamPlugin } from '../src/core/plugin';
import { SectionReferencePlugin } from './SectionReference';

const BACKGROUND_COLORS = [
  "#F8EDEB",
  "#f7c0c4",
  "#E3FDFD",
  "#E0BBE4",
  "#D5E1DF",
  "#f4eea6",
  "#f7a29c",
  "#e4b48f",
  "#567db8",
  "#9da0f8",
  "#639b6d",
  "#a698c8",
  "#3B3B58",
  "#354F52",
  "#6e707b",
  "#5E548E",
  "#426879",
  "#ad7da2",
];

const AVATAR_COLORS = [
  "#FFB703",
  "#FB8500",
  "#219EBC",
  "#FF6B6B",
  "#b38aed",
  "#FF7F50",
  "#ae55f7",
  "#90BE6D",
  "#F4A261",
  "#FFC300",
  "#FF9F1C",
  "#E63946",
  "#8AC926",
  "#F7B32B",
  "#FFCF56",
  "#EF476F",
  "#06D6A0",
  "#73C2FB",
  "#FFD166",
  "#F9C74F",
  "#6CCFF6",
  "#F28482",
  "#A9DEF9",
  "#FFADAD",
  "#C4E538",
  "#FFC8A2",
  "#D8A7CA",
  "#B5E48C",
];

function create_animal_avatar(seed: string, size: number) {
  const avatar_html = avatar(seed, {
    size: size,
    blackout: true,
    avatarColors: AVATAR_COLORS,
    backgroundColors: BACKGROUND_COLORS,
  });

  return `<span class="examma-ray-avatar-container"><span class="examma-ray-avatar">
    ${avatar_html}
  </span></span>`
};


// type CommunityPluginOptions = {
//   url: string
// };

// export class CommunityPluginRuntime {
//   deactivate?(): void;
//   foo(): string {
//     return "foo";
//   }
// }

// export type CommunityPlugin = ExamRendererPlugin<CommunityPluginParams, CommunityPluginState>;

// export function COMMUNITY_PLUGIN(url: string) : CommunityPlugin {
//   return {
//     plugin_id: "community",
//     render: {
//       initial_state: () => ({url: url}),
//       section_right_column: () => ({
//         right_column_id: "community",
//         tab_header: () => "Community",
//         tab_content: function(as: AssignedSection) {
//           return `
//             <div>
//               <h6>Community (Section ${as.displayIndex})</h6>
//               test
//               ${url}
              
//               <div style="display: flex">
//                 ${new Array(14).fill(0).map((x,i) => `${create_animal_avatar(""+i, 30)}`).join("\n")}
//               </div>
//             </div>
//           `;
//         }
//       })
//     },
//   }
// };

export type CommunityPluginOptions = {
  url: string
};

type CommunityPluginState = {};

export class CommunityPlugin implements ExamPlugin<CommunityPluginOptions, CommunityPluginState> {
  public static readonly plugin_id = "community";
  public readonly plugin_id = CommunityPlugin.plugin_id;
  public readonly dependencies = [SectionReferencePlugin.plugin_id];
  
  public readonly options: Readonly<CommunityPluginOptions>;

  public constructor(options: CommunityPluginOptions) {
    this.options = options;
  }

  public initial_state() {
    return {test: "test"}
  }

  public renderer = {
    config: () => this.options,
    initial_state: () => ({}),
    section_right_column: (as: AssignedSection) => ({
      right_column_id: "community",
      tab_header: "Community",
      tab_content: `
        <div>
          <h6>Community (Section ${as.displayIndex})</h6>
          test
          ${this.options.url}
          
          <div style="display: flex">
            ${new Array(14).fill(0).map((x,i) => `${create_animal_avatar(""+i, 30)}`).join("\n")}
          </div>
        </div>
      `
    })
  }
};