import { getNakshatra } from './ephemeris.js';
import { log } from '../logger.js';

/**
 * Vimshottari Dasha Calculator
 * 120-year cycle based on the Moon's natal Nakshatra position.
 */

export const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

export const DASHA_YEARS = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17
};

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/**
 * getMahaDasha(moonLongitude, birthDate)
 * Calculates the full 120-year Maha Dasha cycle.
 * 
 * @param {number} moonLongitude - Sidereal longitude of the Moon in degrees.
 * @param {Date} birthDate - Natal date/time.
 * @returns {Array} List of { planet, startDate, endDate }
 */
export function getMahaDasha(moonLongitude, birthDate) {
  const nak = getNakshatra(moonLongitude);
  const lordIndex = nak.nakshatra % 9;
  
  // Progress into current Nakshatra (0 to 1)
  const nakSpan = 360 / 27;
  const nakStart = nak.nakshatra * nakSpan;
  const progress = (moonLongitude - nakStart) / nakSpan;
  const fractionRemaining = 1 - progress;
  
  const currentBirthTime = birthDate.getTime();
  let dashaPointer = currentBirthTime;
  const result = [];
  
  // Calculate first dasha (balance at birth)
  const firstPlanet = DASHA_ORDER[lordIndex];
  const firstDuration = fractionRemaining * DASHA_YEARS[firstPlanet] * MS_PER_YEAR;
  const firstEndDate = new Date(dashaPointer + firstDuration);
  
  result.push({
    planet: firstPlanet,
    startDate: new Date(dashaPointer),
    endDate: firstEndDate
  });
  
  dashaPointer = firstEndDate.getTime();
  
  // Fill the rest of the 120-year cycle
  let currentOrderIndex = (lordIndex + 1) % 9;
  
  // Collect approx 120 years total
  const endThreshold = currentBirthTime + (121 * MS_PER_YEAR); // A bit more than 120
  
  let i = 0;
  while (dashaPointer < endThreshold) {
    if (i > 1000) {
      log.error("Dasha", "Error in getMahaDasha:", new Error('Max iterations reached'));
      break;
    }
    const planet = DASHA_ORDER[currentOrderIndex];
    const duration = DASHA_YEARS[planet] * MS_PER_YEAR;
    const nextEndDate = new Date(dashaPointer + duration);
    
    result.push({
      planet,
      startDate: new Date(dashaPointer),
      endDate: nextEndDate
    });
    
    dashaPointer = nextEndDate.getTime();
    currentOrderIndex = (currentOrderIndex + 1) % 9;
    i++;
  }
  
  return result;
}

/**
 * getAntarDasha(mahaDasha)
 * Subdivides a Maha Dasha into 9 Antar Dashas.
 * 
 * @param {Object} mahaDasha - { planet, startDate, endDate }
 * @returns {Array} List of { mahaPlanet, antarPlanet, startDate, endDate }
 */
export function getAntarDasha(mahaDasha) {
  const mahaPlanet = mahaDasha.planet;
  const mahaYears = DASHA_YEARS[mahaPlanet];
  const mahaDurationMs = mahaDasha.endDate.getTime() - mahaDasha.startDate.getTime();
  
  let dashaPointer = mahaDasha.startDate.getTime();
  const mahaLordIndex = DASHA_ORDER.indexOf(mahaPlanet);
  const result = [];
  
  for (let i = 0; i < 9; i++) {
    const antarPlanetIndex = (mahaLordIndex + i) % 9;
    const antarPlanet = DASHA_ORDER[antarPlanetIndex];
    const antarYears = DASHA_YEARS[antarPlanet];
    
    // Proportion: (antar / 120) * maha_duration
    const antarDuration = (antarYears / 120) * mahaDurationMs;
    const nextEndDate = new Date(dashaPointer + antarDuration);
    
    result.push({
      mahaPlanet,
      antarPlanet,
      startDate: new Date(dashaPointer),
      endDate: nextEndDate
    });
    
    dashaPointer = nextEndDate.getTime();
  }
  
  return result;
}

/**
 * getCurrentDasha(dashaArray, today)
 * Finds which periods are active right now.
 * 
 * @param {Array} dashaArray - Array of Maha Dashas from getMahaDasha.
 * @param {Date} today - Date to check.
 * @returns {Object|null} { maha, antar }
 */
export function getCurrentDasha(dashaArray, today = new Date()) {
  const todayMs = today.getTime();
  
  const activeMaha = dashaArray.find(d => todayMs >= d.startDate.getTime() && todayMs < d.endDate.getTime());
  
  if (!activeMaha) return null;
  
  const antars = getAntarDasha(activeMaha);
  const activeAntar = antars.find(a => todayMs >= a.startDate.getTime() && todayMs < a.endDate.getTime());
  
  return {
    maha: { planet: activeMaha.planet, endDate: activeMaha.endDate },
    antar: activeAntar ? { planet: activeAntar.antarPlanet, endDate: activeAntar.endDate } : null
  };
}

/**
 * testDasha()
 * Test using the user specified case: Moon at Nakshatra 10 (Magha), born 01/01/1990
 */
export function testDasha() {
  const birthDate = new Date('1990-01-01T00:00:00Z');
  // Magha starts at 120 deg. Index is 9 (10th nakshatra).
  const moonLongitude = 120.0; 
  
  log.info('DashaTest', '--- Vimshottari Dasha Test ---');
  log.info('DashaTest', `Birth: ${birthDate.toUTCString()}`);
  log.info('DashaTest', `Moon: ${moonLongitude}° (Magha/index 9)`);
  
  const mahaDashas = getMahaDasha(moonLongitude, birthDate);
  
  log.info('DashaTest', '\nFirst 3 Maha Dashas:');
  mahaDashas.slice(0, 3).forEach(d => {
    log.info('DashaTest', `  ${d.planet.padEnd(8)} : ${d.startDate.toLocaleDateString()} to ${d.endDate.toLocaleDateString()}`);
  });
  
  const today = new Date('2026-03-30'); // Simulating today
  const current = getCurrentDasha(mahaDashas, today);
  
  log.info('DashaTest', '\nActive Dasha (as of 2026-03-30):');
  if (current) {
    log.info('DashaTest', `  Maha: ${current.maha.planet} (ends ${current.maha.endDate.toLocaleDateString()})`);
    log.info('DashaTest', `  Antar: ${current.antar.planet} (ends ${current.antar.endDate.toLocaleDateString()})`);
  } else {
    log.info('DashaTest', '  Not found (exceeds 120 years or pre-birth).');
  }
}
