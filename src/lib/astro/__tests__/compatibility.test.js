import { describe, it, expect } from 'vitest';
import { calculateCompatibility } from '../compatibility';

describe('Ashtakoot Milan Calculation', () => {
  const profileA = {
    name: 'Groom',
    dob_date: '1990-01-01',
    dob_time: '12:00',
    latitude: 19.076,
    longitude: 72.877,
    timezone_offset: 5.5
  };

  const profileB = {
    name: 'Bride',
    dob_date: '1992-05-15',
    dob_time: '10:30',
    latitude: 28.6139,
    longitude: 77.209,
    timezone_offset: 5.5
  };

  it('calculates compatibility for two sample profiles', () => {
    const result = calculateCompatibility(profileA, profileB);
    expect(result).not.toBeNull();
    expect(result.totalScore).toBeLessThanOrEqual(36);
    expect(Object.keys(result.kutas)).toHaveLength(8);
  });

  it('correctly identifies Nadi Dosha when same Nakshatra', () => {
    // Both profiles same birth data = same Nakshatra
    const result = calculateCompatibility(profileA, profileA);
    expect(result.kutas.nadi.score).toBe(0);
    expect(result.nadiDosha).toBe(true);
  });
});
