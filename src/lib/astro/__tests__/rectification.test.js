import { describe, it, expect, vi } from 'vitest';
import { rectifyBirthTime } from '../rectification';

// Mock dependencies as they involve heavy astronomical math
vi.mock('../dasha', () => ({
  getMahaDasha: (_moon, _birth) => [
    { planet: 'Jupiter', start: new Date('2010-01-01'), end: new Date('2026-01-01') }
  ],
  getCurrentDasha: (_array, _date) => ({
    maha: { planet: 'Jupiter' },
    antar: { planet: 'Saturn' }
  })
}));

vi.mock('../ephemeris', () => ({
  getPlanetaryPositions: () => ({ Moon: { longitude: 100 } }),
  getAscendant: () => ({ sign: 4, longitude: 120 })
}));

describe('Birth Time Rectification Engine', () => {
  const mockProfile = {
    dob_date: '1990-01-01',
    dob_time: '12:00',
    iana_timezone: 'Asia/Kolkata',
    latitude: 19.0,
    longitude: 72.0
  };

  it('correctly ranks times based on life events', () => {
    const lifeEvents = [
      { type: 'marriage', year: 2015 }, // Marriage usually matches Venus/Jupiter
    ];
    
    const result = rectifyBirthTime(mockProfile, lifeEvents, 60);
    
    expect(result.topCandidates.length).toBeGreaterThan(0);
    // In our mock, Jupiter is always active, and Jupiter is a marriage indicator
    // So the score should be positive
    expect(result.topCandidates[0].score).toBeGreaterThan(0);
    expect(result.bestTime).toBeDefined();
  });

  it('handles empty life events gracefully', () => {
    const result = rectifyBirthTime(mockProfile, [], 60);
    expect(result.topCandidates[0].score).toBe(0);
  });
});
