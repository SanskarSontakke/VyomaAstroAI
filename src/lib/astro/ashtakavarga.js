/**
 * Ashtakavarga (Transit Scoring) Calculation
 * Simplified "Bhinna Ashtakavarga" for Saturn and Jupiter.
 */

const BENEFIC_HOUSES_FROM_PLANET = {
  Saturn: {
    Sun:     [1, 2, 4, 7, 8, 10, 11],
    Moon:    [3, 6, 11],
    Mars:    [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 12],
    Jupiter: [5, 6, 11, 12],
    Venus:   [6, 11, 12],
    Saturn:  [3, 5, 6, 11],
    Ascendant: [1, 3, 4, 6, 10, 11],
  },
  Jupiter: {
    Sun:     [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon:    [2, 5, 7, 9, 11],
    Mars:    [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus:   [2, 5, 6, 9, 10, 11],
    Saturn:  [3, 5, 6, 11, 12],
    Ascendant: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
};

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

export function calculateAshtakavarga(positions, ascendantSign) {
  if (!positions || ascendantSign === undefined) return null;

  const result = {
    Saturn: { scores: new Array(12).fill(0), total: 0 },
    Jupiter: { scores: new Array(12).fill(0), total: 0 },
    sarvashtakavarga: new Array(12).fill(0)
  };

  ['Saturn', 'Jupiter'].forEach(planet => {
    for (let sign = 0; sign < 12; sign++) {
      let score = 0;
      
      // Contributors: 7 planets + Ascendant
      PLANETS.forEach(contributor => {
        const contributorSign = positions[contributor].sign;
        const houseDistance = ((sign - contributorSign + 12) % 12) + 1;
        if (BENEFIC_HOUSES_FROM_PLANET[planet][contributor].includes(houseDistance)) {
          score += 1;
        }
      });

      // Ascendant contribution
      const ascDistance = ((sign - ascendantSign + 12) % 12) + 1;
      if (BENEFIC_HOUSES_FROM_PLANET[planet].Ascendant.includes(ascDistance)) {
        score += 1;
      }

      result[planet].scores[sign] = score;
      result[planet].total += score;
      result.sarvashtakavarga[sign] += score;
    }
  });

  return result;
}
