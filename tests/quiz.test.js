jest.mock("fs");

const fs = require("fs");
const path = require("path");
const { discoverExams, selectQuestions, shuffle, normalizeAnswer, isExit } = require("../quiz");

// ── discoverExams ────────────────────────────────────────────────────────────

describe("discoverExams()", () => {
  it("returns an exam entry for each subdirectory inside exams/", () => {
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue([
      { name: "AI-102", isDirectory: () => true },
      { name: "AZ-900", isDirectory: () => true },
    ]);

    const exams = discoverExams();

    expect(exams).toHaveLength(2);
    expect(exams[0].name).toBe("AI-102");
    expect(exams[1].name).toBe("AZ-900");
    expect(exams[0].dir).toContain("AI-102");
  });

  it("ignores files (non-directories) inside exams/", () => {
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue([
      { name: "AI-102", isDirectory: () => true },
      { name: "README.md", isDirectory: () => false },
    ]);

    const exams = discoverExams();
    expect(exams).toHaveLength(1);
    expect(exams[0].name).toBe("AI-102");
  });

  it("returns an empty array when the exams/ directory does not exist", () => {
    fs.existsSync.mockReturnValue(false);

    const exams = discoverExams();
    expect(exams).toEqual([]);
  });

  it("marks an exam as ready when both categories.json and questions.json exist", () => {
    fs.existsSync.mockImplementation((p) => true);
    fs.readdirSync.mockReturnValue([
      { name: "AI-102", isDirectory: () => true },
    ]);

    const exams = discoverExams();
    expect(exams[0].ready).toBe(true);
  });

  it("marks an exam as not ready when categories.json or questions.json is missing", () => {
    fs.existsSync.mockImplementation((p) => {
      if (typeof p === "string" && p.includes("questions.json")) return false;
      return true;
    });
    fs.readdirSync.mockReturnValue([
      { name: "GH-300", isDirectory: () => true },
    ]);

    const exams = discoverExams();
    expect(exams[0].ready).toBe(false);
  });
});

// ── isExit ────────────────────────────────────────────────────────────────────

describe("isExit()", () => {
  it("recognizes q, quit, and exit (case-insensitive)", () => {
    expect(isExit("q")).toBe(true);
    expect(isExit("Q")).toBe(true);
    expect(isExit("quit")).toBe(true);
    expect(isExit("QUIT")).toBe(true);
    expect(isExit("exit")).toBe(true);
    expect(isExit("Exit")).toBe(true);
  });
  it("trims whitespace before matching", () => {
    expect(isExit("  q  ")).toBe(true);
  });
  it("returns false for regular answers and empty input", () => {
    expect(isExit("A")).toBe(false);
    expect(isExit("B, C")).toBe(false);
    expect(isExit("")).toBe(false);
    expect(isExit("question")).toBe(false);
  });
});

// ── normalizeAnswer ──────────────────────────────────────────────────────────

describe("normalizeAnswer()", () => {
  it("uppercases and sorts comma-separated letters", () => {
    expect(normalizeAnswer("c, a")).toBe("A, C");
  });
  it("handles a single letter", () => {
    expect(normalizeAnswer("b")).toBe("B");
  });
  it("strips invalid characters", () => {
    expect(normalizeAnswer("A, Z, B")).toBe("A, B");
  });
  it("returns empty string for blank input", () => {
    expect(normalizeAnswer("")).toBe("");
  });
});

// ── shuffle ──────────────────────────────────────────────────────────────────

describe("shuffle()", () => {
  it("returns an array with the same elements", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr).sort()).toEqual([1, 2, 3, 4, 5]);
  });
  it("does not mutate the original array", () => {
    const arr = [1, 2, 3];
    const original = [...arr];
    shuffle(arr);
    expect(arr).toEqual(original);
  });
});

// ── selectQuestions ──────────────────────────────────────────────────────────

describe("selectQuestions()", () => {
  const mockConfig = {
    totalQuizQuestions: 4,
    categories: [
      { id: "cat-a", name: "Category A", weight: 50, questionsInQuiz: 2 },
      { id: "cat-b", name: "Category B", weight: 50, questionsInQuiz: 2 },
    ],
  };

  const makeQuestions = (category, count) =>
    Array.from({ length: count }, (_, i) => ({
      id: `${category}-${i}`,
      category,
      question: `Q${i}`,
      choices: { A: "a", B: "b" },
      answer: "A",
    }));

  const mockQuestions = [
    ...makeQuestions("cat-a", 5),
    ...makeQuestions("cat-b", 5),
  ];

  it("returns exactly the requested number of questions", () => {
    const result = selectQuestions(4, mockQuestions, mockConfig);
    expect(result).toHaveLength(4);
  });

  it("picks questions from each category", () => {
    const result = selectQuestions(4, mockQuestions, mockConfig);
    const cats = result.map((q) => q.category);
    expect(cats).toContain("cat-a");
    expect(cats).toContain("cat-b");
  });

  it("returns an empty array when there are no questions", () => {
    const result = selectQuestions(4, [], mockConfig);
    expect(result).toHaveLength(0);
  });
});