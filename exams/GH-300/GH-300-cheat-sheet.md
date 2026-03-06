# GH-300 GitHub Copilot Certification — Cheat Sheet (Jan 2026)

## Exam Snapshot

- **Exam Code:** GH-300
- **Duration:** 100 minutes
- **Questions:** ~65 (MCQ, multi-select, scenario-based)
- **Passing Score:** 700 / 1000
- **Focus:** Practical usage, governance, responsible AI, and real-world decision making
- **Last updated:** January 2026 (significant restructure — new domains, new features)

---

## Domain Weights at a Glance

| # | Domain | Weight |
|---|---|---|
| 1 | Use GitHub Copilot Responsibly | 15–20% |
| 2 | Use GitHub Copilot Features | 25–30% |
| 3 | Understand GitHub Copilot Data & Architecture | 10–15% |
| 4 | Apply Prompt Engineering & Context Crafting | 10–15% |
| 5 | Improve Developer Productivity | 10–15% |
| 6 | Configure Privacy, Content Exclusions & Safeguards | 10–15% |

---

## 1. Use GitHub Copilot Responsibly (15–20%)

### Core Principles

- AI-generated code **must always be reviewed and validated**
- Developer is accountable for:
  - correctness
  - security
  - compliance
- Copilot can generate:
  - insecure patterns
  - outdated APIs
  - biased or incorrect logic

### Risks to Know

- **Hallucinations** — plausible but factually incorrect or fabricated output
- **Insecure code suggestions** — vulnerable patterns from training data
- **Bias** in generated output
- **Licensing / IP ambiguity** — suggestions may resemble copyrighted training data

### Mitigation Strategies

- Human review of all generated code
- Automated testing
- Security scanning
- Context exclusions to protect sensitive files

✅ **Exam Tip:**
If asked *"what should you do first?"* → **Review and validate the output**
The **developer** is always accountable — not GitHub, not Microsoft, not the model.

---

## 2. Use GitHub Copilot Features (25–30%) 🔥

### Copilot Plans (High-Yield)

| Plan | Key Characteristics |
|---|---|
| **Individual** | Personal use, minimal governance, prompts may be used for training |
| **Business** | Org-level policies, audit logs, code **not used for training** |
| **Enterprise** | Knowledge bases, advanced governance, org-wide context, code **not used for training** |

### Critical Differences

- **Business & Enterprise:**
  - Prompts and code **not used for model training**
  - Centralized policy management
- **Enterprise only:**
  - Copilot **knowledge bases** (org-specific grounding content)
  - Advanced organizational context

✅ **Exam Pattern:**
Choose **Enterprise** for regulated industries or shared organizational knowledge
Choose **Business** for team governance without knowledge bases

---

### Where Copilot Works

- **IDEs:** VS Code, Visual Studio, JetBrains
- **GitHub.com** — chat, PR summaries, code review
- **CLI** — `gh copilot` commands in the terminal
- Chat, inline suggestions, and multi-suggestions across all surfaces

---

### Interaction Modes

| Mode | Description |
|---|---|
| **Inline Suggestions** | Real-time code completions that appear as you type |
| **Chat** | Conversational AI assistance in a dedicated chat panel |
| **Plan Mode** | Generates a step-by-step implementation plan **before** writing code |
| **Edit Mode** | Targeted, focused edits to specific sections of existing code |
| **Agent Mode** | Autonomous multi-step task execution with context and sub-agent management |

---

### Agent Mode & Sub-Agents 🆕

- Executes **multi-step tasks autonomously**
- Manages context across the full task lifecycle via **Agent Sessions**
- Delegates subtasks to **Sub-Agents** for optimized context usage
- Connects to external tools and data sources via **MCP (Model Context Protocol)**

✅ **Exam Tip:**
Agent Mode = autonomous tasks + Sub-Agents + MCP integration

---

### GitHub Copilot CLI

- Command: `gh copilot`
- Install via: `gh extension install github/gh-copilot`
- Key capabilities:
  - **Explain** shell commands you don't understand
  - **Suggest** commands for a described task
  - Run interactively or in scripted sessions
  - Generate scripts and manage files from the terminal

---

### Advanced Features

| Feature | What It Does |
|---|---|
| **Spaces** | Collaborative AI-powered work environments |
| **Spark** | AI-assisted project creation and scaffolding |
| **PR Summaries** | Auto-generates pull request descriptions |
| **Code Review** | AI-assisted review with customizable standards |
| **Instructions Files** | Reusable prompt files for consistent Copilot responses across a team |
| **Knowledge Bases** | Org-specific content to ground Copilot responses (Enterprise only) |
| **MCP** | Model Context Protocol — connects Copilot to external tools and data sources |

---

### Organization-Wide Management

- **Policy management:** control which features are available across IDEs and GitHub.com
- **Copilot Code Review policies:** enable org-wide AI code review
- **Audit logs:** track all Copilot usage events for compliance
- **REST API:** programmatic seat assignment and subscription management

---

## 3. Understand GitHub Copilot Data & Architecture (10–15%)

### Code Suggestion Lifecycle

1. Editor context collected (open files, cursor position, open tabs)
2. Prompt constructed (input processing)
3. Request sent through **proxy** (pre-filtering)
4. Model generates suggestions
5. **Post-processing** / output filtering applied
6. Suggestions delivered to the IDE

### Data Handling Facts

- Context is **ephemeral** — discarded after the session
- **No memory between sessions or chats**
- **Business/Enterprise:** content NOT used for model training
- **Individual:** prompts may be used to improve Copilot models
- Context includes: current file, surrounding code, open tabs, cursor position
- Does **NOT** send your entire repository

### LLM Limitations to Know

| Limitation | Detail |
|---|---|
| **Knowledge cutoff** | May suggest outdated APIs or deprecated patterns |
| **Hallucinations** | Plausible but incorrect or non-existent output |
| **No real-time internet** | Unless explicitly connected via MCP |
| **No cross-session memory** | Each session starts fresh |

✅ **Exam Trap:**
Copilot **does NOT remember** prior chats or sessions — context is always ephemeral.

---

## 4. Apply Prompt Engineering & Context Crafting (10–15%)

### Prompting Techniques

| Technique | Description |
|---|---|
| **Zero-shot** | Task description only — no examples provided |
| **Few-shot** | Include 1+ examples to guide the model's output pattern and format |

### Prompt Best Practices

- Be **specific** — include intent, constraints, and relevant context
- State the **language, framework, and any requirements**
- Use **open files as implicit context** — Copilot reads them
- **Iterate** when the initial result doesn't meet requirements
- Use **chat history** for follow-up refinements

### Good vs. Bad Prompts

**Poor prompt:**
```
write code
```

**Effective prompt:**
```
Write a Python function that validates JWT tokens using RS256.
Handle expired tokens by raising a ValueError.
Include unit tests using pytest.
```

### Prompt Files & Instructions Files

- Reusable files (`.md` or similar) containing standard prompt instructions
- Ensure **consistent responses** across team members
- Can be shared in the repository and version-controlled
- Referenced by Copilot Chat for consistent behavior

### How Context Is Determined

1. Current file content
2. Other open editor tabs
3. Prior messages in the current chat session
4. Instructions files (when configured)

✅ **Exam Pattern:**
Specific + intent + constraints = best results
Iterate on prompts when output is weak or off-target

---

## 5. Improve Developer Productivity (10–15%)

### Code Generation & Refactoring

- Generate boilerplate, functions, and classes from a description
- Refactor code: improve readability, simplify logic, reduce duplication
- **Translate** code between programming languages
- **Modernize** legacy code (e.g., callbacks → async/await, deprecated APIs → current)

### Documentation

- Generate inline comments and JSDoc / docstrings
- Generate README content from existing code context
- Explain complex or unfamiliar code in plain English

### Testing

- Generate **unit tests** based on a function's implementation
- Generate **integration tests** for component interactions
- Identify **edge cases:** null inputs, empty arrays, boundary values, error conditions
- Write **assertions** for expected and unexpected behavior

### Security & Performance

- Ask Copilot to identify potential vulnerabilities in a code block
- Request performance optimizations for slow functions or queries
- Suggest better database query patterns and indexing strategies

### Learning & Reducing Context Switching

- Ask Copilot to explain unfamiliar frameworks or codebases
- Generate examples for new languages **without leaving the IDE**
- Answer questions inline → **reduces context switching**

### Sample Data Generation

- Generate realistic mock data in **JSON, CSV, SQL** formats
- Specify a schema or format for domain-appropriate test data

✅ **Exam Pattern:**
Copilot supports the **full SDLC:** code → test → document → review → security

---

## 6. Configure Privacy, Content Exclusions & Safeguards (10–15%)

### Content Exclusions

- Prevent specific files/directories from being included in Copilot's prompt context
- Configured by **organization owners/admins** — not individual developers
- Can be applied at **organization level** and **repository level**
- Applied automatically in the IDE once configured and propagated

**Common exclusion targets:**
- `.env` files
- `secrets/` directories
- Configuration files with credentials or keys
- Proprietary algorithm files

### Output Ownership & Limitations

- The **developer or organization** owns the code they accept from Copilot
- If a suggestion closely resembles training data → potential **IP / licensing concern**
- Copilot does **NOT** guarantee correctness, security, or regulatory compliance
- Review is **always** required

### Duplication Detection

- Flags suggestions that **closely match publicly available code**
- Helps avoid inadvertent copyright or licensing issues
- Enabled in organization or user settings

### Security Warnings

- Flags suggestions that contain **known vulnerability patterns** (e.g., SQL injection, hardcoded secrets)
- Developer should **review and replace** with a secure alternative — not blindly accept

### Troubleshooting Exclusions

- Excluded content still appearing? → verify:
  1. Exclusion rules are correctly saved
  2. Rules have propagated to all IDEs
  3. Both org-level and repo-level rules are checked
  4. The IDE extension has picked up the latest settings

✅ **Exam Tips:**
- **Admins** configure exclusions → applied automatically to all developers
- **Duplication detection** = protection against inadvertent IP/copyright issues
- **Security warnings** = alerts for known vulnerability patterns in suggestions
- Individual plan users: prompts **may** be used for training
- Business/Enterprise users: content **never** used for training
