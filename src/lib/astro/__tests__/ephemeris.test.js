import { describe, it, expect } from 'vitest';
import { getPlanetaryPositions, getAscendant,
         getZodiacSign, getNakshatra } from '../ephemeris';
import { REFERENCE_CHARTS, withinTolerance, TOLERANCE } from './referenceData';

describe('Ephemeris — planetary positions', () => {

  REFERENCE_CHARTS.forEach(chart => {
    describe(chart.label, () => {
      const { input, expected } = chart;
      
      /* Build birthDate from input */
      // Strictly handle local to UTC conversion
      const localDate = new Date(`${input.dob_date}T${input.dob_time}:00`);
      const birthDate = new Date(localDate.getTime() - input.timezone_offset * 3600 * 1000);
      
      let positions, ascendant;
      try {
        positions  = getPlanetaryPositions(birthDate, input.latitude, input.longitude);
        ascendant  = getAscendant(birthDate, input.latitude, input.longitude);
      } catch(e) {
        console.error(`Error in ${chart.label}:`, e);
        positions  = {};
        ascendant  = {};
      }

      Object.entries(expected.positions).forEach(([planet, exp]) => {
        const actualObj = positions[planet];
        const actualLon = actualObj?.longitude !== undefined ? actualObj.longitude : actualObj;

        it(`${planet} longitude within ±${TOLERANCE}°`, () => {
          expect(actualLon, `${planet} longitude mismatch`).toBeDefined();
          const diff = actualLon - exp.longitude;
          console.log(`[DEBUG] ${chart.id} | ${planet}: Actual=${actualLon.toFixed(4)}, Expected=${exp.longitude.toFixed(4)}, Diff=${diff.toFixed(4)}`);
          expect(withinTolerance(actualLon, exp.longitude), 
            `${planet} expected ${exp.longitude}, got ${actualLon}`).toBe(true);
        });

        it(`${planet} in correct sign (${exp.sign})`, () => {
          const sign = getZodiacSign(actualLon);
          expect(sign, `${planet} expected sign ${exp.sign}, got ${sign} (lon: ${actualLon})`).toBe(exp.sign);
        });
      });

      it('Ascendant in correct sign', () => {
        expect(ascendant.sign, `Ascendant expected sign ${expected.ascendant.sign}, got ${ascendant.sign} (lon: ${ascendant.longitude})`).toBe(expected.ascendant.sign);
      });

      it('Moon nakshatra is correct', () => {
        const moonLon = positions.Moon?.longitude !== undefined ? positions.Moon.longitude : positions.Moon;
        const nak = getNakshatra(moonLon);
        expect(nak.name).toBe(expected.nakshatra.moon.name);
      });
    });
  });
});
