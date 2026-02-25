# AI-102 Practice Quiz

A Node.js command-line quiz app for preparing for the **Microsoft AI-102: Designing and Implementing a Microsoft Azure AI Solution** certification exam.

## Quick Start

```bash
node quiz.js
```

No dependencies required — runs on Node.js (v14+) with zero npm packages.

## How It Works

Each run selects **50 questions** from a pool of **300** (50 per category), distributed proportionally to match the official exam blueprint weightings:

| Category | Exam Weight | Questions per Quiz |
|---|---|---|
| Plan & manage an Azure AI solution | 22.5% | 11 |
| Implement generative AI solutions | 17.5% | 9 |
| Implement an agentic solution | 7.5% | 4 |
| Implement computer vision solutions | 12.5% | 6 |
| Implement NLP solutions | 17.5% | 9 |
| Implement knowledge mining & information extraction | 22.5% | 11 |

Questions are **randomized** each run, so every session is different.

## Answering Questions

- **Single answer**: type the letter and press Enter (e.g. `B`)
- **Multiple answers**: type letters separated by commas (e.g. `A, C`)
- **Skip**: press Enter without typing anything

The quiz indicates when a question expects multiple answers with a `(select multiple)` hint.

## Scoring

After all 50 questions, the quiz displays:

- **Overall score** with pass/fail (70% threshold)
- **Per-category breakdown** with visual progress bars
- **Review section** listing every wrong/skipped question with the correct answers highlighted

## Files

| File | Description |
|---|---|
| `quiz.js` | Quiz engine — smart selection, scoring, review |
| `questions.json` | 300 questions (50 per category) with choices and answers |
| `categories.json` | Category definitions, exam weights, and per-quiz allocation |
| `AI-102-cheat-sheet-with-python-snippets.md` | Study reference the questions are based on |

## Customization

**Change the number of quiz questions** — edit `totalQuizQuestions` in `categories.json` and adjust the `questionsInQuiz` values for each category proportionally.

**Add more questions** — append to `questions.json` following the same format:

```json
{
  "id": 301,
  "category": "genai",
  "question": "Your question here?",
  "choices": {
    "A": "Choice A",
    "B": "Choice B",
    "C": "Choice C",
    "D": "Choice D"
  },
  "answer": "B"
}
```

For multi-select answers, use comma-separated letters: `"answer": "A, C"`

## Exam Blueprint Source

Questions align with the [AI-102 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-102) (skills measured as of Dec 23, 2025).
