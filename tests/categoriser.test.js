import { describe, it, expect } from 'vitest';
import { categorise, categoriseAll, DEFAULT_RULES } from '../src/categoriser.js';

describe('categorise()', () => {
  it('matches groceries by keyword', () => {
    expect(categorise('TESCO STORES 1234')).toBe('Groceries');
    expect(categorise('SAINSBURYS ONLINE')).toBe('Groceries');
  });

  it('matches eating out', () => {
    expect(categorise('DELIVEROO ORDER #123')).toBe('Eating Out');
    expect(categorise('COSTA COFFEE KINGS CROSS')).toBe('Eating Out');
  });

  it('matches transport', () => {
    expect(categorise('TFL TRAVEL CHARGE')).toBe('Transport');
    expect(categorise('TRAINLINE BOOKING')).toBe('Transport');
  });

  it('matches subscriptions', () => {
    expect(categorise('NETFLIX.COM')).toBe('Subscriptions');
  });

  it('returns Uncategorised for unknown merchants', () => {
    expect(categorise('XYZ UNKNOWN MERCHANT 9999')).toBe('Uncategorised');
  });

  it('is case-insensitive', () => {
    expect(categorise('amazon prime')).toBe('Subscriptions');
    expect(categorise('AMAZON PRIME')).toBe('Subscriptions');
  });
});

describe('categoriseAll()', () => {
  it('assigns categories to every transaction', () => {
    const transactions = [
      { description: 'TESCO STORE', amount: -25 },
      { description: 'SALARY PAYMENT', amount: 2000 },
    ];
    categoriseAll(transactions);
    expect(transactions[0].category).toBe('Groceries');
    expect(transactions[1].category).toBe('Income');
  });
});
