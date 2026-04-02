import { describe, it, expect } from 'vitest';
import { calculateShadbala } from '../shadbala';
import { calculateAshtakavarga } from '../ashtakavarga';

describe('Vedic Strength Engines', () => {
  const positions = {
    Sun: { longitude: 10, sign: 0 }, // Aries (Exaltation)
    Moon: { longitude: 40, sign: 1 },
    Mars: { longitude: 280, sign: 9 }, // Capricorn (Exaltation)
    Mercury: { longitude: 160, sign: 5 }, // Virgo (Exaltation)
    Jupiter: { longitude: 100, sign: 3 }, // Cancer (Exaltation)
    Venus: { longitude: 340, sign: 11 }, // Pisces (Exaltation)
    Saturn: { longitude: 190, sign: 6 }, // Libra (Exaltation)
  };
  const ascendantSign = 0; // Aries
  const birthDate = new Date('1995-10-01T12:00:00'); // Day chart

  describe('Shadbala', () => {
    it('calculates 7 planets with Strong grades for exalted placements', () => {
      const results = calculateShadbala(positions, ascendantSign, birthDate);
      expect(results.length).toBe(7);
      
      const sun = results.find(r => r.planet === 'Sun');
      expect(sun.sthana).toBeGreaterThanOrEqual(60); // Exalted
      expect(sun.grade).toBe('Strong');
    });

    it('applies retrograde bonus in Chesta Bala', () => {
      const positionsRetro = {
        ...positions,
        Saturn: { longitude: 190, sign: 6, retrograde: true }
      };
      const results = calculateShadbala(positionsRetro, ascendantSign, birthDate);
      const saturn = results.find(r => r.planet === 'Saturn');
      expect(saturn.chesta).toBe(60);
    });
  });

  describe('Ashtakavarga', () => {
    it('calculates Saturn and Jupiter scores within 0-8 range', () => {
      const results = calculateAshtakavarga(positions, ascendantSign);
      expect(results.Saturn.scores.length).toBe(12);
      expect(results.Jupiter.scores.length).toBe(12);
      
      results.Saturn.scores.forEach(s => {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(8);
      });
    });

    it('calculates Sarvashtakavarga as sum of planets', () => {
      const results = calculateAshtakavarga(positions, ascendantSign);
      const sign0Sum = results.Saturn.scores[0] + results.Jupiter.scores[0];
      expect(results.sarvashtakavarga[0]).toBe(sign0Sum);
    });
  });
});
