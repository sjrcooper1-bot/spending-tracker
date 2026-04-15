/**
 * exportCsv.js
 * Builds CSV content as a string. The component is responsible for triggering
 * the download so that showSaveFilePicker is called directly within the user
 * gesture handler (required by Chrome).
 */

export function buildCsvContent(transactions, categoryOverrides) {
  const rows = transactions.map((t, i) => ({
    date: t.date,
    description: t.description,
    amount: t.amount.toFixed(2),
    category: categoryOverrides[i] ?? t.category,
    source: t.source,
  }));

  const header = ['Date', 'Description', 'Amount', 'Category', 'Source'];
  const lines = [
    header.join(','),
    ...rows.map(r => [
      csvCell(r.date),
      csvCell(r.description),
      csvCell(r.amount),
      csvCell(r.category),
      csvCell(r.source),
    ].join(',')),
  ];

  // '\uFEFF' BOM ensures Excel on Windows reads the encoding correctly
  return '\uFEFF' + lines.join('\n');
}

export function csvFilename() {
  return `spending-export-${new Date().toISOString().slice(0, 10)}.csv`;
}

function csvCell(value) {
  const str = String(value ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}
