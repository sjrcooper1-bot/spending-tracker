# Product Requirements Document
## Bank Statement Spending Analyser
**Version:** 1.1  
**Date:** 15 April 2026  
**Status:** Final

---

## 1. Overview

A client-side web application that lets users upload one or more bank statement files (CSV or Excel), automatically categorises every transaction, and presents a clear visual and numeric breakdown of spending by category. No data ever leaves the user's device — all processing happens in the browser.

---

## 2. Goals

- Make it effortless to understand where money is going across any time period
- Support multiple banks and statement formats in a single session
- Require zero technical knowledge to operate
- Look polished and feel trustworthy

---

## 3. Users

- Individuals reviewing personal finances
- People preparing for a mortgage, loan application, or business exit
- Anyone who wants a quick snapshot of spending without a subscription service

---

## 4. Core Features

### 4.1 File Import

- Accept `.csv`, `.xlsx`, and `.xls` files
- Allow multiple files to be uploaded in a single session (drag-and-drop or file picker)
- Support files from different banks simultaneously
- Show each uploaded file as a labelled card with filename, row count, and a remove button
- Display a clear error message if a file cannot be parsed (wrong format, empty, corrupted)

### 4.2 Transaction Parsing

- Auto-detect common bank statement column layouts (date, description, amount, debit/credit)
- Handle both debit-only columns and combined positive/negative amount columns
- Strip out non-transaction rows (headers, footers, summary rows, balance rows)
- Deduplicate identical rows if the same file is uploaded twice
- Display a preview table of imported rows before analysis so the user can confirm data looks correct

### 4.3 Categorisation Engine

- Automatically assign each transaction to one spending category based on the merchant/description text
- The category keyword list is stored in a configurable `categories.json` file — categories can be added, renamed, or expanded without touching application code
- Format: each category has a name, a colour, and an array of keyword strings matched case-insensitively against transaction descriptions (partial match)

**Default categories:**

| Category | Example merchants / keywords |
|----------|------------------------------|
| Groceries | Tesco, Sainsbury's, Lidl, ALDI, Waitrose, Co-op, Morrisons |
| Restaurants & Takeaways | McDonald's, Deliveroo, Uber Eats, Just Eat, Nando's, Wagamama |
| Utilities | British Gas, EDF, Thames Water, BT, Sky, Octopus, Bulb |
| Housing | Rent, Mortgage, Estate Agent, Letting |
| Transport | TfL, Trainline, National Rail, Shell, BP, Esso, Uber, fuel |
| Shopping | Amazon, ASOS, Next, Argos, eBay, John Lewis |
| Health & Wellbeing | Boots, Superdrug, Gym, Dentist, Pharmacy |
| Entertainment | Netflix, Spotify, Disney+, Cinema, Apple TV |
| Finance & Insurance | Direct Debit, loan, insurance, standing order |
| Uncategorised | Anything not matched above |

- Show the matched category on each transaction row in the preview
- Allow the user to manually override a category via a dropdown before or after analysis
- Uncategorised transactions are flagged prominently: a separate "Needs Review" section appears above the analysis results, highlighted in amber, listing every unmatched transaction with a dropdown to assign a category manually

### 4.4 Analysis View

- Triggered by a prominent "Analyse" button
- Covers **outgoing transactions only** — credits and incoming payments are filtered out
- Shows the full date range covered across all uploaded files
- Displays total spend across all categories
- If any uncategorised transactions exist, a warning banner appears at the top: *"X transactions could not be categorised — review them below before finalising your results"*

**Numeric breakdown (table):**

| Category | No. of transactions | Total spent | % of total |
|----------|---------------------|-------------|------------|

**Visual breakdown:**
- Pie chart showing proportion of spend per category
- Hovering a slice shows the category name, total, and percentage
- Colour-coded — each category has a distinct, accessible colour

**Exports:**
- **CSV export:** downloads a flat file of all transactions with their assigned category, date, description, and amount
- **PDF export:** generates a one-page summary — date range, total spend, category breakdown table, and the pie chart rendered as an image
- Both exports are generated entirely in the browser — no server required

### 4.5 Session Management

- All data lives in the browser session only — nothing is sent to a server
- A "Clear All" button resets the app to its initial state
- No login, no account, no data stored after the browser tab is closed

---

## 5. Design Requirements

- Clean, modern aesthetic — white/light background, generous whitespace
- Readable typography — minimum 16px body text
- Responsive: works well on a laptop or large tablet; mobile is secondary
- Smooth transitions when switching between upload view and analysis view
- Colour palette: calm and professional (finance, not fintech startup)
- Accessible: sufficient colour contrast, keyboard navigable, clear focus states
- Progress/loading indicator while file parsing and categorisation runs

---

## 6. Technical Constraints

| Constraint | Decision |
|------------|----------|
| All processing | Client-side only (no backend required) |
| CSV parsing | Papa Parse library |
| Excel parsing | SheetJS (xlsx) library |
| Charts | Chart.js |
| PDF export | jsPDF + html2canvas |
| Styling | Tailwind CSS |
| Framework | React |
| Deployment | Vercel (static export) |

---

## 7. Out of Scope (v1)

- User accounts or saved history
- Connecting directly to bank APIs (Open Banking)
- Multi-currency support
- Income / credits analysis
- Editing category definitions through the UI (managed via `categories.json` file instead)

---

## 8. Success Criteria

- A user can go from a freshly downloaded bank statement to a categorised pie chart in under two minutes
- The app correctly categorises at least 80% of transactions without manual correction
- The interface requires no instructions to understand
- No errors when uploading files from at least three major UK banks (Barclays, HSBC, Monzo)
- CSV and PDF exports open correctly and contain accurate data

---

## 9. Decisions Log

| Question | Decision |
|----------|----------|
| Category list hardcoded or configurable? | Configurable `categories.json` file |
| Flag uncategorised transactions? | Yes — prominent amber warning + review table with manual override |
| Income/credits in scope? | No — outgoings only |
| Export in v1? | Yes — both PDF and CSV, generated in the browser |
