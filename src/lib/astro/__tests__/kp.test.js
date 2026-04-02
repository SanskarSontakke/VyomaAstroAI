import { describe, it, expect } from 'vitest';
import { buildKPSubLordTable, getKPSubLord, getKPTable } from '../kp';

describe('KP Sub-lord table', () => {
  it('table has exactly 27 Nakshatra entries', () => {
    const table = buildKPSubLordTable();
    expect(table.length).toBe(27);
  });

  it('each Nakshatra has exactly 9 sub-divisions', () => {
    const table = buildKPSubLordTable();
    table.forEach(nak => {
      expect(nak.subs.length).toBe(9);
    });
  });

  it('sub-lord spans sum to Nakshatra span (13.333°)', () => {
    const table = buildKPSubLordTable();
    const NAK_SPAN = 360 / 27;
    table.forEach(nak => {
      const total = nak.subs.reduce((s, sub) => s + sub.spanDegrees, 0);
      expect(total).toBeCloseTo(NAK_SPAN, 4);
    });
  });

  it('sub-lord ranges are contiguous within Nakshatra', () => {
    const table = buildKPSubLordTable();
    table.forEach(nak => {
      for (let i = 1; i < nak.subs.length; i++) {
        expect(nak.subs[i].startDegree).toBeCloseTo(nak.subs[i-1].endDegree, 5);
      }
    });
  });

  it('Ashwini (0) starts with Ketu sub-lord', () => {
    const table = buildKPSubLordTable();
    expect(table[0].lord).toBe('Ketu');
    expect(table[0].subs[0].subLord).toBe('Ketu');
  });

  it('getKPSubLord at 0° returns Ketu sub-lord', () => {
    const result = getKPSubLord(0);
    expect(result.nakshatraLord).toBe('Ketu');
    expect(result.subLord).toBe('Ketu');
  });

  it('getKPSubLord returns valid result for any longitude 0-360', () => {
    for (let lon = 0; lon < 360; lon += 7.3) {
      const r = getKPSubLord(lon);
      expect(r).toHaveProperty('nakshatra');
      expect(r).toHaveProperty('nakshatraLord');
      expect(r).toHaveProperty('subLord');
      expect(r.nakshatra).toBeGreaterThanOrEqual(0);
      expect(r.nakshatra).toBeLessThanOrEqual(26);
    }
  });

  it('full 360° coverage — every degree maps to a sub-lord', () => {
    const table = getKPTable();
    const lastSub = table[26].subs[8];
    expect(lastSub.endDegree).toBeCloseTo(360, 3);
  });
});
