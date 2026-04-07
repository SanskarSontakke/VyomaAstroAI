import { describe, it, expect, beforeEach } from 'vitest';
import { getCachedChart, setCachedChart,
         invalidateCachedChart } from '../chartCache';

/* Mock IndexedDB for Vitest (jsdom environment) */
import 'fake-indexeddb/auto';

const dummyProfile = {
  id: 'test_profile_1',
  dob_date: '1990-01-01',
  dob_time: '12:00',
  latitude: 19.076,
  longitude: 72.877
};
const dummyAyanamsa = 'lahiri';

describe('Chart cache', () => {
  beforeEach(async () => {
    /* Profiles may have different IDs in tests */
    await invalidateCachedChart(dummyProfile.id);
  });

  it('returns null for uncached profile', async () => {
    const result = await getCachedChart(dummyProfile, dummyAyanamsa);
    expect(result).toBeNull();
  });

  it('returns cached data after setting', async () => {
    const data = { positions: { Sun: { longitude: 100 } }, test: true };
    await setCachedChart(dummyProfile, dummyAyanamsa, 'whole_sign', data);
    const cached = await getCachedChart(dummyProfile, dummyAyanamsa, 'whole_sign');
    expect(cached).not.toBeNull();
    expect(cached.test).toBe(true);
  });

  it('invalidation removes cached data', async () => {
    await setCachedChart(dummyProfile, dummyAyanamsa, 'whole_sign', { x: 1 });
    await invalidateCachedChart(dummyProfile.id);
    const cached = await getCachedChart(dummyProfile, dummyAyanamsa, 'whole_sign');
    expect(cached).toBeNull();
  });

  it('serializes and deserializes Date objects', async () => {
    const d = new Date('2025-01-15T00:00:00Z');
    await setCachedChart(dummyProfile, dummyAyanamsa, 'whole_sign', { someDate: d });
    const cached = await getCachedChart(dummyProfile, dummyAyanamsa, 'whole_sign');
    expect(cached.someDate instanceof Date).toBe(true);
    expect(cached.someDate.getFullYear()).toBe(2025);
  });
});
