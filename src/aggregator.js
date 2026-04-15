/**
 * aggregator.js
 * Sums transaction amounts by category to produce the data used by charts and the summary table.
 */

/**
 * Sum debits (negative amounts) by category.
 * Returns an array sorted by total spend descending.
 *
 * @param {Array<{category: string, amount: number}>} transactions
 * @returns {Array<{category: string, total: number, percentage: number}>}
 */
export function aggregateByCategory(transactions) {
  const totals = {};
  const counts = {};

  for (const t of transactions) {
    // Only count outgoing money (negative amounts = debits)
    if (t.amount < 0) {
      const abs = Math.abs(t.amount);
      totals[t.category] = (totals[t.category] ?? 0) + abs;
      counts[t.category] = (counts[t.category] ?? 0) + 1;
    }
  }

  const grandTotal = Object.values(totals).reduce((sum, v) => sum + v, 0);

  return Object.entries(totals)
    .map(([category, total]) => ({
      category,
      count: counts[category] ?? 0,
      total: Math.round(total * 100) / 100,
      percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Total income (positive amounts) across all transactions.
 * @param {Array} transactions
 * @returns {number}
 */
export function totalIncome(transactions) {
  return transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Total spend (sum of absolute debits).
 * @param {Array} transactions
 * @returns {number}
 */
export function totalSpend(transactions) {
  return transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}
