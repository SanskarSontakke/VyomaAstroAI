import { describe, it, expect } from 'vitest';
import { getDailyInsights } from '../insights.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Daily Insights Engine Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VALID_PROFILE = {
  id: 'test-1',
  name: 'Test User',
  dob_date: '1990-01-01',
  dob_time: '06:00',
  latitude: 19.076,
  longitude: 72.877,
  timezone_offset: 5.5,
};

const STABLE_DATE = new Date('2026-03-20T12:00:00Z');

describe('getDailyInsights — Valid profile', () => {
  it('returns complete structure with all required keys', () => {
    const insights = getDailyInsights(VALID_PROFILE, STABLE_DATE);

    expect(insights).toBeDefined();
    expect(insights.dailyOutlook).toBeDefined();
    expect(insights.dailyOutlook.score).toBeGreaterThanOrEqual(1);
    expect(insights.dailyOutlook.score).toBeLessThanOrEqual(5);
    expect(insights.dailyOutlook.title).toBeTruthy();
    expect(insights.dailyOutlook.description).toBeTruthy();

    expect(insights.monthlyTheme).toBeDefined();
    expect(insights.monthlyTheme.title).toBeTruthy();

    expect(insights.tithi).toBeDefined();
    expect(insights.taraBala).toBeDefined();
    expect(insights.luckyColor).toBeTruthy();
    expect(insights.luckyNumber).toBeDefined();
    expect(insights.currentDasha).toBeDefined();
    expect(insights.timings).toBeDefined();
  });

  it('tithi number is between 1 and 30', () => {
    const insights = getDailyInsights(VALID_PROFILE, STABLE_DATE);
    expect(insights.tithi.number).toBeGreaterThanOrEqual(1);
    expect(insights.tithi.number).toBeLessThanOrEqual(30);
  });

  it('tithi has a valid name string', () => {
    const insights = getDailyInsights(VALID_PROFILE, STABLE_DATE);
    expect(typeof insights.tithi.name).toBe('string');
    expect(insights.tithi.name.length).toBeGreaterThan(0);
  });

  it('tara bala returns a valid name (not "Unknown")', () => {
    const insights = getDailyInsights(VALID_PROFILE, STABLE_DATE);
    expect(insights.taraBala.name).not.toBe('Unknown');
    expect(typeof insights.taraBala.favorable).toBe('boolean');
  });

  it('lucky color is a known color string', () => {
    const knownColors = ['Orange', 'White', 'Red', 'Green', 'Yellow', 'Pink', 'Blue', 'Smoky Gray', 'Brown'];
    const insights = getDailyInsights(VALID_PROFILE, STABLE_DATE);
    expect(knownColors).toContain(insights.luckyColor);
  });

  it('dasha returns maha and antar planet strings', () => {
    const insights = getDailyInsights(VALID_PROFILE, STABLE_DATE);
    expect(typeof insights.currentDasha.maha).toBe('string');
    expect(typeof insights.currentDasha.antar).toBe('string');
    expect(insights.currentDasha.maha).not.toBe('Unknown');
  });

  it('all timing windows have formattedStart and formattedEnd', () => {
    const insights = getDailyInsights(VALID_PROFILE, STABLE_DATE);
    const timingKeys = ['rahuKaal', 'yamaghanda', 'guliKaal', 'abhijitMuhurta'];
    timingKeys.forEach(key => {
      expect(insights.timings[key]).toBeDefined();
      expect(typeof insights.timings[key].formattedStart).toBe('string');
      expect(typeof insights.timings[key].formattedEnd).toBe('string');
    });
  });
});

describe('getDailyInsights — Error handling', () => {
  it('throws "Profile is required" for null profile', () => {
    expect(() => getDailyInsights(null, STABLE_DATE)).toThrow('Profile is required');
  });

  it('throws for missing dob_date', () => {
    const bad = { ...VALID_PROFILE, dob_date: null };
    expect(() => getDailyInsights(bad, STABLE_DATE)).toThrow('Missing birth data');
  });

  it('throws for missing dob_time', () => {
    const bad = { ...VALID_PROFILE, dob_time: null };
    expect(() => getDailyInsights(bad, STABLE_DATE)).toThrow('Missing birth data');
  });

  it('throws for invalid date format', () => {
    const bad = { ...VALID_PROFILE, dob_date: 'not-a-date' };
    expect(() => getDailyInsights(bad, STABLE_DATE)).toThrow('Invalid birth date');
  });
});

describe('getDailyInsights — Edge cases', () => {
  it('handles midnight birth (00:00) without crash', () => {
    const midnight = { ...VALID_PROFILE, dob_time: '00:00' };
    const insights = getDailyInsights(midnight, STABLE_DATE);
    expect(insights).toBeDefined();
    expect(insights.dailyOutlook).toBeDefined();
  });

  it('handles UTC timezone offset (0) correctly', () => {
    const utcProfile = { ...VALID_PROFILE, timezone_offset: 0 };
    const insights = getDailyInsights(utcProfile, STABLE_DATE);
    expect(insights).toBeDefined();
    expect(insights.dailyOutlook.score).toBeGreaterThanOrEqual(1);
  });

  it('handles negative timezone offset (US West -8) correctly', () => {
    const usWest = { ...VALID_PROFILE, timezone_offset: -8, latitude: 37.77, longitude: -122.43 };
    const insights = getDailyInsights(usWest, STABLE_DATE);
    expect(insights).toBeDefined();
    expect(insights.dailyOutlook.score).toBeGreaterThanOrEqual(1);
  });

  it('handles time with seconds (HH:MM:SS format)', () => {
    const withSeconds = { ...VALID_PROFILE, dob_time: '14:30:45' };
    const insights = getDailyInsights(withSeconds, STABLE_DATE);
    expect(insights).toBeDefined();
  });
});
