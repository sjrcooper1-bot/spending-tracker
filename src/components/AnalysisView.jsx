import { useMemo } from 'react';
import { aggregateByCategory, totalSpend } from '../aggregator.js';
import SpendingChart from './SpendingChart.jsx';

/**
 * AnalysisView
 * Full analysis — summary stats, category table, and pie chart.
 * Covers outgoing transactions only (amount < 0).
 *
 * @param {Array}    transactions  — full transaction array
 * @param {Array}    categoryRules — loaded from categories.json (for colours)
 * @param {Function} onBack        — return to upload view
 */
export default function AnalysisView({ transactions, categoryRules, onBack }) {
  // Outgoings only
  const outgoings = useMemo(
    () => transactions.filter(t => t.amount < 0),
    [transactions]
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

  // Date range
  const { from, to } = useMemo(() => {
    const dates = outgoings.map(t => t.date).filter(Boolean);
    if (!dates.length) return { from: '—', to: '—' };
    return { from: dates[dates.length - 1], to: dates[0] };
  }, [outgoings]);

  const uncategorisedCount = outgoings.filter(t => t.category === 'Uncategorised').length;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to files
      </button>

      {/* Uncategorised warning */}
      {uncategorisedCount > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
          <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            <strong>{uncategorisedCount} transaction{uncategorisedCount !== 1 ? 's' : ''}</strong> could not be categorised and are excluded from the chart below.
            You can add keywords to <code className="text-xs bg-amber-100 px-1 rounded">public/categories.json</code> to catch them.
          </span>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total spend" value={`£${spend.toFixed(2)}`} />
        <StatCard label="Transactions" value={outgoings.length.toLocaleString()} />
        <StatCard label="Period" value={`${from} – ${to}`} small />
      </div>

      {/* Chart + table side by side on wider screens */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-6">Spend by category</h2>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Doughnut chart */}
          <div className="md:w-64 shrink-0 mx-auto md:mx-0">
            <SpendingChart breakdown={breakdown} />
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
                {breakdown.map(row => (
                  <tr key={row.category} className="group">
                    <td className="py-2.5 flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: row.colour }}
                      />
                      <span className="text-gray-800">{row.category}</span>
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
                ))}
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
