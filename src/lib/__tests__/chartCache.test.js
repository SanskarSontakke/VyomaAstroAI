import { describe, it, expect, beforeEach } from 'vitest';
import { getCachedChart, setCachedChart,
         invalidateCachedChart } from '../chartCache';

/* Mock IndexedDB for Vitest (jsdom environment) */
import 'fake-indexeddb/auto';

describe('Chart cache', () => {
  beforeEach(async () => {
    /* Profiles may have different IDs in tests */
    await invalidateCachedChart('test_profile_1');
  });

  it('returns null for uncached profile', async () => {
    const result = await getCachedChart('test_profile_1');
    expect(result).toBeNull();
  });

  it('returns cached data after setting', async () => {
    const data = { positions: { Sun: { longitude: 100 } }, test: true };
    await setCachedChart('test_profile_1', data);
    const cached = await getCachedChart('test_profile_1');
    expect(cached).not.toBeNull();
    expect(cached.test).toBe(true);
  });

  it('invalidation removes cached data', async () => {
    await setCachedChart('test_profile_1', { x: 1 });
    await invalidateCachedChart('test_profile_1');
    const cached = await getCachedChart('test_profile_1');
    expect(cached).toBeNull();
  });

  it('serializes and deserializes Date objects', async () => {
    const d = new Date('2025-01-15T00:00:00Z');
    await setCachedChart('test_profile_1', { someDate: d });
    const cached = await getCachedChart('test_profile_1');
    expect(cached.someDate instanceof Date).toBe(true);
    expect(cached.someDate.getFullYear()).toBe(2025);
  });
});
