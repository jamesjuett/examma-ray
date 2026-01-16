import 'mocha';
import { expect } from 'chai';

import { evaluateRubricItem, FITBDropEvaluations, StandardFITBDropGrader, StandardFITBDropGraderSpecification } from "../../src/graders/StandardFITBDropGrader";
import { FITBDropSubmission } from "../../src/response/fitb-drop";

export const grocery_init_grader : StandardFITBDropGraderSpecification = {
  grader_kind: "standard_fitb_drop",
  rubric: [
    {
      title: "Read {{adt_var_name}}->{{adt_mem_name}}",
      points: 2,
      description: "Reads the value from the input file once at the top level of the function, not within a loop.",
      evaluator: {
        kind: "matching_drop_evaluator",
        index: 0,
        evaluations: [
          {
            structure: [
              { id: "input_statement", children: [[{ id: "member_access_adt_var_name_adt_mem_name" }]] },
            ],
            enforce_ordering: true,
            evaluation: FITBDropEvaluations.full_credit(2)
          },
          {
            structure: [
              { id: "decl_adt_mem_name" },
              { id: "input_statement", children: [[{ id: "use_adt_mem_name" }]] },
              { id: "assignment", children: [[{ id: "member_access_adt_var_name_adt_mem_name" } ], [ { id: "use_adt_mem_name"} ]] },
            ],
            enforce_ordering: true,
            evaluation: FITBDropEvaluations.full_credit(2)
          },
          ...[["use", "decl"],["decl", "use"],["decl", "decl"]].map(pair => ({ // Accidentally read into a redeclaration rather than just the variable
            structure: [
              { id: "decl_adt_mem_name" },
              { id: "input_statement", children: [[{ id: `${pair[0]}_adt_mem_name` }]] },
              { id: "assignment", children: [[{ id: "member_access_adt_var_name_adt_mem_name" } ], [ { id: `${pair[1]}_adt_mem_name`} ]] },
            ],
            enforce_ordering: true,
            evaluation: FITBDropEvaluations.partial_credit(1)
          })),
        ]
      }
    },
    {
      title: "Read {{adt_var_name}}->{{adt_mem_quantity}}",
      points: 2,
      description: "Reads the value from the input file once at the top level of the function, not within a loop.",
      evaluator: {
        kind: "matching_drop_evaluator",
        index: 0,
        evaluations: [
          {
            structure: [
              { id: "input_statement", children: [[{ id: "member_access_adt_var_name_adt_mem_quantity" }]] },
            ],
            enforce_ordering: true,
            evaluation: FITBDropEvaluations.full_credit(2)
          },
          {
            structure: [
              { id: "decl_adt_mem_quantity" },
              { id: "input_statement", children: [[{ id: "use_adt_mem_quantity" }]] },
              { id: "assignment", children: [[{ id: "member_access_adt_var_name_adt_mem_quantity" } ], [ { id: "use_adt_mem_quantity"} ]] },
            ],
            enforce_ordering: true,
            evaluation: FITBDropEvaluations.full_credit(2)
          },
          ...[["use", "decl"],["decl", "use"],["decl", "decl"]].map(pair => ({ // Accidentally read into a redeclaration rather than just the variable
            structure: [
              { id: "decl_adt_mem_quantity" },
              { id: "input_statement", children: [[{ id: `${pair[0]}_adt_mem_quantity` }]] },
              { id: "assignment", children: [[{ id: "member_access_adt_var_name_adt_mem_quantity" } ], [ { id: `${pair[1]}_adt_mem_quantity`} ]] },
            ],
            enforce_ordering: true,
            evaluation: FITBDropEvaluations.partial_credit(1)
          })),
        ]
      }
    },
    {
      title: "Read {{adt_var_name}}->{{adt_mem_quantity}}",
      points: 2,
      description: "Reads the value from the input file once at the top level of the function, not within a loop.",
      evaluator: {
        kind: "matching_drop_evaluator",
        index: 0,
        evaluations: [
          {
            structure: [
              { id: "input_statement", children: [[{ id: "member_access_adt_var_name_adt_mem_quantity" }]] },
            ],
            enforce_ordering: true,
            evaluation: FITBDropEvaluations.full_credit(2)
          },
          {
            structure: [
              { id: "decl_adt_mem_quantity" },
              { id: "input_statement", children: [[{ id: "use_adt_mem_quantity" }]] },
              { id: "assignment", children: [[{ id: "member_access_adt_var_name_adt_mem_quantity" } ], [ { id: "use_adt_mem_quantity"} ]] },
            ],
            enforce_ordering: true,
            evaluation: FITBDropEvaluations.full_credit(2)
          },
          ...[["use", "decl"],["decl", "use"],["decl", "decl"]].map(pair => ({ // Accidentally read into a redeclaration rather than just the variable
            structure: [
              { id: "decl_adt_mem_quantity" },
              { id: "input_statement", children: [[{ id: `${pair[0]}_adt_mem_quantity` }]] },
              { id: "assignment", children: [[{ id: "member_access_adt_var_name_adt_mem_quantity" } ], [ { id: `${pair[1]}_adt_mem_quantity`} ]] },
            ],
            enforce_ordering: true,
            evaluation: FITBDropEvaluations.partial_credit(1)
          })),
        ]
      }
    },
    {
      title: "Read the ignored text from the file",
      points: 2,
      description: "Reads the ignored text from the input file, in between the two required reads.",
      evaluator: {
        kind: "matching_drop_evaluator",
        index: 0,
        evaluations: [
          // Reading in the ignored text, must be in-between two other read operations (which we just assume are the other two members)
          {
            structure: [
              { id: "input_statement" },
              { id: "input_statement", children: [[{ id: "use_ignore" }]] },
              { id: "input_statement" },
            ],
            enforce_ordering: true,
            evaluation: FITBDropEvaluations.full_credit(2)
          },
        ]
      }
    },
  ]
};


const submission : FITBDropSubmission = JSON.parse(`[[{"id":"decl_ignore","children":[]},{"id":"decl_vector_item_var","children":[]},{"id":"input_statement","children":[[{"id":"member_access_adt_var_name_adt_mem_name","children":[]}]]},{"id":"input_statement","children":[[{"id":"use_ignore","children":[]}]]},{"id":"input_statement","children":[[{"id":"member_access_adt_var_name_adt_mem_quantity","children":[]}]]},{"id":"for_loop","children":[[{"id":"use_adt_mem_quantity","children":[]}],[{"id":"input_statement","children":[[{"id":"use_vector_item_var","children":[]}]]},{"id":"push_back","children":[[{"id":"member_access_adt_var_name_adt_mem_vector","children":[]}],[{"id":"use_vector_item_var","children":[]}]]}]]}]]`);

describe('mk2html() function', () => {

  it('should render basic markdown', () => {

    console.log(evaluateRubricItem(grocery_init_grader.rubric[0],submission));
    console.log(evaluateRubricItem(grocery_init_grader.rubric[1],submission));
    console.log(evaluateRubricItem(grocery_init_grader.rubric[2],submission));
    console.log(evaluateRubricItem(grocery_init_grader.rubric[3],submission));
    
  });
  
});