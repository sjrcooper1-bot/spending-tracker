import { useMemo, useState } from 'react';
import { aggregateByCategory, totalSpend } from '../aggregator.js';
import SpendingChart from './SpendingChart.jsx';
import { buildCsvContent, csvFilename } from '../exportCsv.js';

/**
 * AnalysisView
 * Full analysis — summary stats, category table, and pie chart.
 * Covers outgoing transactions only (amount < 0).
 *
 * @param {Array}    transactions      — full transaction array
 * @param {Array}    categoryRules     — loaded from categories.json (for colours)
 * @param {Object}   categoryOverrides — { [index]: categoryName }
 * @param {Function} onOverride        — (index, category) => void
 * @param {Function} onBack            — return to upload view
 */
export default function AnalysisView({ transactions, categoryRules, categoryOverrides, onOverride, onBack }) {
  const categoryNames = useMemo(() => categoryRules.map(r => r.category), [categoryRules]);

  // Apply overrides to produce the effective transaction list
  const effectiveTransactions = useMemo(() =>
    transactions.map((t, i) => ({
      ...t,
      category: categoryOverrides[i] ?? t.category,
    })),
    [transactions, categoryOverrides]
  );

  // Outgoings only
  const outgoings = useMemo(
    () => effectiveTransactions.filter(t => t.amount < 0),
    [effectiveTransactions]
  );

  // Build a colour lookup from the rules config
  const colourMap = useMemo(() => {
    return Object.fromEntries(categoryRules.map(r => [r.category, r.colour]));
  }, [categoryRules]);

  // Aggregate
  const breakdown = useMemo(() => {
    const rows = aggregateByCategory(outgoings);
    return rows.map(row => ({
      ...row,
      colour: colourMap[row.category] ?? '#94a3b8',
    }));
  }, [outgoings, colourMap]);

  const spend = useMemo(() => totalSpend(outgoings), [outgoings]);

  // Checksum: sum of category totals should equal total spend
  const checksumTotal = useMemo(
    () => breakdown.reduce((sum, row) => sum + row.total, 0),
    [breakdown]
  );
  const checksumCount = useMemo(
    () => breakdown.reduce((sum, row) => sum + row.count, 0),
    [breakdown]
  );
  const checksumOk =
    checksumCount === outgoings.length &&
    Math.abs(checksumTotal - spend) < 0.01;

  const [selectedCategory, setSelectedCategory] = useState(null);

  const drillDownTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return outgoings.filter(t => t.category === selectedCategory);
  }, [selectedCategory, outgoings]);

  function handleCategoryClick(category) {
    setSelectedCategory(prev => (prev === category ? null : category));
  }

  // Date range
  const { from, to } = useMemo(() => {
    const dates = outgoings.map(t => t.date).filter(Boolean);
    if (!dates.length) return { from: '—', to: '—' };
    return { from: dates[dates.length - 1], to: dates[0] };
  }, [outgoings]);


  // Uncategorised outgoings — track by original index so overrides work correctly
  const uncategorisedOutgoings = useMemo(() =>
    transactions
      .map((t, i) => ({ ...t, index: i, category: categoryOverrides[i] ?? t.category }))
      .filter(t => t.amount < 0 && t.category === 'Uncategorised'),
    [transactions, categoryOverrides]
  );

  return (
    <div className="space-y-6">
      {/* Top bar — back + export */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to files
        </button>

        <button
          onClick={async () => {
            const content = buildCsvContent(transactions, categoryOverrides);
            const filename = csvFilename();
            // Call showSaveFilePicker directly in the click handler to preserve user gesture
            if (window.showSaveFilePicker) {
              try {
                const handle = await window.showSaveFilePicker({
                  suggestedName: filename,
                  types: [{ description: 'CSV file', accept: { 'text/csv': ['.csv'] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
                return;
              } catch (err) {
                if (err.name === 'AbortError') return; // user cancelled
              }
            }
            // Fallback: open in new tab, Ctrl+S to save
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 5000);
          }}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Warning banner */}
      {uncategorisedOutgoings.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
          <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            <strong>{uncategorisedOutgoings.length} transaction{uncategorisedOutgoings.length !== 1 ? 's' : ''}</strong> could not be categorised — review them below before finalising your results.
          </span>
        </div>
      )}

      {/* Needs Review section */}
      {uncategorisedOutgoings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-amber-800">Needs Review</h2>
          <div className="overflow-x-auto rounded-lg border border-amber-200">
            <table className="min-w-full text-sm">
              <thead className="bg-amber-100 text-xs text-amber-700 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Date</th>
                  <th className="px-4 py-2.5 text-left font-medium">Description</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-4 py-2.5 text-left font-medium">Assign category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 bg-white">
                {uncategorisedOutgoings.map(t => (
                  <tr key={t.index} className="hover:bg-amber-50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-2.5 text-gray-800 max-w-xs truncate">{t.description}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-red-600 whitespace-nowrap">
                      -£{Math.abs(t.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value="Uncategorised"
                        onChange={e => onOverride(t.index, e.target.value)}
                        className="text-xs border border-amber-300 bg-white rounded-md px-2 py-1 text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                        aria-label={`Assign category for ${t.description}`}
                      >
                        {categoryNames.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total spend" value={`£${spend.toFixed(2)}`} />
        <StatCard label="Transactions" value={outgoings.length.toLocaleString()} />
        <PeriodCard from={from} to={to} />
      </div>

      {/* Checksum */}
      {checksumOk ? (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          All {outgoings.length} outgoing transactions (£{spend.toFixed(2)}) are included in the breakdown above.
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Checksum mismatch — breakdown shows {checksumCount} transactions (£{checksumTotal.toFixed(2)}) but {outgoings.length} outgoings totalling £{spend.toFixed(2)} were loaded.
        </div>
      )}

      {/* Chart + table side by side on wider screens */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-6">Spend by category</h2>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Doughnut chart */}
          <div className="md:w-64 shrink-0 mx-auto md:mx-0">
            <SpendingChart breakdown={breakdown} onCategoryClick={handleCategoryClick} />
          </div>

          {/* Category breakdown table */}
          <div className="flex-1 w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs text-gray-400 uppercase tracking-wide">
                <tr>
                  <th className="pb-2 text-left font-medium">Category</th>
                  <th className="pb-2 text-right font-medium">Transactions</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                  <th className="pb-2 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {breakdown.map(row => {
                  const isSelected = selectedCategory === row.category;
                  return (
                    <tr
                      key={row.category}
                      onClick={() => handleCategoryClick(row.category)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="py-2.5 flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: row.colour }}
                        />
                        <span className="text-gray-800">{row.category}</span>
                        {isSelected && (
                          <svg className="ml-auto text-blue-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-gray-500">
                        {row.count.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-medium text-gray-900">
                        £{row.total.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right text-gray-400 w-16">
                        {row.percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td className="pt-3 font-semibold text-gray-800">Total</td>
                  <td className="pt-3 text-right text-gray-500">{outgoings.length}</td>
                  <td className="pt-3 text-right font-semibold text-gray-900">£{spend.toFixed(2)}</td>
                  <td className="pt-3 text-right text-gray-400">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      {/* Drill-down panel */}
      {selectedCategory && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              {selectedCategory}
              <span className="ml-2 text-sm font-normal text-gray-400">
                {drillDownTransactions.length} transaction{drillDownTransactions.length !== 1 ? 's' : ''} · £{drillDownTransactions.reduce((s, t) => s + Math.abs(t.amount), 0).toFixed(2)}
              </span>
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Date</th>
                  <th className="px-4 py-2.5 text-left font-medium">Description</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {drillDownTransactions.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-2.5 text-gray-800">{t.description}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-red-600 whitespace-nowrap">
                      -£{Math.abs(t.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, small = false }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-4 shadow-sm">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className={`mt-1 font-semibold text-gray-900 ${small ? 'text-sm' : 'text-2xl'}`}>{value}</p>
    </div>
  );
}

function PeriodCard({ from, to }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-4 shadow-sm">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Period</p>
      <div className="mt-1 space-y-0.5">
        <p className="text-xs text-gray-400">From</p>
        <p className="text-sm font-semibold text-gray-900 leading-tight">{from}</p>
        <p className="text-xs text-gray-400 mt-1">To</p>
        <p className="text-sm font-semibold text-gray-900 leading-tight">{to}</p>
      </div>
    </div>
  );
}
