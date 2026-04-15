# Decision Log

| Date | Decision | Reasoning | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2026-04-15 | Vanilla JS (no framework) | App has simple, linear data flow. React/Vue would add build complexity with no benefit at this scale. | React, Vue, Svelte |
| 2026-04-15 | Client-side only (no backend) | Keeps user transaction data private by design. Removes hosting complexity. | Node/Express API + DB |
| 2026-04-15 | Papa Parse for CSV | Battle-tested, handles edge cases (BOM, quoted commas, encoding), small bundle size. | csv-parse, custom regex |
| 2026-04-15 | SheetJS (xlsx) for Excel | De-facto standard for browser-side Excel parsing. CDN available, no build needed. | ExcelJS (Node-only) |
| 2026-04-15 | Chart.js for visualisation | Simple API, good defaults, responsive by default. No D3 complexity needed for bar + pie. | D3.js, Recharts, ApexCharts |
| 2026-04-15 | Keyword-rules categorisation | Transparent, user-editable, zero ML dependencies. Good enough for v1. | ML classification, Plaid/Yapily enrichment API |
| 2026-04-15 | Session-only storage | Avoids GDPR complexity and user concern about financial data being stored. | localStorage, IndexedDB |

---

_Add new rows as decisions are made during development._
