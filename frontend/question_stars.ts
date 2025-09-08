
import { FILLED_STAR } from '../src/core/icons';

class QuestionStarList {

  private readonly starMarkedMap: { [question_uuid: string]: QuestionStar };

  public constructor() {
    this.starMarkedMap = {};
  }

  /**
   * newStarElementForQuestion returns a clickable star that is tied to a question.
   *
   * Like with QuestionStar.newStarElement(), the stars produced from the same UUID
   * are all connected and will toggle on and off together.
   *
   * @param question_uuid The corresponding question's UUID
   */
  public newStarElementForQuestion(question_uuid: string): JQuery<HTMLElement> {
    if (question_uuid in this.starMarkedMap) {
      return this.starMarkedMap[question_uuid].newStarElement();
    } else {
      let star = new QuestionStar(question_uuid, false);
      this.starMarkedMap[question_uuid] = star;
      return star.newStarElement();
    }
  }
}

class QuestionStar {

  private readonly question_uuid: string;
  private marked: boolean;

  // keeps track of every element issued by newStarElement()
  private readonly star_elements: JQuery<HTMLElement>[];

  public constructor(question_uuid: string, marked: boolean) {
    this.question_uuid = question_uuid;
    this.marked = marked;
    this.star_elements = [];
  }

  /**
   * newStarElement returns a new HTML element with a clickable star.
   *
   * All stars produced by this QuestionStar object are 'connected',
   * such that clicking any one will update all the others.
   */
  public newStarElement(): JQuery<HTMLElement> {
    let star = $(
      `<span class="examma-ray-question-star">
        ${FILLED_STAR}
      </span>`
    );

    star.on("click", this.toggle.bind(this))
    this.star_elements.push(star);
    return star;
  }

  private toggle() {
    this.marked = !this.marked;

    // Update every star element that was created through newStarElement()
    for (let element of this.star_elements) {
      if (this.marked) {
        element.addClass("examma-ray-question-star-marked");
      } else {
        element.removeClass("examma-ray-question-star-marked");
      }
    }

    // Show/hide the corresponding question in the section outline
    if (this.marked) {
      $("#starred-question-" + this.question_uuid).show();
    } else {
      $("#starred-question-" + this.question_uuid).hide();
    }
  }
}

export function setupQuestionStars() {
  let starList = new QuestionStarList();

  $(".examma-ray-question > .card > .card-header").each(function() {
    // Add a star after each question header
    let question = $(this).closest(".examma-ray-question");
    let question_uuid = question.data("question-uuid");
    let starElement = starList.newStarElementForQuestion(question_uuid);
    $(this).append(starElement);
  });

  $(".examma-ray-starred-nav").each(function () {
    // Add a star before each (initially hidden) question in the section navigation
    let question_uuid = $(this).data("question-uuid");
    let starElement = starList.newStarElementForQuestion(question_uuid);
    $(this).prepend(starElement);
  });
}