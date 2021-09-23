import chroma from 'chroma-js';



export function maxPrecisionString(points: number, precision: number) {
  // Note the unary + below drops extra .00 from the number because it implicitly converts
  // the string from .toFixed() back into a number
  return `${+points.toFixed(precision)}`;
}

export function renderFixedPrecisionBadge(points: number, precision: number, cssClass = "badge-primary") {
  // Note the unary + below drops extra .00 from the number because it implicitly converts
  // the string from .toFixed() back into a number
  return `<span class="badge ${cssClass}">${maxPrecisionString(points, precision)}</span>`;
}

export function renderScoreBadge(pointsEarned: number, pointsPossible: number, prefix: string = "") {
  let text = `${+pointsEarned.toFixed(2)}/${+pointsPossible.toFixed(2)}`;
  return `<span class="badge ${pointsPossible === 0 ? "badge-secondary" :
    pointsEarned === 0 ? "badge-danger" :
      pointsEarned < pointsPossible ? "badge-warning" :
        "badge-success"} examma-ray-score-badge">${prefix}${text}</span>`;
}

export function renderUngradedBadge(pointsPossible: number) {
  return `<span class="badge badge-secondary examma-ray-score-badge">?/${pointsPossible}</span>`;
}

export function renderNumBadge(num: number | string) {
  return `<span class="badge badge-secondary" style="width: 2.5em">${num}</span>`;
}

export function renderWideNumBadge(num: number | string) {
  return `<span class="badge badge-secondary" style="width: 6em">${num}</span>`;
}

export function renderPointsWorthBadge(num: number, cssClass: string = "badge-secondary", short = false) {
  let prefix = short ? "pt" : "point";
  return `<span class="badge ${cssClass}">${num} ${num === 1 ? prefix : prefix+"s"}</span>`;
}

export function renderShortPointsWorthBadge(num: number, cssClass: string = "badge-secondary") {
  return `<span class="badge ${cssClass}" style="min-width: 4em">${num} ${num === 1 ? "pt" : "pts"}</span>`;
}

let percentCorrectScale = chroma.scale(["#dc3545", "#ffc107", "#28a745"]).mode("lab");

export function renderPercentCorrectBadge(percent: number) {
  return `<span class="badge" style="background-color: ${percentCorrectScale(percent).hex()}; color: white;">${Math.floor(percent * 100)}%</span>`;
}

export function renderDynamicColoredScoreBadge(pointsEarned: number, pointsPossible: number) {
  // Note the unary + below drops extra .00 from the number because it implicitly converts
  // the string from .toFixed() back into a number
  return `<span class="badge" style="background-color: ${percentCorrectScale(pointsEarned / pointsPossible).hex()}; color: white;">${+pointsEarned.toFixed(2)}/${+pointsPossible.toFixed(2)}</span>`;
}

export function renderPointsProgressBar(pointsEarned: number, pointsPossible: number, text?: string) {
  // Note the unary + below drops extra .00 from the number because it implicitly converts
  // the string from .toFixed() back into a number
  let progressPercent = pointsPossible === 0 ? 100 : Math.max(1, Math.floor(100 * (pointsEarned / pointsPossible)));
  let color = progressPercent < 50 ? "white" : "white";
  text = text ?? `${+pointsEarned.toFixed(2)}/${+pointsPossible.toFixed(2)}`;
  return `<div style="display: inline-block; vertical-align: middle; margin: 2px;"><div class="progress">
    <div class="progress-bar" role="progressbar"
      style="width: ${progressPercent}%; background-color: ${percentCorrectScale(pointsEarned / pointsPossible).hex()}; color: ${color};
      overflow: visible;"
      aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
        ${text}
    </div>
  </div></div>`;
}

export function renderMultilinePointsProgressBar(pointsEarned: number, pointsPossible: number, text?: string) {
  // Note the unary + below drops extra .00 from the number because it implicitly converts
  // the string from .toFixed() back into a number
  let progressPercent = pointsPossible === 0 ? 100 : Math.max(1, Math.floor(100 * (pointsEarned / pointsPossible)));
  let color = progressPercent < 50 ? "white" : "white";
  text = text ?? `${+pointsEarned.toFixed(2)}/${+pointsPossible.toFixed(2)}`;
  return `<div style="display: inline-block; vertical-align: middle;"><div class="progress" style="height: unset; line-height: unset">
    <div class="progress-bar" role="progressbar"
      style="width: ${progressPercent}%; background-color: ${percentCorrectScale(pointsEarned / pointsPossible).hex()}; color: ${color};
      overflow: visible; white-space: pre;"
      aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">${text}</div>
  </div></div>`;
}

export function renderGradingProgressBar(numGraded: number, numAssigned: number) {
  let progressPercent = numAssigned === 0 ? 100 : Math.max(1, Math.floor(100 * (numGraded / numAssigned)));
  return `<div style="display: inline-block; vertical-align: middle;"><div class="progress">
    <div class="progress-bar" role="progressbar"
      style="width: ${progressPercent}%; color: white;
      overflow: visible;"
      aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
      ${numGraded}/${numAssigned}
    </div>
  </div></div>`;
}

export function renderPercentChosenProgressBar(numGraded: number, numAssigned: number) {
  let progressPercent = numAssigned === 0 ? 100 : Math.max(1, Math.floor(100 * (numGraded / numAssigned)));
  return `<div style="display: inline-block; vertical-align: middle;"><div class="progress">
    <div class="progress-bar" role="progressbar"
      style="width: ${progressPercent}%; color: white;
      overflow: visible;"
      aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
      ${numGraded}/${numAssigned}
    </div>
  </div></div>`;
}
