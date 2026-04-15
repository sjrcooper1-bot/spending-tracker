import { describe, it, expect } from 'vitest';
import { aggregateByCategory, totalIncome, totalSpend } from '../src/aggregator.js';

const transactions = [
  { category: 'Groceries',   amount: -50.00 },
  { category: 'Groceries',   amount: -30.00 },
  { category: 'Transport',   amount: -20.00 },
  { category: 'Income',      amount: 1500.00 },
  { category: 'Uncategorised', amount: -10.00 },
];

describe('aggregateByCategory()', () => {
  it('sums debits by category', () => {
    const result = aggregateByCategory(transactions);
    const groceries = result.find(r => r.category === 'Groceries');
    expect(groceries.total).toBe(80);
  });

  it('sorts by total descending', () => {
    const result = aggregateByCategory(transactions);
    expect(result[0].total).toBeGreaterThanOrEqual(result[1].total);
  });

  it('excludes credits (income) from spend totals', () => {
    const result = aggregateByCategory(transactions);
    const income = result.find(r => r.category === 'Income');
    expect(income).toBeUndefined();
  });

  it('calculates percentage correctly', () => {
    const result = aggregateByCategory(transactions);
    const totalPct = result.reduce((sum, r) => sum + r.percentage, 0);
    expect(totalPct).toBeCloseTo(100, 0);
  });
});

describe('totalIncome()', () => {
  it('sums positive amounts', () => {
    expect(totalIncome(transactions)).toBe(1500);
  });
});

describe('totalSpend()', () => {
  it('sums absolute debits', () => {
    expect(totalSpend(transactions)).toBe(110);
  });
});
