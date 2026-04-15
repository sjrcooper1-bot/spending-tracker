# CLAUDE.md — Spending Tracker

## Project
**Name**: Spending Tracker  
**Description**: Browser-based app that parses bank statement CSV/Excel uploads, categorises transactions, and visualises spending by category.  
**Target user**: Individuals who want a quick, private way to understand their spending without connecting bank accounts.

---

## Tech Stack
| Layer | Tool | Version |
|-------|------|---------|
| Framework | React | 18.x |
| Styling | Tailwind CSS | 3.x |
| CSV parsing | Papa Parse | 5.x |
| Excel parsing | SheetJS (xlsx) | 0.18.x |
| Charts | Chart.js | 4.x |
| PDF export | jsPDF + html2canvas | latest |
| Build | Vite | latest |
| Tests | Vitest | latest |
| Deployment | Vercel (static export) | — |

React + Vite for the build. All processing is client-side — no backend, no server.

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
# Dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Rules
- **Always check /spec/plan.md before starting a new phase**
- Never store uploaded file contents beyond the current session
- Never send transaction data to any external server
- All parsing and categorisation happens client-side only
