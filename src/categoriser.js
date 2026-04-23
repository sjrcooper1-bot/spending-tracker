/**
 * categoriser.js
 * Assigns a category to each transaction based on keyword rules.
 * Rules are checked in order — first match wins.
 */

export const DEFAULT_RULES = [
  { category: 'Groceries',       keywords: ['tesco', 'sainsbury', 'asda', 'morrisons', 'waitrose', 'aldi', 'lidl', 'co-op', 'marks & spencer food', 'm&s food', 'ocado', 'iceland'] },
  { category: 'Eating Out',      keywords: ['mcdonald', 'kfc', 'burger king', 'subway', 'greggs', 'nando', 'pizza', 'deliveroo', 'uber eats', 'just eat', 'restaurant', 'cafe', 'coffee', 'starbucks', 'costa', 'pret'] },
  { category: 'Transport',       keywords: ['tfl travel', 'tfl charge', 'trainline', 'national rail', 'avanti', 'gwr', 'crosscountry', ' bus ', 'uber', 'bolt', 'parking', 'petrol', 'fuel', 'shell petrol', 'bp petrol', 'esso', 'motoring'] },
  { category: 'Housing',         keywords: ['rent', 'mortgage', 'council tax', 'estate agent', 'letting'] },
  { category: 'Utilities',       keywords: ['british gas', 'eon', 'octopus', 'bulb', 'thames water', 'anglian water', 'severn trent', 'electricity', 'gas', 'water bill', 'bt group', 'virgin media', 'sky broadband', 'broadband', 'internet'] },
  { category: 'Subscriptions',   keywords: ['netflix', 'spotify', 'apple', 'amazon prime', 'disney', 'youtube premium', 'adobe', 'microsoft 365', 'office 365', 'google one', 'dropbox', 'gym', 'membership'] },
  { category: 'Shopping',        keywords: ['amazon', 'ebay', 'asos', 'next', 'primark', 'h&m', 'zara', 'argos', 'currys', 'john lewis', 'ikea', 'b&q', 'homebase'] },
  { category: 'Healthcare',      keywords: ['pharmacy', 'boots', 'lloyds pharmacy', 'superdrug', 'dentist', 'doctor', 'nhs', 'optician', 'specsavers'] },
  { category: 'Entertainment',   keywords: ['cinema', 'vue', 'odeon', 'cineworld', 'theatre', 'ticketmaster', 'eventbrite', 'steam', 'playstation', 'xbox', 'nintendo'] },
  { category: 'Finance',             keywords: ['bank charge', 'interest', 'overdraft', 'transfer', 'standing order', 'direct debit', 'pension'] },
  { category: 'Savings & Investments', keywords: ['savings', 'investment', 'vanguard', 'hargreaves lansdown', 'hl direct', 'trading 212', 'nutmeg', 'moneybox', 'stocks', 'shares isa', 'lifetime isa'] },
  { category: 'Vacation & Travel',  keywords: ['airbnb', 'booking.com', 'hotels.com', 'expedia', 'holiday inn', 'marriott', 'travelodge', 'premier inn', 'ryanair', 'easyjet', 'british airways', 'jet2', 'tui', 'airport', 'heathrow', 'gatwick', 'stansted', 'passport', 'travel insurance', 'foreign currency'] },
  { category: 'Pets',               keywords: ['pet', 'vets', 'veterinary', 'vets4pets', 'pdsa', 'rspca', 'pets at home', 'petsmart', 'dog food', 'cat food', 'kennel', 'grooming'] },
  { category: 'Kids',               keywords: ['toys r us', 'smyths', 'early learning', 'school', 'nursery', 'childcare', 'baby', 'mothercare', 'jojo maman', 'children', 'kids club', 'swimming lesson', 'tutoring'] },
  { category: 'Income',             keywords: ['salary', 'wages', 'payroll', 'bacs credit', 'faster payment received', 'interest credit'] },
];

/**
 * Assign a category to a single transaction description.
 * @param {string} description
 * @param {Array} rules — defaults to DEFAULT_RULES
 * @returns {string} category label
 */
export function categorise(description, rules = DEFAULT_RULES) {
  const lower = description.toLowerCase();
  for (const rule of rules) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.category;
    }
  }
  return 'Uncategorised';
}

/**
 * Apply categorisation to every transaction in the array (mutates in place).
 * @param {Array} transactions
 * @param {Array} rules
 * @returns {Array} same array with category fields populated
 */
export function categoriseAll(transactions, rules = DEFAULT_RULES) {
  for (const t of transactions) {
    t.category = categorise(t.description, rules);
  }
  return transactions;
}
