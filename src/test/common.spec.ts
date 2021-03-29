import 'mocha';
import { expect } from 'chai';
import { ExamSubmission, fillManifest } from '../submissions';

const manifest : ExamSubmission = {
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
      "id": "1_true_false",
      "display_index": "1",
      "questions": [
        {
          "id": "sp20_mc_time_complexity_4",
          "display_index": "1.1",
          "kind": "multiple_choice",
          "response": ""
        },
        {
          "id": "sp20_mc_containers_and_templates_1",
          "display_index": "1.2",
          "kind": "multiple_choice",
          "response": ""
        }
      ]
    },
    {
      "id": "sp20_2_2_containers",
      "display_index": "2",
      "questions": [
        {
          "id": "sp20_2_2_part1",
          "display_index": "2.1",
          "kind": "fitb",
          "response": ""
        },
        {
          "id": "sp20_2_2_part2",
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
      "id": "sp20_2_2_containers",
      "display_index": "1",
      "questions": [
        {
          "id": "sp20_2_2_part1",
          "display_index": "2.1",
          "kind": "fitb",
          "response": "test_response_sp20_2_2_part1"
        },
        {
          "id": "sp20_2_2_part2",
          "display_index": "2.2",
          "kind": "code_editor",
          "response": "test_response_sp20_2_2_part2"
        }
      ]
    },
    {
      "id": "1_true_false",
      "display_index": "523",
      "questions": [
        {
          "id": "sp20_mc_containers_and_templates_1",
          "display_index": "1.2",
          "kind": "fitb",
          "response": "test_response_sp20_mc_containers_and_templates_1"
        },
        {
          "id": "sp20_mc_time_complexity_4",
          "display_index": "1.1",
          "kind": "fitb",
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