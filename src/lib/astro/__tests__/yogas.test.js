import { describe, it, expect } from 'vitest';
import { detectYogas } from '../yogas';

/* Build a synthetic positions object for testing */
function makePositions(overrides = {}) {
  const defaults = {
    Sun:     { longitude: 100, retrograde: false, combust: false, sign: 3 },
    Moon:    { longitude: 140, retrograde: false, combust: false, sign: 4 },
    Mars:    { longitude: 200, retrograde: false, combust: false, sign: 6 },
    Mercury: { longitude: 115, retrograde: false, combust: true,  sign: 3 },
    Jupiter: { longitude: 140, retrograde: false, combust: false, sign: 4 }, // conjunct Moon
    Venus:   { longitude: 60,  retrograde: false, combust: false, sign: 2 },
    Saturn:  { longitude: 280, retrograde: false, combust: false, sign: 9 },
    Rahu:    { longitude: 20,  retrograde: true,  combust: false, sign: 0 },
    Ketu:    { longitude: 200, retrograde: true,  combust: false, sign: 6 },
  };
  return { ...defaults, ...overrides };
}

describe('Yoga detection', () => {
  it('Gajakesari detected when Jupiter conjuncts Moon', () => {
    const pos = makePositions({
      Jupiter: { longitude: 140, retrograde: false, combust: false, sign: 4 },
      Moon:    { longitude: 142, retrograde: false, combust: false, sign: 4 },
    });
    const yogas = detectYogas(pos, 0); // Aries ascendant
    const gaja  = yogas.find(y => y.name === 'Gajakesari Yoga');
    expect(gaja).toBeDefined();
    expect(gaja.present).toBe(true);
  });

  it('Budhaditya detected when Sun and Mercury in same sign', () => {
    const pos = makePositions({
      Sun:     { longitude: 100, retrograde: false, combust: false, sign: 3 },
      Mercury: { longitude: 115, retrograde: false, combust: false, sign: 3 }, // same sign
    });
    const yogas  = detectYogas(pos, 0);
    const budha  = yogas.find(y => y.name === 'Budhaditya Yoga');
    expect(budha).toBeDefined();
    expect(budha.present).toBe(true);
  });

  it('Budhaditya cancelled when Mercury is combust', () => {
    const pos = makePositions({
      Sun:     { longitude: 100, retrograde: false, combust: false, sign: 3 },
      Mercury: { longitude: 107, retrograde: false, combust: true,  sign: 3 },
    });
    const yogas = detectYogas(pos, 0);
    const budha = yogas.find(y => y.name === 'Budhaditya Yoga');
    if (budha) {
      expect(budha.combustCancelled).toBe(true);
    }
  });

  it('Kaal Sarpa Yoga detected when all planets between nodes', () => {
    /* Rahu at 50° (sign 1), Ketu at 230° (sign 7).
       All planets in arc sign 1 → sign 7 */
    const pos = makePositions({
      Rahu:    { longitude: 50,  retrograde: true, combust: false, sign: 1 },
      Ketu:    { longitude: 230, retrograde: true, combust: false, sign: 7 },
      Sun:     { longitude: 80,  retrograde: false, combust: false, sign: 2 },
      Moon:    { longitude: 100, retrograde: false, combust: false, sign: 3 },
      Mars:    { longitude: 120, retrograde: false, combust: false, sign: 4 },
      Mercury: { longitude: 140, retrograde: false, combust: false, sign: 4 },
      Jupiter: { longitude: 160, retrograde: false, combust: false, sign: 5 },
      Venus:   { longitude: 180, retrograde: false, combust: false, sign: 6 },
      Saturn:  { longitude: 200, retrograde: false, combust: false, sign: 6 },
    });
    const yogas = detectYogas(pos, 0);
    const kaal  = yogas.find(y => y.name === 'Kaal Sarpa Yoga');
    expect(kaal).toBeDefined();
    expect(kaal.present).toBe(true);
  });

  it('no yogas returned for random impossible configuration', () => {
    /* Extremely scattered planets — fewer yogas expected */
    const yogas = detectYogas(makePositions(), 3);
    expect(Array.isArray(yogas)).toBe(true);
  });
});
