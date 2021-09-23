import { Question } from "./exam_components";
import { QuestionSpecification } from "./specification";
import { asMutable } from "./util";

export class QuestionBank {

    public readonly questions: readonly Question[] = [];
    private readonly questionsById: {[index: string] : Question | undefined } = {};
    private readonly questionsByTag: {[index: string] : Question[] | undefined } = {};
  
    public constructor(questions: readonly (Question | QuestionSpecification)[]) {
      questions.forEach(q => this.registerQuestion(q));
    }
  
    public registerQuestion(q: Question | QuestionSpecification) {
      if (!(q instanceof Question)) {
        q = Question.create(q);
      }
      asMutable(this.questions).push(q);
      this.questionsById[q.question_id] = q;
      q.tags.forEach(tag => 
        (this.questionsByTag[tag] ??= []).push(<Question>q)
      );
    }
  
    public registerQuestions(qs: readonly (Question | QuestionSpecification)[]) {
      qs.forEach(q => this.registerQuestion(q));
    }
  
    public getQuestionById(id: string) {
      return this.questionsById[id];
    }
  
    public getQuestionsByTag(tag: string) {
      return this.questionsByTag[tag] ?? [];
    }
  }