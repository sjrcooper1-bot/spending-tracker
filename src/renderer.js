/**
 * renderer.js
 * Builds DOM output: summary cards, category table, transaction table.
 */

import { aggregateByCategory, totalIncome, totalSpend } from './aggregator.js';
import { renderCharts } from './charts.js';

/**
 * Main render entry point. Call this after transactions are parsed + categorised.
 * @param {Array} transactions
 */
export function render(transactions) {
  if (!transactions.length) return;

  const aggregated = aggregateByCategory(transactions);

  renderSummaryCards(transactions);
  renderCategoryTable(aggregated);
  renderTransactionTable(transactions);
  renderCharts(aggregated);

  document.getElementById('results').classList.remove('hidden');
}

function renderSummaryCards(transactions) {
  const income = totalIncome(transactions);
  const spend = totalSpend(transactions);
  const net = income - spend;

  document.getElementById('stat-income').textContent = `£${income.toFixed(2)}`;
  document.getElementById('stat-spend').textContent = `£${spend.toFixed(2)}`;
  document.getElementById('stat-net').textContent = `£${net.toFixed(2)}`;
  document.getElementById('stat-net').style.color = net >= 0 ? '#16a34a' : '#dc2626';
  document.getElementById('stat-transactions').textContent = transactions.length;
}

function renderCategoryTable(aggregated) {
  const tbody = document.getElementById('category-tbody');
  tbody.innerHTML = '';

  for (const row of aggregated) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escHtml(row.category)}</td>
      <td class="num">£${row.total.toFixed(2)}</td>
      <td class="num">${row.percentage}%</td>
      <td class="bar-cell"><div class="inline-bar" style="width:${row.percentage}%"></div></td>
    `;
    tbody.appendChild(tr);
  }
}

function renderTransactionTable(transactions) {
  const tbody = document.getElementById('transaction-tbody');
  tbody.innerHTML = '';

  for (const t of transactions) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escHtml(t.date)}</td>
      <td>${escHtml(t.description)}</td>
      <td class="num ${t.amount < 0 ? 'debit' : 'credit'}">${t.amount < 0 ? '-' : '+'}£${Math.abs(t.amount).toFixed(2)}</td>
      <td><span class="badge">${escHtml(t.category)}</span></td>
      <td class="source">${escHtml(t.source)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
