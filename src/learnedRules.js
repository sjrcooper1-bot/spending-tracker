/**
 * learnedRules.js
 * Persists user-assigned category overrides in localStorage so future uploads
 * auto-categorise matching descriptions without manual intervention.
 *
 * Keys are normalised descriptions (lowercase, trimmed) for fuzzy-tolerant matching.
 */

const STORAGE_KEY = 'spending_tracker_learned_rules';

/** Load the full map from localStorage. Returns {} if nothing saved yet. */
export function loadLearnedRules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Save a single description → category mapping. */
export function saveLearnedRule(description, category) {
  // Don't save "Uncategorised" — that's the fallback, not a real assignment
  if (category === 'Uncategorised') return;
  const rules = loadLearnedRules();
  rules[normalise(description)] = category;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

/**
 * Apply learned rules to a transaction array (mutates in place).
 * Only overrides transactions still marked Uncategorised, so keyword rules take priority
 * and users can always correct with a fresh override.
 */
export function applyLearnedRules(transactions, learnedRules) {
  for (const t of transactions) {
    if (t.category === 'Uncategorised') {
      const learned = learnedRules[normalise(t.description)];
      if (learned) t.category = learned;
    }
  }
}

function normalise(str) {
  return str.toLowerCase().trim();
}
