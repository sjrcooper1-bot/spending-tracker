# CLAUDE.md — Spending Tracker

## Project
**Name**: Spending Tracker  
**Description**: Browser-based app that parses bank statement CSV/Excel uploads, categorises transactions, and visualises spending by category.  
**Target user**: Individuals who want a quick, private way to understand their spending without connecting bank accounts.

---

## Tech Stack
| Layer | Tool | Version |
|-------|------|---------|
| UI | Vanilla HTML/CSS/JS | ES2022 |
| CSV parsing | Papa Parse | 5.x |
| Excel parsing | SheetJS (xlsx) | 0.18.x |
| Charts | Chart.js | 4.x |
| Dev server | serve (npx) | latest |
| Tests | Vitest | latest |

No framework. No build step for development. The app runs entirely in the browser.

---

## Folder Structure
```
spending-tracker/
├── .claude/CLAUDE.md       ← you are here
├── public/
│   ├── index.html          ← entry point
│   ├── style.css           ← all styles
│   └── assets/             ← icons, images
├── src/
│   ├── parser.js           ← CSV/Excel → transaction array
│   ├── categoriser.js      ← keyword rules → category labels
│   ├── aggregator.js       ← sum totals per category
│   ├── renderer.js         ← build DOM table + trigger charts
│   └── charts.js           ← Chart.js bar + pie chart logic
├── tests/
│   ├── parser.test.js
│   ├── categoriser.test.js
│   └── aggregator.test.js
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DECISIONS.md
│   └── SETUP.md
├── spec/
│   └── plan.md
├── .gitignore
├── package.json
└── README.md
```

---

## Coding Conventions
- ES modules (`import/export`) throughout
- `async/await` — no `.then()` chains
- 2-space indentation
- camelCase for variables/functions, PascalCase for classes
- Descriptive names — no abbreviations except well-known ones (csv, xlsx)
- Comment the *why*, not the *what*
- One concern per file
- Fail loudly with useful error messages shown in the UI — no silent failures

---

## Key Commands
```bash
# Dev server (serves /public on localhost:3000)
npx serve public -l 3000

# Run tests
npm test

# No build step needed for development
```

---

## Rules
- **Always check /spec/plan.md before starting a new phase**
- Never store uploaded file contents beyond the current session
- Never send transaction data to any external server
- All parsing and categorisation happens client-side only
