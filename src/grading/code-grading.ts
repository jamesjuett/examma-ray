import { Program } from "lobster/dist/core/Program";
import { CodeWritingRubricItem } from "../graders/CodeWritingGrader";

export class CodeSubmission {

    public readonly rawSubmission: string;
    public readonly program: Program;

    public constructor(rawSubmission: )
}




export class CodeGrader {

    public readonly rubric: readonly CodeWritingRubricItem[];
    private readonly autograders: CodeWritingAutograder; 
}