# Computer Science Test Plan

## Setting

A concise interactive assessment presented as a calm developer console. The reader answers 20 multiple-choice computer science questions, each with four choices and exactly one correct answer.

## Structure

The story is intentionally linear so the test remains fair and scoreable. A short intro leads into 20 action nodes, one per question. Each question advances to the next question regardless of answer. Correct choices call a scoring effect that increments the `score` state value by 1.

## Question Coverage

The test covers core computer science fundamentals: data structures, algorithms, HTTP, databases, operating systems, networking, security, compilers, recursion, object-oriented programming, REST, testing, distributed systems, Git, memory, and architecture principles.

## State Model

Initial state starts with `score = 0` and `totalQuestions = 20`. The custom `correctAnswer` effect increments score. Named conditions classify the final score:

- Junior: 0-7
- Middle: 8-13
- Senior: 14-17
- Lead: 18-20

## Endings

There are four valid graded endings: Junior, Middle, Senior, and Lead. Each ending displays `{{score}}/{{totalQuestions}}` and gives a brief explanation of what the result implies.
