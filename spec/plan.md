# GSD Project Plan — Spending Tracker

> Fill this in properly during Lesson 8. Outline is pre-populated based on project scope.

---

## Phase 0 — Foundation
**Goal**: Project is set up, runs locally, and has a visible skeleton UI.

### Tasks
- [ ] Scaffold complete (folders, git, npm)
- [ ] `index.html` loads in browser with placeholder layout
- [ ] CDN libraries (Papa Parse, SheetJS, Chart.js) loading without errors
- [ ] Basic CSS layout in place

**DONE WHEN**: You can open `localhost:3000` and see a styled page with an upload area.

---

## Phase 1 — File Upload & Parsing
**Goal**: User can upload CSV and Excel files and raw transactions appear in a table.

### Tasks
- [ ] Drag-and-drop + click-to-upload file input
- [ ] CSV parsing via Papa Parse → transaction array
- [ ] Excel parsing via SheetJS → transaction array
- [ ] Auto-detect columns (date, description, amount)
- [ ] Display raw transactions in a sortable table
- [ ] Handle multiple files uploaded together

**DONE WHEN**: Upload a real bank statement → see all rows in a table with date, description, amount.

---

## Phase 2 — Categorisation
**Goal**: Transactions are automatically grouped into spending categories.

### Tasks
- [ ] Define default category rules (keyword → category)
- [ ] Apply rules to all transactions
- [ ] Show category column in transaction table
- [ ] Allow user to manually re-categorise a row
- [ ] "Uncategorised" bucket for unmatched transactions

**DONE WHEN**: 80%+ of a real statement's transactions are correctly categorised without manual edits.

---

## Phase 3 — Visualisation & Summary
**Goal**: User sees total spend per category as numbers and charts.

### Tasks
- [ ] Summary table: category | total | % of spend
- [ ] Bar chart: spend by category
- [ ] Pie/doughnut chart: proportion of spend
- [ ] Date range filter (optional)
- [ ] Export summary as CSV (optional)

**DONE WHEN**: Upload a statement → see charts and totals that match manual calculation.

---

## Backlog (future phases)
- Persistent custom category rules (localStorage opt-in)
- Multi-currency support
- PDF export
- Month-over-month comparison
- Mobile-optimised layout
