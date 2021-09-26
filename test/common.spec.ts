import 'mocha';
import { expect } from 'chai';
import { ExamSubmission, fillManifest } from '../src/core/submissions';

export const VALID_IDS = [
  "blah",
  "question_id1",
  "aAzZ09-_",
  "a",
  "a_-_-_-a",
];

export const INVALID_IDS = [
  "1question_id",
  "",
  "1",
  "-_alsdf",
  "_sflaalsdf",
  "aslkdhf+=",
  "_______",
  "++++",
  "0azaz",
];

const manifest : ExamSubmission = {
  "uuid": "exam_uuid_1",
  "exam_id": "eecs280sp20test",
  "student": {
    "uniqname": "student",
    "name": "Stu Dent"
  },
  "timestamp": 1616624061809,
  "trusted": false,
  "saverId": 0,
  "sections": [
    {
      "uuid": "section_uuid_1",
      "section_id": "1_true_false",
      "skin_id": "section_skin1",
      "display_index": "1",
      "questions": [
        {
          "uuid": "question_uuid_1",
          "question_id": "sp20_mc_time_complexity_4",
          "skin_id": "skin1",
          "display_index": "1.1",
          "kind": "multiple_choice",
          "response": ""
        },
        {
          "uuid": "question_uuid_2",
          "question_id": "sp20_mc_containers_and_templates_1",
          "skin_id": "skin2",
          "display_index": "1.2",
          "kind": "multiple_choice",
          "response": ""
        }
      ]
    },
    {
      "uuid": "section_uuid_2",
      "section_id": "sp20_2_2_containers",
      "skin_id": "section_skin2",
      "display_index": "2",
      "questions": [
        {
          "uuid": "question_uuid_3",
          "question_id": "sp20_2_2_part1",
          "skin_id": "skin3",
          "display_index": "2.1",
          "kind": "fill_in_the_blank",
          "response": ""
        },
        {
          "uuid": "question_uuid_4",
          "question_id": "sp20_2_2_part2",
          "skin_id": "skin4",
          "display_index": "2.2",
          "kind": "code_editor",
          "response": ""
        }
      ]
    }
  ]
};

// Answers corrupted or maliciously altered by a student
//  - ordering of sections/questions changed
//  - question types changed
//  - metadata changed
//  - student info changed
const submitted : ExamSubmission = {
  "uuid": "exam_uuid_1",
  "exam_id": "eecs280sp20test1",
  "student": {
    "uniqname": "student1",
    "name": "Stu Dent1"
  },
  "timestamp": 43,
  "trusted": false,
  "saverId": 234,
  "sections": [
    {
      "uuid": "section_uuid_2",
      "section_id": "sp20_2_2_containers",
      "skin_id": "blah",
      "display_index": "1",
      "questions": [
        {
          "uuid": "question_uuid_3",
          "question_id": "sp20_2_2_part1",
          "skin_id": "blah",
          "display_index": "2.1",
          "kind": "fill_in_the_blank",
          "response": "test_response_sp20_2_2_part1"
        },
        {
          "uuid": "question_uuid_4",
          "question_id": "sp20_2_2_part2",
          "skin_id": "blah",
          "display_index": "2.2",
          "kind": "code_editor",
          "response": "test_response_sp20_2_2_part2"
        }
      ]
    },
    {
      "uuid": "section_uuid_1",
      "section_id": "1_true_false",
      "skin_id": "blah",
      "display_index": "523",
      "questions": [
        {
          "uuid": "question_uuid_2",
          "question_id": "sp20_mc_containers_and_templates_1",
          "skin_id": "blah",
          "display_index": "1.2",
          "kind": "fill_in_the_blank",
          "response": "test_response_sp20_mc_containers_and_templates_1"
        },
        {
          "uuid": "question_uuid_1",
          "question_id": "sp20_mc_time_complexity_4",
          "skin_id": "blah",
          "display_index": "1.1",
          "kind": "fill_in_the_blank",
          "response": "test_response_sp20_mc_time_complexity_4"
        }
      ]
    }
  ]
};

describe('fillManifest() function', () => {

  let filled = fillManifest(manifest, submitted);

  it('marks the manifest as trusted', () => {
    expect(filled.trusted).is.true;
  });

  it('fills manifest responses from submitted responses and is not sensitive to ordering of submitted responses', () => {
    expect(filled).to.nested.include({"sections[0].questions[0].response": "test_response_sp20_mc_time_complexity_4"});
    expect(filled).to.nested.include({"sections[0].questions[1].response": "test_response_sp20_mc_containers_and_templates_1"});
    expect(filled).to.nested.include({"sections[1].questions[0].response": "test_response_sp20_2_2_part1"});
    expect(filled).to.nested.include({"sections[1].questions[1].response": "test_response_sp20_2_2_part2"});
  });

  it('ignores all data from submitted answers except for submitted responses', () => {
    expect(JSON.stringify(filled, (key, value) => key === "response" ? "" : value))
      .to.equal(JSON.stringify(manifest, (key, value) => key === "response" ? "" : value));
  });

});