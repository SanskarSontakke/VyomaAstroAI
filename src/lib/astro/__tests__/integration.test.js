import { describe, it, expect } from 'vitest';
import { getDailyInsights } from '../insights';

// Generate a massive testing matrix (1500+ cases)
const testCases = [];
const years = [1920, 1970, 2000, 2025, 2050];
const months = [1, 4, 7, 10];
const days = [1, 15, 28];
const lats = [-60, -30, 0, 30, 60];
const lons = [-120, -60, 0, 60, 120];

for (const y of years) {
  for (const m of months) {
    for (const d of days) {
      for (const lat of lats) {
        for (const lon of lons) {
          testCases.push({
            description: `Y:${y} M:${m} D:${d} | Lat:${lat} Lon:${lon}`,
            profile: {
              name: 'Matrix User',
              dob_date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
              dob_time: '12:00',
              latitude: lat,
              longitude: lon,
              timezone_offset: 0,
              iana_timezone: 'UTC',
            },
            targetDate: new Date('2025-06-15T12:00:00Z')
          });
        }
      }
    }
  }
}

describe('Integration: getDailyInsights Matrix (1500 Cases)', () => {
  it.each(testCases)('handles profile: $description', ({ profile, targetDate }) => {
    const insights = getDailyInsights(profile, targetDate);
    
    expect(insights).toHaveProperty('dailyOutlook');
    expect(insights).toHaveProperty('monthlyTheme');
    expect(insights).toHaveProperty('tithi');
    expect(insights).toHaveProperty('currentDasha');
    expect(insights).toHaveProperty('timings');
    
    expect(insights.dailyOutlook.score).toBeGreaterThanOrEqual(1);
    expect(insights.dailyOutlook.score).toBeLessThanOrEqual(5);
    
    expect(insights.currentDasha).toHaveProperty('maha');
    expect(insights.currentDasha).toHaveProperty('antar');
  });

  it('throws cleanly with invalid profile', () => {
    expect(() => getDailyInsights(null, new Date())).toThrow();
  });

  it('timings have formatted strings', () => {
    const insights = getDailyInsights(testCases[0].profile, new Date('2025-06-15'));
    expect(typeof insights.timings.rahuKaal.formattedStart).toBe('string');
    expect(insights.timings.rahuKaal.formattedStart).toMatch(/\d{1,2}:\d{2}/);
  });

  it('Rahu Kaal start is before end', () => {
    const insights = getDailyInsights(testCases[0].profile, new Date('2025-06-15'));
    expect(insights.timings.rahuKaal.start.getTime())
      .toBeLessThan(insights.timings.rahuKaal.end.getTime());
  });

  it('performance benchmark completes within 30s for 1500 runs', () => {
    const start = performance.now();
    // Run 1500 fast executions
    for (const { profile, targetDate } of testCases) {
      getDailyInsights(profile, targetDate);
    }
    const end = performance.now();
    expect(end - start).toBeLessThan(30000);
  }, 35000);
});


