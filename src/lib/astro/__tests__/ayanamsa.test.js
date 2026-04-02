import { describe, it, expect } from 'vitest';
import { getAyanamsa, AYANAMSA_SYSTEMS } from '../ephemeris';
import { calculateHouses, getPlanetHouse,
         HOUSE_SYSTEMS } from '../houseSystems';

describe('Ayanamsa systems', () => {
  const testJD = 2451545.0; // J2000.0

  it('Lahiri ayanamsa at J2000 is approximately 23.85°', () => {
    const a = getAyanamsa(testJD, AYANAMSA_SYSTEMS.LAHIRI);
    expect(a).toBeGreaterThan(23.5);
    expect(a).toBeLessThan(24.5);
  });

  it('KP ayanamsa is close to but different from Lahiri', () => {
    const lahiri = getAyanamsa(testJD, AYANAMSA_SYSTEMS.LAHIRI);
    const kp     = getAyanamsa(testJD, AYANAMSA_SYSTEMS.KRISHNAMURTI);
    const diff   = Math.abs(lahiri - kp);
    expect(diff).toBeGreaterThan(0);
    expect(diff).toBeLessThan(1); // within 1°
  });

  it('all systems return values in range 20-28°', () => {
    Object.values(AYANAMSA_SYSTEMS).forEach(sys => {
      const a = getAyanamsa(testJD, sys);
      expect(a).toBeGreaterThan(20);
      expect(a).toBeLessThan(28);
    });
  });

  it('defaults to Lahiri when no system specified', () => {
    const withDefault = getAyanamsa(testJD);
    const withLahiri  = getAyanamsa(testJD, AYANAMSA_SYSTEMS.LAHIRI);
    expect(withDefault).toBe(withLahiri);
  });
});

describe('House systems', () => {
  it('Whole Sign: first house = start of ascendant sign', () => {
    const cusps = calculateHouses(46.5, HOUSE_SYSTEMS.WHOLE_SIGN);
    // Ascendant at 46.5° = Taurus (sign 1), so 1st house starts at 30°
    expect(cusps[0]).toBe(30);
    expect(cusps[1]).toBe(60);  // 2nd house = Gemini start
  });

  it('Equal: first house cusp = exact ascendant degree', () => {
    const cusps = calculateHouses(46.5, HOUSE_SYSTEMS.EQUAL);
    expect(cusps[0]).toBeCloseTo(46.5);
    expect(cusps[1]).toBeCloseTo(76.5);
  });

  it('getPlanetHouse finds correct house in whole sign', () => {
    const cusps = calculateHouses(0, HOUSE_SYSTEMS.WHOLE_SIGN);
    // Ascendant at 0° (Aries), planet at 45° (Taurus) = 2nd house
    expect(getPlanetHouse(45, cusps)).toBe(2);
    // Planet at 270° (Capricorn) = 10th house from Aries
    expect(getPlanetHouse(270, cusps)).toBe(10);
  });

  it('getPlanetHouse handles wrap-around', () => {
    const cusps = calculateHouses(350, HOUSE_SYSTEMS.WHOLE_SIGN);
    // Ascendant near end of Pisces, planet at 5° (Aries) = 2nd house
    expect(getPlanetHouse(5, cusps)).toBe(2);
  });
});
