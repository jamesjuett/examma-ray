import { QuestionSpecification } from "./exam_specification";
import { asMutable } from "./util";

export class QuestionBank {

    public readonly questions: readonly QuestionSpecification[] = [];
    private readonly questionsById: {[index: string] : QuestionSpecification | undefined } = {};
    private readonly questionsByTag: {[index: string] : QuestionSpecification[] | undefined } = {};
  
    public constructor(questions: readonly QuestionSpecification[]) {
      questions.forEach(q => this.registerQuestion(q));
    }
  
    public registerQuestion(q: QuestionSpecification) {
      asMutable(this.questions).push(q);
      this.questionsById[q.question_id] = q;
      q.tags?.forEach(tag => 
        (this.questionsByTag[tag] ??= []).push(q)
      );
    }
  
    public registerQuestions(qs: readonly QuestionSpecification[]) {
      qs.forEach(q => this.registerQuestion(q));
    }
  
    public getQuestionById(id: string) {
      return this.questionsById[id];
    }
  
    public getQuestionsByTag(tag: string) {
      return this.questionsByTag[tag] ?? [];
    }
  }