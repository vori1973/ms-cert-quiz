const readline = require("readline");
const fs = require("fs");
const path = require("path");

const EXIT_COMMANDS = ["q", "quit", "exit"];

class ExitQuizError extends Error {
  constructor() {
    super("User exited the quiz");
    this.name = "ExitQuizError";
  }
}

function isExit(input) {
  return EXIT_COMMANDS.includes(input.trim().toLowerCase());
}

function ask(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function discoverExams() {
  const examsDir = path.join(__dirname, "exams");
  if (!fs.existsSync(examsDir)) return [];
  return fs
    .readdirSync(examsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const dir = path.join(examsDir, d.name);
      const ready =
        fs.existsSync(path.join(dir, "categories.json")) &&
        fs.existsSync(path.join(dir, "questions.json"));
      return { name: d.name, dir, ready };
    });
}

async function selectExam(rl) {
  const exams = discoverExams();
  if (exams.length === 0) {
    console.error("No exams found in the exams/ directory.");
    process.exit(1);
  }
  if (exams.length === 1 && exams[0].ready) {
    console.log(`  Auto-selected exam: ${exams[0].name}\n`);
    return exams[0];
  }
  console.log("=============================================");
  console.log("          Available Exams");
  console.log("=============================================");
  exams.forEach((e, i) => {
    const tag = e.ready ? "" : " (coming soon)";
    console.log(`  ${i + 1}. ${e.name}${tag}`);
  });
  console.log();
  let choice;
  while (true) {
    const raw = await ask(rl, `Select exam (1-${exams.length}) or q to quit: `);
    if (isExit(raw)) throw new ExitQuizError();
    const num = parseInt(raw, 10);
    if (num >= 1 && num <= exams.length) {
      choice = exams[num - 1];
      if (!choice.ready) {
        console.log(`\n  ⏳ ${choice.name} is coming soon — questions are not yet available.`);
        console.log("  Pick another exam or check back later.\n");
        continue;
      }
      break;
    }
    console.log(`  Please enter a number between 1 and ${exams.length}.`);
  }
  return choice;
}

function normalizeAnswer(raw) {
  return raw
    .toUpperCase()
    .split(/[\s,]+/)
    .filter((x) => /^[A-D]$/.test(x))
    .sort()
    .join(", ");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectQuestions(total, allQuestions, config) {
  const selected = [];

  for (const cat of config.categories) {
    const pool = allQuestions.filter((q) => q.category === cat.id);
    const count = cat.questionsInQuiz;
    const picked = shuffle(pool).slice(0, count);
    selected.push(...picked);
  }

  // If rounding left us short/over, adjust from the largest category
  while (selected.length < total) {
    const largest = config.categories.reduce((a, b) =>
      a.weight > b.weight ? a : b
    );
    const pool = allQuestions.filter(
      (q) => q.category === largest.id && !selected.includes(q)
    );
    if (pool.length === 0) break;
    selected.push(shuffle(pool)[0]);
  }

  return shuffle(selected).slice(0, total);
}

function printCategoryBreakdown(questions, config) {
  console.log("\n  Questions per category:");
  for (const cat of config.categories) {
    const count = questions.filter((q) => q.category === cat.id).length;
    console.log(`    ${cat.name}: ${count} (exam weight: ${cat.weight}%)`);
  }
  console.log();
}

async function runQuiz() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const exam = await selectExam(rl);

  const allQuestions = JSON.parse(
    fs.readFileSync(path.join(exam.dir, "questions.json"), "utf8")
  );
  const config = JSON.parse(
    fs.readFileSync(path.join(exam.dir, "categories.json"), "utf8")
  );

  const total = config.totalQuizQuestions;
  const questions = selectQuestions(total, allQuestions, config);

  console.log("=============================================");
  console.log(`    ${exam.name} Practice Quiz — Smart Selection`);
  console.log("=============================================");
  console.log(`  ${total} questions selected proportionally`);
  console.log("  from a pool of " + allQuestions.length + " questions.");
  printCategoryBreakdown(questions, config);
  console.log("  Enter your answer as a letter (e.g. B) or");
  console.log("  multiple letters separated by commas (e.g. A, C)");
  console.log("  Press Enter to skip a question.");
  console.log("  Type q to quit at any time.");
  console.log("=============================================\n");

  let correct = 0;
  let answered = 0;
  const wrong = [];
  const categoryScores = {};

  for (const cat of config.categories) {
    categoryScores[cat.id] = { correct: 0, total: 0, name: cat.name };
  }

  try {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      categoryScores[q.category].total++;

      const catLabel = config.categories.find((c) => c.id === q.category)?.name || q.category;
      console.log(`\n[${i + 1}/${total}] (${catLabel})`);
      console.log(`Q. ${q.question}`);
      for (const [letter, text] of Object.entries(q.choices)) {
        console.log(`   ${letter}. ${text}`);
      }

      const multiHint = q.answer.includes(",") ? " (select multiple)" : "";
      const raw = await ask(rl, `\nYour answer${multiHint}: `);
      if (isExit(raw)) throw new ExitQuizError();
      const userAnswer = normalizeAnswer(raw);
      const correctAnswer = normalizeAnswer(q.answer);

      if (!userAnswer) {
        console.log(`⏭  Skipped. Correct: ${correctAnswer}`);
        wrong.push({
          num: i + 1,
          category: catLabel,
          question: q.question,
          choices: q.choices,
          yours: "(skipped)",
          correct: correctAnswer,
        });
        continue;
      }

      answered++;

      if (userAnswer === correctAnswer) {
        correct++;
        categoryScores[q.category].correct++;
        console.log("✅ Correct!");
      } else {
        console.log(`❌ Wrong. You: ${userAnswer} | Correct: ${correctAnswer}`);
        wrong.push({
          num: i + 1,
          category: catLabel,
          question: q.question,
          choices: q.choices,
          yours: userAnswer,
          correct: correctAnswer,
        });
      }
    }

    printResults({ total, answered, correct, wrong, config, categoryScores });
  } catch (err) {
    if (err instanceof ExitQuizError && answered > 0) {
      printResults({ total, answered, correct, wrong, config, categoryScores, early: true });
    }
    throw err;
  } finally {
    rl.close();
  }
}

function printResults({ total, answered, correct, wrong, config, categoryScores, early }) {
  const attempted = answered + wrong.filter((w) => w.yours === "(skipped)").length;

  console.log("\n=============================================");
  console.log(early ? "           PARTIAL RESULTS (exited early)" : "              FINAL RESULTS");
  console.log("=============================================");
  console.log(`  Total questions:  ${total}`);
  console.log(`  Attempted:        ${attempted}`);
  console.log(`  Answered:         ${answered}`);
  console.log(`  Correct:          ${correct}`);
  console.log(`  Wrong/Skipped:    ${attempted - correct}`);
  if (attempted > 0) {
    console.log(`  Score:            ${((correct / attempted) * 100).toFixed(1)}%`);
  }
  console.log("=============================================");

  if (!early && correct / total >= 0.7) {
    console.log("  🎉 PASS (70%+ threshold)");
  } else if (!early && total > 0) {
    console.log("  📚 Keep studying (below 70%)");
  }

  // Per-category breakdown
  console.log("\n--- Score by Category ---");
  for (const cat of config.categories) {
    const s = categoryScores[cat.id];
    if (!s || s.total === 0) continue;
    const pct = ((s.correct / s.total) * 100).toFixed(1);
    const bar =
      "█".repeat(Math.round((s.correct / s.total) * 10)) +
      "░".repeat(10 - Math.round((s.correct / s.total) * 10));
    console.log(`  ${cat.name}`);
    console.log(`    ${bar} ${s.correct}/${s.total} (${pct}%)`);
  }

  // Review section
  if (wrong.length > 0) {
    console.log("\n--- Questions to Review ---");
    for (const w of wrong) {
      console.log(`\n  Q${w.num} [${w.category}]`);
      console.log(`  ${w.question}`);
      for (const [letter, text] of Object.entries(w.choices)) {
        const marker =
          w.correct.includes(letter)
            ? " ✅"
            : w.yours.includes(letter)
            ? " ❌"
            : "";
        console.log(`    ${letter}. ${text}${marker}`);
      }
      console.log(`  Your answer: ${w.yours} | Correct: ${w.correct}`);
    }
  }
}

if (require.main === module) {
  runQuiz().catch((err) => {
    if (err instanceof ExitQuizError) {
      console.log("\n👋 Goodbye!");
      process.exit(0);
    }
    throw err;
  });
}

module.exports = { discoverExams, selectQuestions, shuffle, normalizeAnswer, isExit };
