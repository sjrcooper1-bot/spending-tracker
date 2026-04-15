/**
 * TransactionTable
 * Preview table of all parsed transactions before analysis.
 * Each row has a category dropdown so the user can override the auto-assigned category.
 */

const CATEGORY_COLOURS = {
  'Groceries':              'bg-green-100 text-green-700',
  'Restaurants & Takeaways':'bg-orange-100 text-orange-700',
  'Transport':              'bg-blue-100 text-blue-700',
  'Housing':                'bg-violet-100 text-violet-700',
  'Utilities':              'bg-sky-100 text-sky-700',
  'Subscriptions':          'bg-fuchsia-100 text-fuchsia-700',
  'Shopping':               'bg-yellow-100 text-yellow-700',
  'Health & Wellbeing':     'bg-emerald-100 text-emerald-700',
  'Entertainment':          'bg-pink-100 text-pink-700',
  'Debt & Repayments':      'bg-slate-100 text-slate-600',
  'Bank Charges':           'bg-red-100 text-red-600',
  'Insurance':              'bg-indigo-100 text-indigo-700',
  'Uncategorised':          'bg-amber-100 text-amber-700',
};

function formatAmount(amount) {
  const abs = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-£${abs}` : `+£${abs}`;
}

export default function TransactionTable({ transactions, categoryRules, categoryOverrides, onOverride }) {
  if (!transactions.length) return null;

  const categoryNames = categoryRules.map(r => r.category);
  const uncategorisedCount = transactions.filter((t, i) =>
    (categoryOverrides[i] ?? t.category) === 'Uncategorised'
  ).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          Transaction Preview
          <span className="ml-2 text-sm font-normal text-gray-400">
            {transactions.length.toLocaleString()} rows
          </span>
        </h2>
        {uncategorisedCount > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2.5 py-1 rounded-full">
            {uncategorisedCount} uncategorised
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {transactions.map((t, i) => {
              const effectiveCategory = categoryOverrides[i] ?? t.category;
              const isOverridden = categoryOverrides[i] !== undefined && categoryOverrides[i] !== t.category;
              const colourClass = CATEGORY_COLOURS[effectiveCategory] ?? 'bg-gray-100 text-gray-600';

              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{t.date}</td>
                  <td className="px-4 py-2.5 text-gray-800 max-w-xs truncate">{t.description}</td>
                  <td className={`px-4 py-2.5 text-right font-mono whitespace-nowrap ${t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatAmount(t.amount)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="relative inline-block">
                      <select
                        value={effectiveCategory}
                        onChange={e => onOverride(i, e.target.value)}
                        className={`text-xs font-medium pl-2 pr-6 py-0.5 rounded-full appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${colourClass} ${isOverridden ? 'ring-1 ring-blue-300' : ''}`}
                        aria-label={`Category for ${t.description}`}
                      >
                        {categoryNames.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                      {/* Chevron icon */}
                      <svg
                        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-50"
                        width="10" height="10" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs truncate max-w-[140px]">{t.source}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
