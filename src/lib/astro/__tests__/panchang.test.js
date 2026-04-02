import { describe, it, expect } from 'vitest';
import { getNityaYoga, getKarana, getFullPanchang } from '../panchang';

describe('Nitya Yoga', () => {
  it('combined longitude 0° = Vishkambha (index 0)', () => {
    const y = getNityaYoga(0, 0);
    expect(y.index).toBe(0);
    expect(y.name).toBe('Vishkambha');
    expect(y.inauspicious).toBe(true);
  });

  it('combined longitude 360/27 = Priti (index 1)', () => {
    const span = 360 / 27;
    const y = getNityaYoga(span / 2, span / 2); // sum = span
    expect(y.index).toBe(1);
    expect(y.name).toBe('Priti');
    expect(y.inauspicious).toBe(false);
  });

  it('Vyatipata is inauspicious', () => {
    const y = getNityaYoga(0, (360 / 27) * 16.5); // Between 16 and 17 index
    expect(y.name).toBe('Vyatipata');
    expect(y.inauspicious).toBe(true);
  });

  it('returns 27 distinct Yogas across full cycle', () => {
    const names = new Set();
    for (let i = 0; i < 27; i++) {
      const lon = (360 / 27) * i + 0.1;
      const y = getNityaYoga(0, lon);
      names.add(y.name);
    }
    expect(names.size).toBe(27);
  });
});

describe('Karana', () => {
  it('first half of Pratipada = Kimstughna (fixed)', () => {
    // rawTithi 0° = first Karana = Kimstughna
    const k = getKarana(0, 0);
    expect(k.name).toBe('Kimstughna');
    expect(k.isFixed).toBe(true);
  });

  it('Vishti Karana is inauspicious', () => {
    /* Vishti is the 7th repeating Karana (index 6 in repeating cycle)
       First occurrence: Karana number 8, rawTithi = 42° to 48° 
       42 / 6 = 7, so index 7 (8th Karana) */
    const k = getKarana(0, 43);
    expect(k.name).toBe('Vishti');
    expect(k.inauspicious).toBe(true);
  });

  it('60 Karanas span the full lunar cycle', () => {
    const names = new Set();
    for (let i = 0; i < 60; i++) {
      const k = getKarana(0, i * 6 + 0.1);
      names.add(k.name);
    }
    // 7 repeating + 4 fixed = 11 distinct names
    expect(names.size).toBe(11);
  });

  it('Karana number stays within 1-60', () => {
    for (let deg = 0; deg < 360; deg += 5) {
      const k = getKarana(0, deg);
      expect(k.number).toBeGreaterThanOrEqual(1);
      expect(k.number).toBeLessThanOrEqual(60);
    }
  });
});

describe('Full Panchang', () => {
  // Use a date where constants are known or at least check structure
  const testDate = new Date('2024-01-15T06:00:00Z');
  const lat = 19.076; 
  const lon = 72.877;
  
  it('returns all 5 Panchang limbs', () => {
    const panchang = getFullPanchang(testDate, lat, lon);
    expect(panchang).not.toBeNull();
    expect(panchang).toHaveProperty('vara');
    expect(panchang).toHaveProperty('tithi');
    expect(panchang).toHaveProperty('nakshatra');
    expect(panchang).toHaveProperty('yoga');
    expect(panchang).toHaveProperty('karana');
  });

  it('returns upagraha positions', () => {
    const panchang = getFullPanchang(testDate, lat, lon);
    expect(panchang.upagrahas).toHaveProperty('gulika');
    expect(panchang.upagrahas).toHaveProperty('mandi');
    expect(panchang.upagrahas.gulika).toHaveProperty('longitude');
  });

  it('tithi number is within 1-30', () => {
    const panchang = getFullPanchang(testDate, lat, lon);
    expect(panchang.tithi.number).toBeGreaterThanOrEqual(1);
    expect(panchang.tithi.number).toBeLessThanOrEqual(30);
  });

  it('paksha is Shukla or Krishna', () => {
    const panchang = getFullPanchang(testDate, lat, lon);
    expect(['Shukla','Krishna']).toContain(panchang.tithi.paksha);
  });
});
