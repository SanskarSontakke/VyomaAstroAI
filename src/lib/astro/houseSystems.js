import { log } from '../logger.js';

export const HOUSE_SYSTEMS = {
  WHOLE_SIGN: 'whole_sign',   // Most popular in classical Vedic
  EQUAL:      'equal',        // Equal 30° from ascendant  
  PLACIDUS:   'placidus',     // Used in some modern Vedic contexts
};

export function calculateHouses(ascendantLongitude, system = HOUSE_SYSTEMS.WHOLE_SIGN) {
  /*
   * Returns array of 12 house cusp longitudes (0-360°)
   * houses[0] = 1st house cusp, houses[11] = 12th house cusp
   */
  const ascSign = Math.floor(ascendantLongitude / 30); // 0-11

  switch(system) {
    case HOUSE_SYSTEMS.WHOLE_SIGN:
      /* Each house = one full sign, 1st house starts at beginning of
         ascendant sign regardless of exact ascendant degree */
      return Array.from({ length: 12 }, (_, i) => ((ascSign + i) % 12) * 30);

    case HOUSE_SYSTEMS.EQUAL:
      /* Each house is exactly 30° from the exact ascendant degree */
      return Array.from({ length: 12 }, (_, i) =>
        (ascendantLongitude + i * 30) % 360
      );

    case HOUSE_SYSTEMS.PLACIDUS:
      /* Simplified Placidus — full implementation requires
         oblique ascension calculation per house. Return equal
         as fallback for now, with a console warning */
      log.warn('HouseSystems', 'Placidus not fully implemented — using Equal');
      return Array.from({ length: 12 }, (_, i) =>
        (ascendantLongitude + i * 30) % 360
      );

    default:
      return Array.from({ length: 12 }, (_, i) => ((ascSign + i) % 12) * 30);
  }
}

export function getPlanetHouse(planetLongitude, houseCusps) {
  /*
   * Finds which house (1-12) a planet occupies
   * given the array of house cusp longitudes.
   */
  for (let i = 11; i >= 0; i--) {
    const cuspStart = houseCusps[i];
    const cuspEnd   = houseCusps[(i + 1) % 12];

    if (cuspEnd > cuspStart) {
      if (planetLongitude >= cuspStart && planetLongitude < cuspEnd) {
        return i + 1;
      }
    } else {
      // Handles wrap-around (e.g. cusp at 330°, end at 30°)
      if (planetLongitude >= cuspStart || planetLongitude < cuspEnd) {
        return i + 1;
      }
    }
  }
  return 1; // fallback
}
