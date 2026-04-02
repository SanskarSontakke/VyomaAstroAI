import { getZodiacSign } from './ephemeris';

/**
 * Jyotish Planetary Aspects (Drishti)
 * 
 * Standard Rules:
 * - All planets aspect the 7th house from their position at full strength.
 * - Mars: Special aspects to the 4th and 8th houses.
 * - Jupiter: Special aspects to the 5th and 9th houses.
 * - Saturn: Special aspects to the 3rd and 10th houses.
 */

/**
 * doesPlanetAspect(planet, planetSign, targetSign)
 * @param {string} planet - Name of the aspecting planet.
 * @param {number} planetSign - Zodiac sign index (0-11) where the planet is located.
 * @param {number} targetSign - Zodiac sign index (0-11) of the target house.
 * @returns {number} Aspect strength (0 to 1).
 */
export function doesPlanetAspect(planet, planetSign, targetSign) {
  if (['Rahu', 'Ketu'].includes(planet)) return 0.0; // Standard systems don't give aspects to nodes

  const houseDiff = (targetSign - planetSign + 12) % 12 + 1;

  // 1. All planets aspect 7th house
  if (houseDiff === 7) return 1.0;

  // 2. Special full aspects
  if (planet === 'Mars' && (houseDiff === 4 || houseDiff === 8)) return 1.0;
  if (planet === 'Jupiter' && (houseDiff === 5 || houseDiff === 9)) return 1.0;
  if (planet === 'Saturn' && (houseDiff === 3 || houseDiff === 10)) return 1.0;

  return 0.0;
}

/**
 * getAspects(positions)
 * Analyzes all planetary aspects between planets in the chart.
 * @param {Object} positions - Object mapping planet names to their data (longitude, sign).
 * @returns {Array} List of active aspects { from, to, strength, house }.
 */
export function getAspects(positions) {
  const planets = Object.keys(positions);
  const aspects = [];

  planets.forEach(p1 => {
    const data1 = positions[p1];
    const sign1 = data1.sign !== undefined ? data1.sign : getZodiacSign(data1.longitude);

    planets.forEach(p2 => {
      if (p1 === p2) return;
      const data2 = positions[p2];
      const sign2 = data2.sign !== undefined ? data2.sign : getZodiacSign(data2.longitude);

      const strength = doesPlanetAspect(p1, sign1, sign2);
      if (strength > 0) {
        aspects.push({
          from: p1,
          to: p2,
          strength,
          house: (sign2 - sign1 + 12) % 12 + 1
        });
      }
    });
  });

  return aspects;
}
