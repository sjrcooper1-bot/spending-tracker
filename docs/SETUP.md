# Development Environment Setup

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| A modern browser | Chrome 110+ / Firefox 110+ / Edge 110+ | — |

## First-Time Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd spending-tracker

# 2. Install dev dependencies (Vitest for tests only)
npm install

# 3. Start dev server
npx serve public -l 3000

# 4. Open browser
# http://localhost:3000
```

## Running Tests

```bash
npm test          # run once
npm run test:watch  # watch mode
```

## Project Has No Build Step

All JS uses ES modules loaded directly in the browser via `<script type="module">`. Libraries are loaded from CDN in `index.html`. This means:
- No Webpack, Vite, or Rollup needed for development
- Edit a file → refresh browser → done
- Tests use Vitest which handles modules natively

## Adding a CDN Library

If you need a new library, add a `<script>` tag to `public/index.html` and document the decision in `docs/DECISIONS.md`.

## Common Issues

**Port 3000 already in use**
```bash
npx serve public -l 3001
```

**CSV not parsing correctly**
Check the browser console. Papa Parse logs detection details. Most issues are encoding (save as UTF-8) or the bank using semicolons instead of commas.

**Excel file shows no data**
SheetJS reads the first sheet by default. If the bank puts data on sheet 2, this needs handling in `src/parser.js`.
