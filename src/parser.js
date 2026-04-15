/**
 * parser.js
 * Converts uploaded File objects (CSV or Excel) into a flat transaction array.
 * Relies on Papa Parse (CSV) and SheetJS (Excel) loaded via CDN in index.html.
 */

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
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        try {
          resolve(normaliseRows(results.data, file.name));
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
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return normaliseRows(rows, file.name);
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
