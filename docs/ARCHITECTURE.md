# Architecture Overview

## System Type
Client-side single-page application (SPA). No server, no database, no network calls after initial page load.

## Data Flow

```
User uploads files
       │
       ▼
[parser.js]
  CSV  → Papa Parse → transaction[]
  XLSX → SheetJS    → transaction[]
       │
       ▼
[categoriser.js]
  transaction[] + keyword rules → categorised transaction[]
       │
       ▼
[aggregator.js]
  categorised transaction[] → { category: totalAmount }[]
       │
       ├──► [renderer.js] → DOM table (line-by-line breakdown)
       │
       └──► [charts.js]   → Chart.js bar chart + pie chart
```

## Transaction Object Shape
```js
{
  date: '2024-03-15',      // ISO string
  description: string,     // raw merchant/payee text
  amount: number,          // negative = debit, positive = credit
  category: string,        // assigned by categoriser
  source: string           // filename it came from
}
```

## Categorisation Strategy
Rule-based keyword matching (v1). Each rule is:
```js
{ keywords: ['tesco', 'sainsbury', 'aldi'], category: 'Groceries' }
```
Rules are checked in order; first match wins. Unmatched transactions fall into "Uncategorised".

TODO: Consider ML-based categorisation in a future phase.

## State Management
No framework state. A single module-level `transactions[]` array holds the current session's data. All UI updates re-render from this array.

## Privacy
- Zero network requests after page load
- No localStorage or IndexedDB persistence (session only)
- No analytics or tracking scripts

## TODO / Unknowns
- [ ] How to handle banks that use different CSV column orderings
- [ ] Whether to support multi-currency statements
- [ ] Export functionality (PDF / summary CSV)
- [ ] Persistent category rules (localStorage opt-in?)
