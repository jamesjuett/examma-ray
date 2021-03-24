import { ResponseKind } from "./response/common";
import chroma from 'chroma-js'

export type QuestionAnswer = {
  id: string;
  display_index: string;
  kind: ResponseKind;
  response: string;
};

export type SectionAnswers = {
  id: string;
  display_index: string;
  questions: QuestionAnswer[];
};

export type ExamAnswers<V extends boolean = boolean> = {
  exam_id: string;
  student: {
    uniqname: string,
    name: string
  },
  timestamp: number;
  validated: V;
  sections: SectionAnswers[];
};

export type TrustedExamAnswers = ExamAnswers<true>;

/**
 * Fills in the (presumed blank) question responses in the provided manifest
 * with the student submitted answers for the questions with corresponding IDs.
 * This should always be used with manifests loaded from the saved manifest files
 * created on exam generation, since otherwise students could just e.g. change
 * the question IDs, point values, etc. in their submitted answers file.
 * This changes the provided manifest object and returns it (casted to a `TrustedExamAnswers`)
 */
export function fillManifest(manifest: ExamAnswers, submitted: ExamAnswers) : TrustedExamAnswers {
  let submittedMap : {[index: string]: string} = {};
  submitted.sections.forEach(s => s.questions.forEach(q => submittedMap[q.id] = q.response));
  manifest.sections.forEach(s => s.questions.forEach(q => q.response = submittedMap[q.id]));
  manifest.validated = true;
  return <TrustedExamAnswers>manifest;
}




export function renderScoreBadge(pointsEarned: number, pointsPossible: number) {
  let text = `${+pointsEarned.toFixed(2)}/${+pointsPossible.toFixed(2)}`;
  return `<span class="badge ${pointsPossible === 0 ? "badge-secondary" :
      pointsEarned === 0 ? "badge-danger" :
      pointsEarned < pointsPossible ? "badge-warning" :
      "badge-success"
    } examma-ray-score-badge">${text}</span>`;
}

export function renderUngradedBadge(pointsPossible: number) {
  return `<span class="badge badge-secondary examma-ray-score-badge">?/${pointsPossible}</span>`;
}

export function renderNumBadge(num: number | string) {
  return `<span class="badge badge-secondary" style="width: 2.5em">${num}</span>`
}

export function renderPointsWorthBadge(num: number, cssClass: string = "badge-secondary") {
  return `<span class="badge ${cssClass}">${num} ${num === 1 ? "point" : "points"}</span>`
}

let percentCorrectScale = chroma.scale(["#dc3545", "#ffc107", "#28a745"]).mode("lab");

export function renderPercentCorrectBadge(percent: number) {
  return `<span class="badge" style="background-color: ${percentCorrectScale(percent).hex()}; color: white;">${Math.floor(percent * 100)}%</span>`
}

export function renderDynamicColoredScoreBadge(pointsEarned: number, pointsPossible: number) {
  // Note the unary + below drops extra .00 from the number because it implicitly converts
  // the string from .toFixed() back into a number
  return `<span class="badge" style="background-color: ${percentCorrectScale(pointsEarned/pointsPossible).hex()}; color: white;">${+pointsEarned.toFixed(2)}/${+pointsPossible.toFixed(2)}</span>`
}

export function renderPointsProgressBar(pointsEarned: number, pointsPossible: number, text?: string) {
  // Note the unary + below drops extra .00 from the number because it implicitly converts
  // the string from .toFixed() back into a number
  let progressPercent = pointsPossible === 0 ? 100 : Math.max(1, Math.floor(100 * (pointsEarned/pointsPossible)));
  let color = progressPercent < 50 ? "white" : "white";
  text = text ?? `${+pointsEarned.toFixed(2)}/${+pointsPossible.toFixed(2)}`;
  return `<div style="display: inline-block; vertical-align: middle;"><div class="progress">
    <div class="progress-bar" role="progressbar"
      style="width: ${progressPercent}%; background-color: ${percentCorrectScale(pointsEarned/pointsPossible).hex()}; color: ${color};
      overflow: visible;"
      aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
        ${text}
    </div>
  </div></div>`;
}