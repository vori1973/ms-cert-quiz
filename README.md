# Microsoft Certification Practice Quiz

A Node.js command-line quiz app for preparing for **Microsoft certification exams**. Supports multiple exams out of the box — just pick one when you start.

## Available Exams

| Exam | Description |
|---|---|
| **AI-102** | Designing and Implementing a Microsoft Azure AI Solution |
| **GH-300** | GitHub Foundations _(coming soon)_ |

Adding a new exam is as simple as dropping a folder into `exams/` (see [Adding a New Exam](#adding-a-new-exam) below).

## Quick Start

```bash
node quiz.js
```

No runtime dependencies — runs on Node.js (v14+) with zero npm packages.

If multiple exams are available you'll see a selection menu:

```
=============================================
          Available Exams
=============================================
  1. AI-102
  2. GH-300

Select exam (1-2):
```

When only one exam has questions, it is auto-selected.

## How It Works

Each exam lives in its own directory under `exams/` and defines its own question pool, categories, weightings, and quiz size. On each run the quiz engine:

1. Discovers every exam folder in `exams/`.
2. Loads that exam's `categories.json` (blueprint) and `questions.json` (question pool).
3. Selects questions **proportionally** to the exam's category weights so that each practice session mirrors the real exam distribution.
4. Randomizes question order — every session is different.

### Example — AI-102 Blueprint

| Category | Exam Weight | Questions per Quiz |
|---|---|---|
| Plan & manage an Azure AI solution | 22.5% | 11 |
| Implement generative AI solutions | 17.5% | 9 |
| Implement an agentic solution | 7.5% | 4 |
| Implement computer vision solutions | 12.5% | 6 |
| Implement NLP solutions | 17.5% | 9 |
| Implement knowledge mining & information extraction | 22.5% | 11 |

Each exam can define its own categories and weights in its `categories.json`.

## Answering Questions

- **Single answer**: type the letter and press Enter (e.g. `B`)
- **Multiple answers**: type letters separated by commas (e.g. `A, C`)
- **Skip**: press Enter without typing anything

The quiz indicates when a question expects multiple answers with a `(select multiple)` hint.

## Scoring

After all questions the quiz displays:

- **Overall score** with pass/fail (70% threshold)
- **Per-category breakdown** with visual progress bars
- **Review section** listing every wrong/skipped question with the correct answers highlighted

## Project Structure

```
ms-cert-quiz/
├── quiz.js                  # Quiz engine — exam discovery, selection, scoring, review
├── package.json
├── exams/
│   ├── AI-102/
│   │   ├── categories.json  # Category definitions, weights, quiz allocation
│   │   ├── questions.json   # Question pool (300 questions)
│   │   └── AI-102-cheat-sheet-with-python-snippets.md  # Study reference
│   └── GH-300/
│       └── GH-300-cheat-sheet.md  # Study reference (questions TBD)
└── tests/
    └── quiz.test.js         # Unit tests
```

## Adding a New Exam

1. Create a folder under `exams/` named after the exam (e.g. `exams/AZ-900/`).

2. Add a `categories.json` defining the exam blueprint:

```json
{
  "totalQuizQuestions": 40,
  "categories": [
    {
      "id": "cloud-concepts",
      "name": "Describe cloud concepts",
      "weight": 25,
      "questionsInQuiz": 10
    }
  ]
}
```

3. Add a `questions.json` with the question pool:

```json
[
  {
    "id": 1,
    "category": "cloud-concepts",
    "question": "Your question here?",
    "choices": {
      "A": "Choice A",
      "B": "Choice B",
      "C": "Choice C",
      "D": "Choice D"
    },
    "answer": "B"
  }
]
```

For multi-select answers use comma-separated letters: `"answer": "A, C"`

4. Optionally add a cheat-sheet or study-reference markdown file.

5. Run `node quiz.js` — the new exam appears in the selection menu automatically.

## Customization

**Change the number of quiz questions** — edit `totalQuizQuestions` in the exam's `categories.json` and adjust the `questionsInQuiz` values for each category proportionally.

**Add more questions** — append to the exam's `questions.json` following the format above.

## Exam Blueprint Sources

- **AI-102** — [AI-102 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-102) (skills measured as of Dec 23, 2025)
