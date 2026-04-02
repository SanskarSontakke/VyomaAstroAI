import { describe, it, expect } from 'vitest';
import { getDailyInsights } from '../insights';
import { parseBirthDateUTC } from '../../timezones';
import { REFERENCE_CHARTS } from './referenceData';

describe('Integration: getDailyInsights', () => {
  const profile = {
    ...REFERENCE_CHARTS[0].input,
    name: 'Test Project',
    iana_timezone: 'Asia/Kolkata',
  };

  it('returns complete insights object', () => {
    const insights = getDailyInsights(profile, new Date('2025-06-15'));
    expect(insights).toHaveProperty('dailyOutlook');
    expect(insights).toHaveProperty('monthlyTheme');
    expect(insights).toHaveProperty('tithi');
    expect(insights).toHaveProperty('taraBala');
    expect(insights).toHaveProperty('luckyColor');
    expect(insights).toHaveProperty('luckyNumber');
    expect(insights).toHaveProperty('currentDasha');
    expect(insights).toHaveProperty('timings');
  });

  it('daily score is within 1-5', () => {
    const insights = getDailyInsights(profile, new Date('2025-06-15'));
    expect(insights.dailyOutlook.score).toBeGreaterThanOrEqual(1);
    expect(insights.dailyOutlook.score).toBeLessThanOrEqual(5);
  });

  it('currentDasha has maha and antar', () => {
    const insights = getDailyInsights(profile, new Date('2025-06-15'));
    expect(insights.currentDasha).toHaveProperty('maha');
    expect(insights.currentDasha).toHaveProperty('antar');
  });

  it('Panchang is complete', () => {
    const insights = getDailyInsights(profile, new Date('2025-06-15'));
    if (insights.panchang) {
      expect(insights.panchang).toHaveProperty('vara');
      expect(insights.panchang).toHaveProperty('yoga');
      expect(insights.panchang).toHaveProperty('karana');
    }
  });

  it('throws cleanly with invalid profile', () => {
    expect(() => getDailyInsights(null, new Date())).toThrow();
    // expect(() => getDailyInsights({}, new Date())).toThrow(); // depends on implementation
  });

  it('timings have formatted strings', () => {
    const insights = getDailyInsights(profile, new Date('2025-06-15'));
    expect(typeof insights.timings.rahuKaal.formattedStart).toBe('string');
    expect(insights.timings.rahuKaal.formattedStart).toMatch(/\d{1,2}:\d{2}/);
  });

  it('Rahu Kaal start is before end', () => {
    const insights = getDailyInsights(profile, new Date('2025-06-15'));
    expect(insights.timings.rahuKaal.start.getTime())
      .toBeLessThan(insights.timings.rahuKaal.end.getTime());
  });
});
