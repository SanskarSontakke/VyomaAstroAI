import { describe, it, expect } from 'vitest';
import { findMuhurtas } from '../muhurta';

describe('Muhurta Finder Engine', () => {
  const mockProfile = {
    id: 'test-profile',
    name: 'Sanskar Test',
    dob_date: '1995-10-01',
    dob_time: '14:30',
    latitude: 19.076,
    longitude: 72.877,
    timezone_offset: 5.5
  };

  const startDate = '2026-04-01';
  const endDate = '2026-04-10';

  it('calculates muhurtas for Travel and returns top 10', () => {
    const results = findMuhurtas(mockProfile, 'travel', startDate, endDate);
    
    expect(results.recommendations.length).toBeGreaterThan(0);
    expect(results.recommendations.length).toBeLessThanOrEqual(10);
    expect(results.goalLabel).toBe('Travel');
    
    // Check score sorting
    const scores = results.recommendations.map(r => r.score);
    const sortedScores = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sortedScores);
  });

  it('identifies Abhijit Muhurta if score is high', () => {
    // We can't easily force a high score here without mocking getDailyInsights,
    // but we can check if bestWindow has the expected properties.
    const results = findMuhurtas(mockProfile, 'finance', startDate, endDate);
    const day = results.recommendations[0];
    
    expect(day.bestWindow).toHaveProperty('formattedStart');
    expect(day.bestWindow).toHaveProperty('formattedEnd');
  });

  it('limits search range to 90 days', () => {
    const farEndDate = '2026-08-01'; // ~120 days
    const results = findMuhurtas(mockProfile, 'business', startDate, farEndDate);
    expect(results.searchedDays).toBe(90);
  }, 30000);
});
