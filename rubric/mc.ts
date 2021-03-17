// Multiple Choice

import { Exam, SimpleMCGrader } from "../autograder";


export function addMCGraders(exam: Exam) {
  exam.addGraders({

    "2.1": new SimpleMCGrader(2),
    "2.2": new SimpleMCGrader(2),
    "2.3": new SimpleMCGrader(1),
    "2.4": new SimpleMCGrader(2),
    "2.5": new SimpleMCGrader(2),

    "2.6": new SimpleMCGrader(1),
    "2.7": new SimpleMCGrader(1),
    "2.8": new SimpleMCGrader(1),
    "2.9": new SimpleMCGrader(1),
    "2.10": new SimpleMCGrader(1),

    "2.11": new SimpleMCGrader(4),
    "2.12": new SimpleMCGrader(4),
    "2.13": new SimpleMCGrader(4),
    "2.14": new SimpleMCGrader(4),
    "2.15": new SimpleMCGrader(4),

    "2.16": new SimpleMCGrader(2),
    "2.17": new SimpleMCGrader(2),
    "2.18": new SimpleMCGrader(2),
    "2.19": new SimpleMCGrader(2),
    "2.20": new SimpleMCGrader(2),

    "2.21": new SimpleMCGrader(0),
    "2.22": new SimpleMCGrader(2),
    "2.23": new SimpleMCGrader(4),
    "2.24": new SimpleMCGrader(3),
    "2.25": new SimpleMCGrader(3),

    "2.26": new SimpleMCGrader(0),
    "2.27": new SimpleMCGrader(0),
    "2.28": new SimpleMCGrader(0),
    "2.29": new SimpleMCGrader(0),
    "2.30": new SimpleMCGrader(0),

    "2.31": new SimpleMCGrader(1),
    "2.32": new SimpleMCGrader(1),
    "2.33": new SimpleMCGrader(1),
    "2.34": new SimpleMCGrader(1),
    "2.35": new SimpleMCGrader(1),

    "2.36": new SimpleMCGrader(2),
    "2.37": new SimpleMCGrader(2),
    "2.38": new SimpleMCGrader(2),
    "2.39": new SimpleMCGrader(2),
    "2.40": new SimpleMCGrader(2),

    "2.41": new SimpleMCGrader(4),
    "2.42": new SimpleMCGrader(4),
    "2.43": new SimpleMCGrader(4),
    "2.44": new SimpleMCGrader(4),
    "2.45": new SimpleMCGrader(4),

    "2.46": new SimpleMCGrader(0),
    "2.47": new SimpleMCGrader(0),
    "2.48": new SimpleMCGrader(0),
    "2.49": new SimpleMCGrader(0),
    "2.50": new SimpleMCGrader(0),

  });
}