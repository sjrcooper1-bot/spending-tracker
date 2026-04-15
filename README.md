# Spending Tracker

Upload your bank statement CSV or Excel files and instantly see where your money goes — broken down by category, with charts.

No accounts. No logins. Everything stays in your browser.

---

## Quick Start

```bash
# 1. Clone or download the project
cd spending-tracker

# 2. Install dev dependencies (testing only — no build step needed)
npm install

# 3. Start the dev server
npx serve public -l 3000

# 4. Open your browser
open http://localhost:3000
```

That's it. Drop your bank statement files onto the upload area and go.

---

## Tech Stack

| Purpose | Tool |
|---------|------|
| UI | Vanilla HTML/CSS/JS |
| CSV parsing | Papa Parse 5.x |
| Excel parsing | SheetJS (xlsx) 0.18.x |
| Charts | Chart.js 4.x |
| Tests | Vitest |

No framework. No backend. No data leaves your device.

---

## Folder Structure

```
spending-tracker/
├── public/          # Served files (HTML, CSS, assets)
├── src/             # JS modules (parser, categoriser, charts…)
├── tests/           # Unit tests
├── docs/            # Architecture, decisions, setup guides
├── spec/            # Project plan (GSD phases)
└── .claude/         # AI assistant config
```

---

## Supported File Formats

- `.csv` — standard comma-separated bank exports
- `.xlsx` / `.xls` — Excel bank statement exports

Most UK and international banks export in one of these formats from their online banking portal.

---

## How It Works

1. **Upload** one or more statement files
2. **Parse** — columns are auto-detected (date, description, amount)
3. **Categorise** — transactions are matched to categories by keyword rules
4. **Review** — edit any miscategorised transactions
5. **Visualise** — bar chart and pie chart of spend per category

---

> Built with [Claude Code](https://claude.ai/code) + Vibe Coding Incubator
