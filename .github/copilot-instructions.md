# GitHub Copilot Instructions

## Project Overview
`ms-cert-quiz` is a Node.js CLI quiz app for Microsoft certification exam practice.
No runtime dependencies — stdlib (`fs`, `path`, `readline`) only.
Dev dependency: Jest (tests only).

## Architecture
- **`quiz.js`** — single entry point and module. Exports: `discoverExams`, `selectQuestions`, `shuffle`, `normalizeAnswer`, `isExit`.
- **`exams/<EXAM-NAME>/`** — one directory per exam, always containing:
  - `questions.json` — array of question objects
  - `categories.json` — exam config with `totalQuizQuestions` and `categories[]`
  - An optional `.md` cheat sheet
- **`tests/quiz.test.js`** — Jest unit tests for all exported functions.

## Question Object Schema
```json
{
  "id": 1,
  "category": "category-id",
  "question": "Question text?",
  "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "answer": "A"
}
```
Multi-answer example: `"answer": "A, C"`

## Category Config Schema (`categories.json`)
```json
{
  "totalQuizQuestions": 50,
  "categories": [
    { "id": "category-id", "name": "Display Name", "weight": 27.5, "questionsInQuiz": 14 }
  ]
}
```
`weight` values must sum to 100. `questionsInQuiz` values must sum to `totalQuizQuestions`.

## Coding Conventions
- **Plain CommonJS** (`require`/`module.exports`), no ES modules, no TypeScript.
- **No external packages at runtime.** Do not suggest installing libraries for CLI I/O, file reading, or data manipulation — use Node.js built-ins.
- Functions are small and pure where possible; side effects (I/O) are primarily handled in `runQuiz()`, `selectExam()`, and their print helpers.
- `normalizeAnswer` sorts multi-answer responses alphabetically before comparing.
- `selectQuestions` uses each category's `questionsInQuiz` as a fixed per-quiz allocation; `weight` is only used to choose which category absorbs any shortfall/rounding gap (the "largest" category).

## Testing
- Test file: `tests/quiz.test.js`
- Framework: Jest — run with `npm test`.
- Mock `fs` at the module level (`jest.mock('fs')`); never hit the real filesystem in tests.
- Cover edge cases: empty arrays, missing files, case-insensitive input, partial/early exit.
- New exported functions must have corresponding tests.

## Adding a New Exam
1. Create `exams/<EXAM-CODE>/questions.json` and `categories.json` following the schemas above.
2. Ensure `questionsInQuiz` values sum to `totalQuizQuestions` and weights sum to 100.
3. No code changes needed — `discoverExams()` auto-discovers directories via filesystem scan.

## Git & Commits
- Conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`.
- Separate commits per logical concern (do not bundle unrelated changes).
- Do not push automatically; always confirm before `git push`.

## What NOT to Do
- Do not use `import`/`export` syntax.
- Do not add runtime `npm` dependencies.
- Do not replace synchronous `fs.readFileSync` calls with async alternatives — this is intentional.
- Do not split `quiz.js` into multiple files unless explicitly asked.
- Do not add TypeScript, JSDoc type annotations, or a build step.
- Do not add comments to code unless the logic is non-obvious.
