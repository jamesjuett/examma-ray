import { RANDOM_BY_TAG, Section } from "../src/exams";
import { FITB_QUESTIONS } from "../questions/fitb";
import { TF_QUESTIONS } from "../questions/tf";

export const S1_true_false = new Section({
  "id": "1_true_false",
  "title": "True/False",
  "mk_description": "Determine whether the following statements are true or false.",
  "mk_reference": "This section has no reference material.",
  "questions": [
    RANDOM_BY_TAG("tf_time_complexity", 1, TF_QUESTIONS),
    RANDOM_BY_TAG("tf_containers_and_templates", 1, TF_QUESTIONS),
    RANDOM_BY_TAG("tf_representation_invariants", 1, TF_QUESTIONS),
    RANDOM_BY_TAG("tf_dynamic_memory", 1, TF_QUESTIONS),
    RANDOM_BY_TAG("tf_dynamic_memory_errors", 1, TF_QUESTIONS),
    RANDOM_BY_TAG("tf_managing_dynamic_memory", 1, TF_QUESTIONS),
    RANDOM_BY_TAG("tf_big_three", 1, TF_QUESTIONS),
    FITB_QUESTIONS[0]
  ]
})