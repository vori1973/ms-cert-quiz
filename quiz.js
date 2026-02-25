const readline = require("readline");
const fs = require("fs");
const path = require("path");

const allQuestions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "questions.json"), "utf8")
);
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "categories.json"), "utf8")
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
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

function selectQuestions(total) {
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

function printCategoryBreakdown(questions) {
  console.log("\n  Questions per category:");
  for (const cat of config.categories) {
    const count = questions.filter((q) => q.category === cat.id).length;
    console.log(`    ${cat.name}: ${count} (exam weight: ${cat.weight}%)`);
  }
  console.log();
}

async function runQuiz() {
  const total = config.totalQuizQuestions;
  const questions = selectQuestions(total);

  console.log("=============================================");
  console.log("    AI-102 Practice Quiz — Smart Selection");
  console.log("=============================================");
  console.log(`  ${total} questions selected proportionally`);
  console.log("  from a pool of " + allQuestions.length + " questions.");
  printCategoryBreakdown(questions);
  console.log("  Enter your answer as a letter (e.g. B) or");
  console.log("  multiple letters separated by commas (e.g. A, C)");
  console.log("  Press Enter to skip a question.");
  console.log("=============================================\n");

  let correct = 0;
  let answered = 0;
  const wrong = [];
  const categoryScores = {};

  for (const cat of config.categories) {
    categoryScores[cat.id] = { correct: 0, total: 0, name: cat.name };
  }

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
    const raw = await ask(`\nYour answer${multiHint}: `);
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

  // Final results
  console.log("\n=============================================");
  console.log("              FINAL RESULTS");
  console.log("=============================================");
  console.log(`  Total questions:  ${total}`);
  console.log(`  Answered:         ${answered}`);
  console.log(`  Correct:          ${correct}`);
  console.log(`  Wrong/Skipped:    ${total - correct}`);
  console.log(`  Score:            ${((correct / total) * 100).toFixed(1)}%`);
  console.log("=============================================");

  if (correct / total >= 0.7) {
    console.log("  🎉 PASS (70%+ threshold)");
  } else {
    console.log("  📚 Keep studying (below 70%)");
  }

  // Per-category breakdown
  console.log("\n--- Score by Category ---");
  for (const cat of config.categories) {
    const s = categoryScores[cat.id];
    const pct = s.total > 0 ? ((s.correct / s.total) * 100).toFixed(1) : "N/A";
    const bar = s.total > 0
      ? "█".repeat(Math.round((s.correct / s.total) * 10)) +
        "░".repeat(10 - Math.round((s.correct / s.total) * 10))
      : "░░░░░░░░░░";
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

  rl.close();
}

runQuiz();
