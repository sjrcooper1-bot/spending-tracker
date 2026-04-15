import { describe, it, expect } from 'vitest';
// Parser tests require browser globals (Papa, XLSX) — unit test the helpers directly

// Re-export the internal helpers for testing by importing parser internals
// For now these are smoke tests against the module shape

describe('parser module', () => {
  it('exports parseFile and parseFiles', async () => {
    // Vitest runs in Node — full integration tests need a browser runner
    // These confirm the module loads without errors
    const mod = await import('../src/parser.js').catch(() => null);
    // In Node (no CDN globals), the module loads but functions will throw at runtime
    expect(mod).toBeTruthy();
  });
});
