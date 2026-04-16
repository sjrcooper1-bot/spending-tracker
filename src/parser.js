/**
 * parser.js
 * Converts uploaded File objects (CSV or Excel) into a flat transaction array.
 */
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Parse a single File into an array of raw transaction objects.
 * @param {File} file
 * @returns {Promise<Array<{date: string, description: string, amount: number, source: string}>>}
 */
export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv') {
    return parseCsv(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error(`Unsupported file type: .${ext}. Please upload a CSV or Excel file.`);
  }
}

/**
 * Parse multiple files and merge into one transaction array.
 * @param {FileList|File[]} files
 * @returns {Promise<Array>}
 */
export async function parseFiles(files) {
  const results = await Promise.all(Array.from(files).map(parseFile));
  return results.flat();
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    // First pass: parse without headers to inspect the raw first row
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete(results) {
        try {
          const hasHeaders = firstRowLooksLikeHeaders(results.data);
          if (hasHeaders) {
            // Re-parse with header:true for named-column normalisation
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete(r2) {
                try { resolve(normaliseRows(r2.data, file.name)); }
                catch (err) { reject(err); }
              },
              error(err) { reject(new Error(`CSV parse error in ${file.name}: ${err.message}`)); },
            });
          } else {
            // No headers — infer columns from the data values themselves
            resolve(normaliseRowsPositional(results.data, file.name));
          }
        } catch (err) {
          reject(err);
        }
      },
      error(err) {
        reject(new Error(`CSV parse error in ${file.name}: ${err.message}`));
      },
    });
  });
}

async function parseExcel(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Try with headers first; fall back to positional if detection fails
  const rowsWithHeaders = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (rowsWithHeaders.length && firstRowLooksLikeHeaders(
    [Object.keys(rowsWithHeaders[0]), ...rowsWithHeaders.map(r => Object.values(r))]
  )) {
    return normaliseRows(rowsWithHeaders, file.name);
  }

  // Headerless Excel — use raw array rows
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  return normaliseRowsPositional(rawRows, file.name);
}

const DATE_RE = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$|^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/;
const AMOUNT_RE = /^-?[£$€]?\s*[\d,]+\.?\d*$|^\([\d,]+\.?\d*\)$/;

/**
 * Returns true if the first row contains header-like strings (not raw data).
 * Detects headerless files by checking whether first-row values look like
 * dates or numeric amounts rather than column label text.
 */
function firstRowLooksLikeHeaders(rows) {
  if (!rows || !rows.length) return false;
  const firstRow = Array.isArray(rows[0]) ? rows[0] : Object.keys(rows[0]);
  const hasDate = firstRow.some(cell => DATE_RE.test(String(cell).trim()));
  const hasAmount = firstRow.some(cell => AMOUNT_RE.test(String(cell).trim().replace(/[£$€,\s]/g, '')));
  // If the first row contains both a date and an amount, it's definitely a data row
  if (hasDate && hasAmount) return false;
  // Otherwise fall back to majority check
  const dataLikeCells = firstRow.filter(cell => {
    const s = String(cell).trim();
    return DATE_RE.test(s) || AMOUNT_RE.test(s.replace(/[£$€,\s]/g, ''));
  });
  return dataLikeCells.length < firstRow.length / 2;
}

/**
 * Infer date/description/amount columns from value patterns across rows,
 * then return normalised transactions. Used when the file has no header row.
 */
function normaliseRowsPositional(rows, filename) {
  if (!rows.length) throw new Error(`No data found in ${filename}`);

  const colCount = rows[0].length;
  let dateIdx = -1, amountIdx = -1, descIdx = -1;

  // Score each column index by how many rows match each pattern
  const dateScores = new Array(colCount).fill(0);
  const amountScores = new Array(colCount).fill(0);

  for (const row of rows) {
    for (let i = 0; i < colCount; i++) {
      const s = String(row[i]).trim();
      if (DATE_RE.test(s)) dateScores[i]++;
      if (AMOUNT_RE.test(s.replace(/[£$€,\s]/g, ''))) amountScores[i]++;
    }
  }

  dateIdx = dateScores.indexOf(Math.max(...dateScores));
  amountIdx = amountScores.indexOf(Math.max(...amountScores));

  // Description is the remaining column with the longest average string length
  const remaining = [...Array(colCount).keys()].filter(i => i !== dateIdx && i !== amountIdx);
  if (!remaining.length) throw new Error(`Could not identify a description column in ${filename}`);

  descIdx = remaining.reduce((best, i) => {
    const avgLen = rows.reduce((sum, r) => sum + String(r[i]).length, 0) / rows.length;
    const bestLen = rows.reduce((sum, r) => sum + String(r[best]).length, 0) / rows.length;
    return avgLen > bestLen ? i : best;
  }, remaining[0]);

  return rows
    .map(row => ({
      date: String(row[dateIdx]).trim(),
      description: String(row[descIdx]).trim(),
      amount: parseAmount(row[amountIdx]),
      category: 'Uncategorised',
      source: filename,
    }))
    .filter(t => !isNaN(t.amount) && t.date);
}

/**
 * Map arbitrary bank column names to our standard shape.
 * Banks use wildly different headers — this does a best-effort match.
 */
function normaliseRows(rows, filename) {
  if (!rows.length) throw new Error(`No data found in ${filename}`);

  const headers = Object.keys(rows[0]);
  const dateCol = findCol(headers, ['date', 'transaction date', 'posted date', 'value date']);
  const descCol = findCol(headers, ['description', 'details', 'payee', 'merchant', 'narrative', 'memo']);
  const amountCol = findCol(headers, ['amount', 'debit', 'credit', 'value', 'sum']);

  if (!dateCol || !descCol || !amountCol) {
    throw new Error(
      `Could not detect columns in ${filename}. ` +
      `Found headers: ${headers.join(', ')}. ` +
      `Expected columns for date, description, and amount.`
    );
  }

  return rows
    .map(row => ({
      date: String(row[dateCol]).trim(),
      description: String(row[descCol]).trim(),
      amount: parseAmount(row[amountCol]),
      category: 'Uncategorised',
      source: filename,
    }))
    .filter(t => !isNaN(t.amount));
}

function findCol(headers, candidates) {
  return headers.find(h =>
    candidates.some(c => h.toLowerCase().includes(c))
  );
}

function parseAmount(raw) {
  if (typeof raw === 'number') return raw;
  // Strip currency symbols, spaces, handle (negative) format
  const str = String(raw).replace(/[£$€,\s]/g, '').replace(/\((.+)\)/, '-$1');
  return parseFloat(str);
}
