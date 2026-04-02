import { describe, it, expect } from 'vitest';
import { getPlanetaryPositions, getAscendant,
         getNakshatra, getZodiacSign, isCombust } from '../ephemeris';
import { getMahaDasha, getCurrentDasha,
         getAntarDasha, getPratyantarDasha } from '../dasha';
import { detectYogas } from '../yogas';
import { getAspects, doesPlanetAspect } from '../aspects';
import { calculateCompatibility } from '../compatibility';
import { getNityaYoga, getKarana } from '../panchang';
import { getKPSubLord, buildKPSubLordTable } from '../kp';
import { REFERENCE_CHARTS, withinTolerance } from './referenceData';

/** Build birth UTC using the same naive method as ephemeris.test.js */
function makeBirthDate(input) {
  const localDate = new Date(`${input.dob_date}T${input.dob_time}:00`);
  return new Date(localDate.getTime() - input.timezone_offset * 3600 * 1000);
}

/* ═══════════════════════════════════════
   SECTION 1: POSITION ACCURACY
   All 5 reference charts must match within 0.5°
═══════════════════════════════════════ */

describe('Cross-verification: Planetary positions', () => {
  REFERENCE_CHARTS.forEach(chart => {
    describe(chart.label, () => {
      const { input, expected } = chart;
      const birthUTC  = makeBirthDate(input);
      const positions = getPlanetaryPositions(birthUTC, input.latitude, input.longitude);
      const ascendant = getAscendant(birthUTC, input.latitude, input.longitude);

      Object.entries(expected.positions).forEach(([planet, exp]) => {
        it(`${planet} within 0.5° of expected ${exp.longitude}°`, () => {
          const actual = positions[planet].longitude;
          expect(withinTolerance(actual, exp.longitude)).toBe(true);
        });
      });

      it('ascendant sign matches', () => {
        expect(ascendant.sign).toBe(expected.ascendant.sign);
      });

      it('ascendant longitude within 1°', () => {
        expect(withinTolerance(ascendant.longitude,
          expected.ascendant.longitude, 1.0)).toBe(true);
      });
    });
  });
});

/* ═══════════════════════════════════════
   SECTION 2: RETROGRADE FLAGS
═══════════════════════════════════════ */

describe('Cross-verification: Retrograde flags', () => {
  REFERENCE_CHARTS.forEach(chart => {
    const { input, expected } = chart;
    const birthUTC  = makeBirthDate(input);
    const positions = getPlanetaryPositions(birthUTC, input.latitude, input.longitude);

    Object.entries(expected.positions).forEach(([planet, exp]) => {
      if (exp.retrograde === undefined) return;
      // Rahu/Ketu always retrograde by definition — skip speed-detection check
      if (planet === 'Rahu' || planet === 'Ketu') return;
      it(`${chart.label} — ${planet} retrograde=${exp.retrograde}`, () => {
        expect(positions[planet].retrograde).toBe(exp.retrograde);
      });
    });
  });
});

/* ═══════════════════════════════════════
   SECTION 3: NAKSHATRA ACCURACY
═══════════════════════════════════════ */

describe('Cross-verification: Nakshatras', () => {
  REFERENCE_CHARTS.forEach(chart => {
    it(`${chart.label} — Moon nakshatra`, () => {
      const { input, expected } = chart;
      const birthUTC  = makeBirthDate(input);
      const positions = getPlanetaryPositions(birthUTC, input.latitude, input.longitude);
      const nak = getNakshatra(positions.Moon.longitude);
      expect(nak.name).toBe(expected.nakshatra.moon.name);
    });
  });
});

/* ═══════════════════════════════════════
   SECTION 4: DASHA ACCURACY
═══════════════════════════════════════ */

describe('Cross-verification: Vimshottari Dasha', () => {
  it('Mumbai 1990 — Mars Maha Dasha at birth', () => {
    const chart    = REFERENCE_CHARTS[0];
    const birthUTC = makeBirthDate(chart.input);
    const positions = getPlanetaryPositions(birthUTC, chart.input.latitude, chart.input.longitude);
    const dashas    = getMahaDasha(positions.Moon.longitude, birthUTC);
    expect(dashas[0].planet).toBe('Mars');
  });

  it('Dasha total is approx 120 years for all reference charts', () => {
    REFERENCE_CHARTS.forEach(chart => {
      const birthUTC  = makeBirthDate(chart.input);
      const positions = getPlanetaryPositions(birthUTC, chart.input.latitude, chart.input.longitude);
      const dashas    = getMahaDasha(positions.Moon.longitude, birthUTC);
      const totalYrs  = dashas.reduce((s, d) =>
        s + (d.endDate - d.startDate) / (365.25 * 86400000), 0);
      expect(totalYrs).toBeGreaterThan(119);
      expect(totalYrs).toBeLessThan(140);
    });
  });

  it('Pratyantar Dashas nest correctly within Antar Dashas', () => {
    const chart    = REFERENCE_CHARTS[0];
    const birthUTC = makeBirthDate(chart.input);
    const positions = getPlanetaryPositions(birthUTC, chart.input.latitude, chart.input.longitude);
    const dashas    = getMahaDasha(positions.Moon.longitude, birthUTC);
    const antars    = getAntarDasha(dashas[1]); // 2nd Maha Dasha
    const prats     = getPratyantarDasha(antars[0]);
    // Check timing within 1 minute (60,000ms)
    expect(Math.abs(prats[0].startDate.getTime() - antars[0].startDate.getTime())).toBeLessThan(60000);
    expect(Math.abs(prats[8].endDate.getTime() - antars[0].endDate.getTime())).toBeLessThan(60000);
  });
});

/* ═══════════════════════════════════════
   SECTION 5: ASPECT INTEGRITY
═══════════════════════════════════════ */

describe('Cross-verification: Aspects', () => {
  it('every planet aspects its 7th house at full strength', () => {
    const planets = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
    planets.forEach(p => {
      for (let sign = 0; sign < 12; sign++) {
        const seventh = (sign + 6) % 12;
        expect(doesPlanetAspect(p, sign, seventh)).toBe(1.0);
      }
    });
  });

  it('Mars aspects exactly 3 houses (7th, 4th, 8th)', () => {
    let aspectCount = 0;
    for (let target = 0; target < 12; target++) {
      if (doesPlanetAspect('Mars', 0, target) > 0) aspectCount++;
    }
    expect(aspectCount).toBe(3);
  });

  it('Jupiter aspects exactly 3 houses (7th, 5th, 9th)', () => {
    let count = 0;
    for (let t = 0; t < 12; t++) {
      if (doesPlanetAspect('Jupiter', 0, t) > 0) count++;
    }
    expect(count).toBe(3);
  });

  it('Saturn aspects exactly 3 houses (7th, 3rd, 10th)', () => {
    let count = 0;
    for (let t = 0; t < 12; t++) {
      if (doesPlanetAspect('Saturn', 0, t) > 0) count++;
    }
    expect(count).toBe(3);
  });
});

/* ═══════════════════════════════════════
   SECTION 6: COMPATIBILITY
═══════════════════════════════════════ */

describe('Cross-verification: Compatibility', () => {
  it('same person compatibility is highly positive', () => {
    const chart = REFERENCE_CHARTS[0];
    const result = calculateCompatibility(chart.input, chart.input);
    expect(result.totalScore).toBeGreaterThan(20);
  });

  it('Nadi Dosha detected when both have same Nadi', () => {
    /* Create two profiles with Moon in same Nakshatra group */
    /* Both in Ashwini (Vata nadi) */
    const result = calculateCompatibility(
      { ...REFERENCE_CHARTS[0].input }, // Ashwini Moon (Vata)
      { ...REFERENCE_CHARTS[0].input }  // same
    );
    expect(result.nadiDosha).toBe(true);
    expect(result.kutas.nadi.score).toBe(0);
  });

  it('score is between 0 and 36', () => {
    REFERENCE_CHARTS.forEach((chartA, i) => {
      const chartB = REFERENCE_CHARTS[(i + 1) % REFERENCE_CHARTS.length];
      const result = calculateCompatibility(chartA.input, chartB.input);
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(36);
    });
  });
});

/* ═══════════════════════════════════════
   SECTION 7: PANCHANG COMPLETENESS
═══════════════════════════════════════ */

describe('Cross-verification: Panchang', () => {
  it('Nitya Yoga index stays within 0-26 for any date', () => {
    for (let day = 0; day < 30; day++) {
      // Test with various sun-moon combinations
      const y = getNityaYoga(day * 12, day * 13);
      expect(y.index).toBeGreaterThanOrEqual(0);
      expect(y.index).toBeLessThanOrEqual(26);
    }
  });

  it('Karana number stays within 1-60 for any sun-moon combination', () => {
    for (let deg = 0; deg < 360; deg += 6) {
      const k = getKarana(0, deg);
      expect(k.number).toBeGreaterThanOrEqual(1);
      expect(k.number).toBeLessThanOrEqual(60);
    }
  });
});

/* ═══════════════════════════════════════
   SECTION 8: KP SYSTEM
═══════════════════════════════════════ */

describe('Cross-verification: KP System', () => {
  it('KP table covers full 360° without gaps', () => {
    const table = buildKPSubLordTable();
    let prev = 0;
    table.forEach(nak => {
      nak.subs.forEach(sub => {
        expect(sub.startDegree).toBeCloseTo(prev, 4);
        prev = sub.endDegree;
      });
    });
    expect(prev).toBeCloseTo(360, 3);
  });

  it('every degree maps to a valid sub-lord', () => {
    const planets = ['Ketu','Venus','Sun','Moon','Mars',
                     'Rahu','Jupiter','Saturn','Mercury'];
    for (let lon = 0.1; lon < 360; lon += 1.7) {
      const r = getKPSubLord(lon);
      expect(planets).toContain(r.nakshatraLord);
      expect(planets).toContain(r.subLord);
    }
  });
});
