import { encode } from "he";
import { QuestionGrader } from "../QuestionGrader";
import { applySkin, mk2html } from "../render";
import { QuestionSkin } from "../skins";
import { assert } from "../util";
import { BLANK_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import Sortable from "sortablejs";

export type DroppableSpecification = {
  [index: string]: string
};

// export type DroppableGroupSpecification = {
//   group: string,
//   members: DroppableSpecification
// };

export type FITBDropSpecification = {
  kind: "fitb_drop";
  content: string;
  droppables: DroppableSpecification /* | [DroppableGroupSpecification] */;
  starter?: Exclude<FITBDropSubmission, typeof BLANK_SUBMISSION>;
  sample_solution?: Exclude<FITBDropSubmission, typeof BLANK_SUBMISSION>;
  default_grader?: QuestionGrader<"fitb_drop", any>;
};

export type DropSubmission = {
  id: string,
  children?: (string | DropSubmission)[]
}[];

export type FITBDropSubmission = (string | DropSubmission)[] | typeof BLANK_SUBMISSION;


function isValidFITBDropSubmission(obj: any) : obj is Exclude<FITBDropSubmission, typeof BLANK_SUBMISSION> {
  return Array.isArray(obj) && obj.every(
    elem =>
      typeof elem === "string" ||
      Array.isArray(elem) && elem.every(d =>
        typeof d.id === "string" ||
        Array.isArray(d.children) && d.children.every((e: any) => typeof e === "string" || isValidFITBDropSubmission(e))
      )
  )
}

function FITB_DROP_PARSER(rawSubmission: string | null | undefined) : FITBDropSubmission | typeof MALFORMED_SUBMISSION {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  try {
    let parsed = JSON.parse(rawSubmission);
    if (isValidFITBDropSubmission(parsed)) {
      return parsed.length > 0 ? parsed : BLANK_SUBMISSION;
    }
    else {
      return MALFORMED_SUBMISSION;
    }
  }
  catch(e) {
    if (e instanceof SyntaxError) {
      return MALFORMED_SUBMISSION;
    }
    else {
      throw e;
    }
  }
}

function createDroppableElement(id: string, html: string) {
  // Note: important to not leave any extra whitespace in the format string below,
  // otherwise, droppables may mysteriously have extra whitespace if dropped within
  // a pre-formatted context (this behavior seems to be a bit inconsistent between
  // browsers...firefox rendered the extra whitespace, whereas chrome/edge did not)
  return `<div class="examma-ray-fitb-droppable" data-examma-ray-fitb-drop-id="${id}">${html}</div>`
}

function FITB_DROP_RENDERER(response: FITBDropSpecification, question_id: string, question_uuid: string, skin?: QuestionSkin) {
  let group_id = question_id;
  return `
    <div class="examma-ray-fitb-drop-originals" data-examma-ray-fitb-drop-group-id="${group_id}">
      ${Object.keys(response.droppables).map(
        id => createDroppableElement(id, createFilledFITBDrop(response.droppables[id], response.droppables, group_id, skin))
      ).join("")}
    </div>
    ${createFilledFITBDrop(applySkin(response.content, skin), response.droppables, group_id, skin, response.starter)}
  `;
}

function FITB_DROP_ACTIVATE(responseElem: JQuery) {

  activateDropLocations(responseElem);

  // Fill each bank element with copies of the hidden originals.
  // This comes after activating sortablejs on the individual elements,
  // since we don't want that to happen for nested drop locations within a bank.
  let originals = responseElem.find(".examma-ray-fitb-drop-originals").first();
  let group_id = originals.data("examma-ray-fitb-drop-group-id");
  $(`.examma-ray-fitb-drop-bank[data-examma-ray-fitb-drop-group-id='${group_id}']`).each(function() {
    let bank = $(this);
    originals.children().each(function() {
      bank.append($(this).clone());
    });

    // Activate sortablejs for the bank overall
    Sortable.create(bank[0], {
      swapThreshold: 0.2,
      group: {
        name: `group-${group_id}`,
        pull: "clone",
        put: () => { return false; }
      },
      sort: false,
      animation: 150,
      // TODO
      onClone: evt => activateDropLocations($(evt.item))
    });
  });

}

function groupsMatch(to: Sortable, from: Sortable) {
  let to_group_name = typeof to.options.group === "string" ? to.options.group : to.options.group?.name;
  let from_group_name = typeof from.options.group === "string" ? from.options.group : from.options.group?.name;
  return to_group_name === from_group_name; // also covers undefined === undefined case
}

function activateDropLocations(elem: JQuery<HTMLElement>) {
  elem.find(".examma-ray-fitb-drop-location").each(function() {
    Sortable.create(this, {
      swapThreshold: 0.2,
      animation: 150,
      group: {
        name: `group-${$(this).data("examma-ray-fitb-drop-group-id")}`,
        put: (to: Sortable, from: Sortable) => {
          return groupsMatch(to, from) // drop group ids must match
            && elem.closest("#bank").length === 0; // not dropping into a nested drop location in a bank element
        },
        pull: true
      },
      removeOnSpill: true
    });
  });
}

function getFirstLevelFITBDropElements(responseElem: JQuery<HTMLElement>) {
  return responseElem.find("input, textarea, .examma-ray-fitb-drop-location")
    .filter(function () {
      // Exclude elements that are nested inside an .examma-ray-fitb-drop-location element. Those
      // will be explored via the recursion below to properly populate the "children" array for a drop location.
      if ($(this).parentsUntil(responseElem, ".examma-ray-fitb-drop-location").length !== 0) {
        return false;
      }

      // Exclude elements that are inside of the hidden original droppables element
      if($(this).parentsUntil(responseElem, ".examma-ray-fitb-drop-originals").length !== 0) {
        return false;
      }

      // Exclude elements that are inside of a drop bank
      if($(this).parentsUntil(responseElem, ".examma-ray-fitb-drop-bank").length !== 0) {
        return false;
      }

      return true;
    })
    .get();
}

function extractHelper(responseElem: JQuery) : Exclude<FITBDropSubmission, typeof BLANK_SUBMISSION>{
  return getFirstLevelFITBDropElements(responseElem).map((elem: HTMLElement) => {
      let v: string | DropSubmission;
      if ($(elem).hasClass("examma-ray-fitb-drop-location")) {
        // Cases where we're looking at the element for a drop location. We
        // find all direct children that are droppables, then map over them
        // to extract their id and any children they hold recursively.
        v = $(elem).children(".examma-ray-fitb-droppable").get().map((elem: HTMLElement) => {
          return {
            id: "" + $(elem).data("examma-ray-fitb-drop-id"),
            children: extractHelper($(elem))
          };
        });
      }
      else {
        // Cases where we selected an input or textarea element. Extract its
        // value as a string.
        v = "" + ($(elem).val() ?? "");
        v = v.trim() === "" ? "" : v;
      }
      return v;
    });
}

function FITB_DROP_EXTRACTOR(responseElem: JQuery) {
  let filledResponses = extractHelper(responseElem);
  return filledResponses.every(resp => resp === "" || Array.isArray(resp) && resp.length === 0) ? BLANK_SUBMISSION : filledResponses;
}

function FITB_DROP_FILLER(responseElem: JQuery, submission: FITBDropSubmission) {

  if (submission === BLANK_SUBMISSION) {
    // blank out all the blanks/boxes
    responseElem.find("input, textarea").val("");
    
    // empty the drop locations
    responseElem.find(".examma-ray-fitb-drop-location").empty();

    return;
  }

  fillerHelper(responseElem, submission, responseElem.find(".examma-ray-fitb-drop-originals"));
}

export const FITB_DROP_HANDLER = {
  parse: FITB_DROP_PARSER,
  render: FITB_DROP_RENDERER,
  activate: FITB_DROP_ACTIVATE,
  extract: FITB_DROP_EXTRACTOR,
  fill: FITB_DROP_FILLER
};

function fillerHelper(elem: JQuery, submission: Exclude<FITBDropSubmission, typeof BLANK_SUBMISSION>, originalsElem: JQuery) {

  let elems = getFirstLevelFITBDropElements(elem);
  assert(elems.length === submission.length);
  submission.forEach((sub, i) => typeof sub === "string"
    ? $(elems[i]).val(sub) // just set value if it was a blank/box
    : fillDropLocation($(elems[i]), sub, originalsElem)
  );
}

function fillDropLocation(dropLocationElem: JQuery, sub: DropSubmission, originalsElem: JQuery) {

  // clear out previous submission elements
  dropLocationElem.empty();

  sub.forEach(s => { // Alternative if it's a dropped submission

    // Create a clone of the element we recorded they had dropped in
    let droppedElem = cloneFromOriginals(originalsElem, s.id);

    dropLocationElem.append(droppedElem);
    activateDropLocations(droppedElem);
    
    // Recursively process any children on the dropped element/submission
    fillerHelper(droppedElem, s.children || [], originalsElem);
  });
}

function cloneFromOriginals(originalsElem: JQuery, id: string) {
  return originalsElem.find(`[data-examma-ray-fitb-drop-id='${id}']`).clone();
}

/**
 * Matches anything that looks like e.g. ___BLANK___ or _____Blank_____.
 */
const BLANK_PATTERN = /_+ *blank *_+/gi;

/**
 * Matches anything that looks like e.g. [[BOX\n\n\n\n\n__________]] or [[Box\n\n]].
 * Those are real newlines, and at least 1 is required.
 */
const BOX_PATTERN = /\[\[[ _]*box[ _]*( *\n)+ *\]\]/gi;

/**
 * Matches anything that looks like e.g. [[DROP\n\n\n\n\n__________] or [[Drop\n\n]].
 * Those are real newlines, and at least 1 is required.
 */
const DROP_LOCATION_PATTERN = /\[\[[ _]*drop[ _]*( *\n)* *\]\]/gi;

/**
 * Matches anything that looks like e.g. _DROP_BANK_ or _____drop_bank_____.
 */
const DROP_BANK_PATTERN = /_+ *drop_bank *_+/gi;

function count_char(str: string, c: string) {
  let count = 0;
  for(let i = 0; i < str.length; ++i) {
    if (str[i] === c) { ++count; }
  }
  return count;
}

export function createFilledFITBDrop(
  content: string,
  dropOriginals: {[index: string]: string},
  group_id: string,
  skin?: QuestionSkin,
  submission?: FITBDropSubmission,
  blankRenderer = DEFAULT_BLANK_RENDERER,
  boxRenderer = DEFAULT_BOX_RENDERER,
  dropLocationRenderer = DEFAULT_DROP_LOCATION_RENDERER,
  dropBankRenderer = DEFAULT_DROP_BANK_RENDERER,
  encoder: (s:string)=>string = encode) {

  // count the number of underscores in each blank pattern
  let blankLengths = content.match(BLANK_PATTERN)?.map(m => count_char(m, "_")) ?? [];

  // count the number of newlines and underscores in each box pattern (will be number of lines in textarea)
  let boxLines = content.match(BOX_PATTERN)?.map(m => 1+count_char(m, "\n")) ?? [];
  let boxWidths = content.match(BOX_PATTERN)?.map(m => count_char(m, "_")) ?? [];

  // count the number of newlines and underscores in each box pattern (will be max number of drops allowed in that box)
  let dropLocationLines = content.match(DROP_LOCATION_PATTERN)?.map(m => 1+count_char(m, "\n")) ?? [];
  let dropLocationWidths = content.match(DROP_LOCATION_PATTERN)?.map(m => count_char(m, "_")) ?? [];
  
  // Replace blanks/boxes with an arbitrary string that won't mess with
  // the way the markdown is rendered
  let blank_id = "da3c7c73824142bba052a47165dff342";
  let box_id = "b3bc36eb6f8b47d1b45bc74c0aa8abc4";
  let drop_box_id = "c1f10a2d58234882aeaf0f528a35aba3";
  let drop_bank_id = "ef36c45b04ac41debe12533f4bb194eb";
  content = content.replace(BLANK_PATTERN, blank_id);
  content = content.replace(BOX_PATTERN, box_id);
  content = content.replace(DROP_LOCATION_PATTERN, drop_box_id);
  content = content.replace(DROP_BANK_PATTERN, drop_bank_id);

  // Render markdown
  content = mk2html(content, skin);

  // Include this in the html below so we can replace it in a moment
  // with the appropriate submission values
  let submission_placeholder = "awvblrefafhawonawflawlek";

  // Replace each of the "blank ids" in the rendered html with
  // a corresponding input element of the right size based on the
  // number of underscores that were originally in the "__BLANK__"
  blankLengths.forEach(length => {
    content = content.replace(blank_id, blankRenderer(submission_placeholder, length))
  });

  // Replace each of the "box ids" in the rendered html with
  // a corresponding textarea element with the right # of lines based on the
  // number of newlines that were originally in the "[[BOX\n\n\n]]"
  boxLines.forEach((lines, i) => {
    content = content.replace(box_id, boxRenderer(submission_placeholder, lines, boxWidths[i]));
  });

  dropLocationLines.forEach((lines, i) => {
    content = content.replace(drop_box_id, dropLocationRenderer(submission_placeholder, group_id, lines, dropLocationWidths[i]));
  });

  // Replace each drop bank
  content = content.replace(new RegExp(drop_bank_id, "g"), dropBankRenderer(group_id));

  // Replace placeholders with submission values
  if (submission && submission !== BLANK_SUBMISSION) {
    submission.forEach(sub => content = content.replace(submission_placeholder,
      typeof sub === "string"
       ? encoder(sub)
       : sub.map(s => {
          assert(dropOriginals[s.id], `Cannot find drop item with ID ${s.id}.`);
          return createDroppableElement(s.id, createFilledFITBDrop(dropOriginals[s.id], dropOriginals, group_id, skin, s.children, blankRenderer, boxRenderer, dropLocationRenderer))
       }).join("")
      )
    );
  }

  // Replace any remaining placeholders that weren't filled (or all of them if there was no submission)
  content = content.replace(new RegExp(submission_placeholder, "g"), "");

  return content;
}

function DEFAULT_BLANK_RENDERER(submission_placeholder: string, length: number) {
  let autoAttrs = `autocomplete="off" autocorrect="off" spellcheck="false"`;
  return `<input type="text" value="${submission_placeholder}" size="${length}" maxlength="${length}" ${autoAttrs} class="examma-ray-fitb-blank-input nohighlight"></input>`;
}

function DEFAULT_BOX_RENDERER(submission_placeholder: string, lines: number, width: number) {
  let rcAttrs = `rows="${lines}"${width !== 0 ? ` cols="${width}"` : ""}`;
  let autoAttrs = `autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false"`;
  let style = `style="resize: none; overflow: auto;${width === 0 ? " width: 100%;" : ""}"`;
  return `<textarea ${rcAttrs} ${autoAttrs} class="examma-ray-fitb-box-input nohighlight" ${style}>${submission_placeholder}</textarea>`;
}

function DEFAULT_DROP_LOCATION_RENDERER(submission_placeholder: string, group_id: string, lines: number, width: number) {
  let style = `style="min-width: ${width}ch; min-height: ${3 * lines}ch"`;
  return `<span class="examma-ray-fitb-drop-location" data-examma-ray-fitb-drop-group-id="${group_id}" ${style}>${submission_placeholder}</span>`;
}

function DEFAULT_DROP_BANK_RENDERER(group_id: string) {
  return `<div class="examma-ray-fitb-drop-bank" data-examma-ray-fitb-drop-group-id="${group_id}"></div>`;
}

export function renderFITBDropBank(group_id: string) {
  return DEFAULT_DROP_BANK_RENDERER(group_id);
}