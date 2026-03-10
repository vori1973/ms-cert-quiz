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

### Copilot Chat — Slash Commands

Type `/` in the chat prompt box to invoke a slash command. No need to write complex prompts for common tasks.

| Command | Description | Available In |
|---|---|---|
| `/explain` | Explain how the code in your active editor works | VS Code, Visual Studio, JetBrains, Xcode |
| `/fix` | Propose a fix for problems in the selected code | VS Code, Visual Studio, JetBrains, Xcode |
| `/tests` | Generate unit tests for the selected code | VS Code, Visual Studio, JetBrains, Xcode |
| `/help` | Quick reference and basics of using GitHub Copilot | VS Code, Visual Studio, JetBrains, Xcode |
| `/fixTestFailure` | Find and fix a failing test | VS Code only |
| `/clear` | Start a new chat session | VS Code, GitHub Web, Visual Studio |
| `/new` | Start a new project or conversation | VS Code, GitHub Web, Visual Studio |
| `/doc` | Add documentation comments for a symbol | Visual Studio, Xcode |
| `/optimize` | Analyze and improve running time of the selected code | Visual Studio only |
| `/simplify` | Simplify the current code selection | Xcode only |
| `/delete` | Delete a conversation | GitHub Web only |
| `/rename` | Rename a conversation | GitHub Web only |

✅ **Exam Tips:**
- `/explain` and `/fix` are available in **all four** IDE families
- `/fixTestFailure` is **VS Code only**
- `/doc` and `/optimize` are **not** available in VS Code Chat

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

> ⚠️ **Deprecation:** The `gh copilot` extension was deprecated on **October 25, 2025**.
> It is replaced by the new **GitHub Copilot CLI** — a standalone agentic assistant (`copilot` command) available to Copilot Pro/Enterprise users.
> Any earlier references in this cheat sheet to the Copilot “CLI” or to "`gh copilot` commands" refer specifically to this legacy extension, which remains exam-relevant.

**Legacy `gh copilot` commands (still exam-relevant):**

| Command | What It Does |
|---|---|
| `gh copilot suggest "<task description>"` | Suggests a shell command for the described task |
| `gh copilot explain "<command>"` | Explains what a given shell command does |
| `gh copilot config` | Configure CLI options |
| `gh copilot alias` | Generate shell-specific aliases |

**Install (legacy):** `gh extension install github/gh-copilot`

**New Copilot CLI (post-Oct 2025):**
- Standalone agentic tool — runs multi-step workflows, applies code changes, debugs issues from the terminal
- Available to **Copilot Pro and Enterprise** users only (not Free plan)

✅ **Exam Tip:**
`gh copilot suggest` = "I need to do X, what command should I run?"
`gh copilot explain` = "I see this command — what does it do?"

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

**Built-in MCP skills available in GitHub Web (via `@github`):**

| MCP Skill | What It Does |
|---|---|
| `create_branch` | Create a new branch in a repository |
| `create_or_update_file` | Add or modify a file with specific content |
| `push_files` | Push multiple files to a branch |
| `update_pull_request_branch` | Update a PR branch with changes from the base |
| `merge_pull_request` | Merge a pull request |
| `get_me` | Retrieve your GitHub user information |
| `search_users` | Find GitHub users by name |

✅ **Exam Tip:**
MCP skills let Copilot **take actions** on GitHub (create branches, push files, merge PRs) — not just answer questions.

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

### Data Retention — What Is Stored and For How Long

| Surface | Data Retained | Retention Period |
|---|---|---|
| **IDE code editor** (completions & chat) | Prompts, suggestions, context | **Zero — discarded immediately** after session |
| **GitHub.com / CLI / Mobile** (outside IDE) | Prompts, suggestions, context | **28 days** |
| **Copilot Coding Agent / Agent Mode** | Session logs (plan, steps taken, outputs) | **Life of the account** (or until user deletes the session) |
| **User engagement data** (all surfaces) | Usage telemetry, activity signals | **2 years** |
| **Metrics API** (`last_activity_at`) | Seat activity data | **90 days** (cannot be changed) |

**Key rules to remember:**
- **Business & Enterprise:** prompts, session logs, and outputs are **never used to train** GitHub's public AI models — regardless of surface
- **Individual plan:** prompts **may** be used to improve Copilot models
- The Coding Agent exception — session logs persist long-term because agent workflows (like PRs and issues) require a persistent record to function

✅ **Exam Trap:**
The "zero retention" rule applies **only to the IDE editor**.
Outside the IDE (CLI, GitHub.com chat, mobile) → **28-day retention** applies even on Business/Enterprise.
Coding Agent logs → stored **indefinitely** (life of account).

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

### Chat Participants (`@`) — Adding Scoped Context

Type `@` in chat to direct your question to a participant with specialized knowledge.

| Participant | What It Knows | Available In |
|---|---|---|
| `@workspace` | Full project structure, files, and relationships | VS Code, JetBrains |
| `@github` | GitHub-specific skills (search, issues, PRs, repos) | VS Code, GitHub Web |
| `@terminal` | VS Code terminal shell and its current contents | VS Code only |
| `@vscode` | VS Code commands, settings, and features | VS Code only |
| `@azure` | Azure services — how to use, deploy, and manage them | VS Code (preview) |

**GitHub Web `@` mentions** (attach context to chat):

| Mention Type | Example |
|---|---|
| File | `@` then select a file |
| Issue / PR | `@` then select an issue or pull request |
| Repository | `@` then select a repository |
| Discussion | `@` then select a discussion |

✅ **Exam Tip:**
Use `@workspace` when your question spans multiple files.
Use `@github` to search code, issues, or PRs without leaving chat.

---

### Context Variables (`#`) — Pinning Specific Content

Type `#` in VS Code Chat to attach a precise piece of context to your prompt.

| Variable | What It Includes |
|---|---|
| `#file` | The entire current file's content |
| `#selection` | Currently selected text |
| `#function` | The current function or method |
| `#class` | The current class |
| `#block` | The current code block |
| `#line` | The current line of code |
| `#comment` | The current comment |
| `#sym` | The current symbol |
| `#path` | The file path only |
| `#project` | High-level project context |

**Visual Studio equivalents (use `#` + filename):**

| Reference | Example |
|---|---|
| Specific file | `#MyFile.cs` |
| Multiple files | `#MyFile.cs #MyFile2.cs` |
| Specific lines | `#MyFile.cs: 66-72` |
| Solution context | `#solution` |

✅ **Exam Tip:**
`#file` = whole file; `#selection` = only what you highlighted.
Combining `@workspace` + `#file` gives Copilot both broad and focused context.

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

**Slash commands for test generation (in IDE Chat):**

| Command | What It Does | Where Available |
|---|---|---|
| `/tests` | Generate unit tests for selected code | VS Code, Visual Studio, JetBrains, Xcode |
| `/fixTestFailure` | Find and fix a failing test | VS Code only |
| `/fix` | Propose a fix for problems in selected code | VS Code, Visual Studio, JetBrains, Xcode |

**Useful chat participants for testing (see Domain 4 for full reference):**

| Participant | What It Adds |
|---|---|
| `@workspace` | Full project structure — use for cross-file test generation |
| `@github` | GitHub-specific skills (search, issues, repos) |
| `@terminal` | VS Code terminal context |

**How to generate tests effectively:**
1. Open the file you want to test
2. Select the function or class
3. Open Copilot Chat and type `/tests`
4. Add constraints: framework, coverage requirements, edge cases
5. Review and validate — Copilot may generate incorrect assertions

**Example prompts:**
```
/tests Generate Jest unit tests for the selected function. Cover edge cases including empty input and invalid types.
```
```
@workspace /tests Write integration tests for the quiz selection logic, mocking the fs module.
```

✅ **Exam Tip:**
Use `@workspace` with `/tests` when you need cross-file/project context — this lets Copilot see beyond the current file.

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
- Applied automatically in the IDE once configured and propagated

**Configuration levels (from narrowest to widest scope):**

| Level | Who Configures | Scope |
|---|---|---|
| **Repository** | Repo admins | That repository only |
| **Organization** | Org owners | All repos assigned to org seats |
| **Enterprise** | Enterprise admins | All Copilot users in the enterprise |

**Exact UI paths to configure exclusions:**

- **Repository level:**
  `Repository → Settings → Copilot → Content exclusion`

- **Organization level:**
  `Profile photo → Your organizations → [Org] → Settings → Copilot → Content exclusion`

- **Enterprise level:**
  `Enterprise → AI controls → Copilot → Content exclusion`

**Propagation time:**
> After adding or changing content exclusions, **changes can take up to 30 minutes** to take effect in IDEs where settings are already loaded.
> To apply immediately: close and reopen the IDE, or reload the Copilot extension.

**Exclusion pattern syntax (fnmatch, case-insensitive):**

Repository-level (simple list):
```yaml
- "secrets.json"
- "secret*"
- "*.cfg"
- "/scripts/**"
- "**/.env"
```

Organization-level (YAML with repository references):
```yaml
# Apply to ALL repositories in the org
"*":
  - "**/.env"
  - "**/secrets/**"

# Apply to a specific repo by name
my-repo:
  - "/src/some-dir/kernel.rs"
  - "*.cfg"

# Apply to a repo by full URL
https://github.com/myorg/myrepo.git:
  - "/config/credentials/**"
  - "{server,session}*"
```

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
  2. Wait up to **30 minutes** for propagation — or reload/restart the IDE
  3. Both org-level and repo-level rules are checked
  4. The IDE extension has picked up the latest settings (check extension version)
  5. Inherited enterprise-level rules (shown as gray, read-only) take precedence

✅ **Exam Tips:**
- **Admins** configure exclusions → applied automatically to all developers
- **Duplication detection** = protection against inadvertent IP/copyright issues
- **Security warnings** = alerts for known vulnerability patterns in suggestions
- Individual plan users: prompts **may** be used for training
- Business/Enterprise users: content **never** used for training
