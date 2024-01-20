import deepEqual from "deep-equal";
import { mk2html } from "../core/render";
import { ExamComponentSkin } from "../core/skins";
import { asMutable, assert } from "../core/util";
import { GraderSpecificationFor } from "../graders/QuestionGrader";
import { BLANK_SUBMISSION, INVALID_SUBMISSION, MALFORMED_SUBMISSION } from "./common";
import { ResponseHandler, ResponseSpecificationDiff, ViableSubmission } from "./responses";
import { isNumericArray } from "./util";

/**
 * ## Multiple Choice Response Element Specification 
 * 
 * An Multiple Choice response provides several options that students select from. It may
 * be configured to allow only one choice (rendered as radio buttons) or multiple choice
 * (rendered as checkboxes).
 * 
 * The [[IFrameResponseSpecification]] type alias represents the information needed to specify an MC
 * response as part of a question.
 * 
 * Here's an example of a question with an MC response.
 * 
 * ![image](media://response-sample-mc.png)
 * 
 * ```typescript
 * export const Question_Sample_MC : QuestionSpecification = {
 *   question_id: "sample_mc",
 *   points: 2,
 *   mk_description:
 * `
 * This is a sample question. Which of the following is NOT a heirloom variety of tomato plant?
 * `,
 *   response: {
 *     kind: "multiple_choice",
 *     choices: [
 *       "Green Zebra",
 *       "Better Boy",
 *       "Black Krim",
 *       "Mr. Stripey",
 *       "Brandywine"
 *     ],
 *     multiple: false,
 *     default_grader: new SimpleMCGrader(1)
 *   }
 * }
 * ```
 * 
 * ### Single or Multiple Response
 * 
 * If the `multiple` property is set to `false`, choices are rendered as radio buttons and
 * students may only select a single choice. If the property is set to `true`, choices are
 * rendered as checkboxes and students may select any number of choices.
 * 
 * A multiple-selection MC question may specify a limit for the number of checkboxes
 * that may be selected via the `limit` property. (This property is ignored if multiple
 * selections are not allowed.)
 * 
 * ### MC Submissions
 * 
 * Essentially, a submission for an MC response is an array of numbers corresponding to the indices
 * of selected choices. See [[`IFrameSubmission`]] for details.
 */
export type IFrameResponseSpecification = {

  /**
   * The discriminant `"iframe"` is used to distinguish iframe response specifications.
   */
  kind: "iframe";

  /**
   * The relative src where the iframe .html may be found. For example,
   * if it is included as an exam-wide asset, it might be "assets/whatever.html".
   */
  src: string,

  /**
   * A class (or space-separated list of classes) that will be set
   * on the iframe element.
   */
  element_class?: string,

  /**
   * CSS styling to be applied to the iframe element.
   */
  element_style?: string,

  /**
   * A sample solution, which may not be blank or invalid.
   */
  sample_solution?: ViableSubmission<IFrameSubmission>;

  /**
   * A default grader, used to evaluate submissions for this response.
   */
  default_grader?: GraderSpecificationFor<"iframe">
};

export type IFrameSubmission = {} | typeof INVALID_SUBMISSION | typeof BLANK_SUBMISSION;

function IFRAME_PARSER(rawSubmission: string | null | undefined) : IFrameSubmission | typeof MALFORMED_SUBMISSION {
  if (rawSubmission === undefined || rawSubmission === null || rawSubmission.trim() === "") {
    return BLANK_SUBMISSION;
  }

  try {
    let parsed : {} | [] | string | number | boolean | null = JSON.parse(rawSubmission);
    if ( !(typeof parsed === "object") || parsed === null || Array.isArray(parsed) ) {
      return MALFORMED_SUBMISSION;
    }

    return Object.keys(parsed).length > 0 ? parsed : BLANK_SUBMISSION
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

function IFRAME_RENDERER(response: IFrameResponseSpecification, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  return `
    <div style="text-align: center;">
      <iframe id="iframe-response-${question_uuid}-${skin?.skin_id}" src="${response.src}" class="${response.element_class ?? ""}" style="${response.element_style ?? ""}"></iframe>
    </div>
  `;
}

function IFRAME_SOLUTION_RENDERER(response: IFrameResponseSpecification, orig_solution: IFrameSubmission, question_id: string, question_uuid: string, skin?: ExamComponentSkin) {
  
  return IFRAME_RENDERER(response, question_id, question_uuid, skin);
}

type IFrameResponseMessage = {
  message_kind: "ready";
} | {
  message_kind: "update";
  submission: string;
}

class IFrameResponse {
  public readonly is_ready: boolean;
  public readonly iframe_window: Window;
  public readonly submission: IFrameSubmission;

  private current_timeout: number | undefined;

  public constructor(iframe_window: Window) {
    this.is_ready = false;
    this.iframe_window = iframe_window
    this.submission = "";
    this.current_timeout = undefined;

    // Note this is called on "window" and not the "iframe_window"
    window.addEventListener("message", (event) => {
      // ignore messages from anything else
      if (event.source !== this.iframe_window) {
        return;
      }
      
      // ignore spurious messages
      if (!event.data["examma_ray_message"]) {
        return;
      }

      this.receiveMessage(event.data["examma_ray_message"]);
    });
  }

  public receiveMessage(msg: IFrameResponseMessage) {
    if (msg.message_kind === "ready") {
      asMutable(this).is_ready = true;
    }
    else if (msg.message_kind === "update") {
      asMutable(this).submission = msg.submission;
    }
  }

  public setSubmission(submission: IFrameSubmission) {

    asMutable(this).submission = submission;

    if (this.current_timeout) {
      window.clearTimeout(this.current_timeout);
      this.current_timeout = undefined;
    }

    if (this.is_ready) {
      this.iframe_window.postMessage({
        examma_ray_message: {
          message_kind: "set_submission",
          submission: submission
        }
      });
    }
    else {
      this.current_timeout = window.setTimeout(() => this.setSubmission(submission), 1000);
    }
  }

};

function IFRAME_ACTIVATE(responseElem: JQuery, is_sample_solution: boolean) {
  const iframe_window = responseElem.find("iframe")[0].contentWindow;
  assert(iframe_window, "unable to find iframe");

  responseElem.data("iframe_response", new IFrameResponse(iframe_window));
}

function IFRAME_EXTRACTOR(responseElem: JQuery) : IFrameSubmission {
  
  const iframe_window = responseElem.find("iframe")[0].contentWindow;
  assert(iframe_window, "unable to find iframe");

  let iframe_response = <IFrameResponse>(responseElem.data("iframe_response"));

  if (iframe_response.submission === "") {
    return BLANK_SUBMISSION;
  }

  return iframe_response.submission;
}

function IFRAME_FILLER(responseElem: JQuery, submission: IFrameSubmission) {
  
  const iframe_window = responseElem.find("iframe")[0].contentWindow;
  assert(iframe_window, "unable to find iframe");

  let iframe_response = <IFrameResponse>(responseElem.data("iframe_response"));

  if (submission !== BLANK_SUBMISSION && submission !== INVALID_SUBMISSION) {
    iframe_response.setSubmission(submission);
  }
}

function IFRAME_DIFF(r1: IFrameResponseSpecification, r2: IFrameResponseSpecification) : ResponseSpecificationDiff {
  if (r1.kind !== r2.kind) {
    return { incompatible: true };
  }

  return {
    structure: false,
    content: false,
    default_grader:
      !deepEqual(r1.default_grader, r2.default_grader, {strict: true}),
    sample_solution:
      !deepEqual(r1.sample_solution, r2.sample_solution, {strict: true}),
    format:
      r1.element_class !== r2.element_class || r1.element_style !== r2.element_style,
  };
}

export const IFRAME_HANDLER : ResponseHandler<"iframe"> = {
  parse: IFRAME_PARSER,
  render: IFRAME_RENDERER,
  render_solution: IFRAME_SOLUTION_RENDERER,
  activate: IFRAME_ACTIVATE,
  extract: IFRAME_EXTRACTOR,
  fill: IFRAME_FILLER,
  diff: IFRAME_DIFF
};