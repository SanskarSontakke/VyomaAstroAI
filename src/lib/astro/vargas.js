import { getPlanetaryPositions, getAscendant, getZodiacSign } from './ephemeris';
import { parseBirthDateUTC } from '../timezones';

/**
 * Core mathematical formula for any Divisional Chart D-N.
 * N = the division number (e.g., 9 for Navamsha).
 */
export function getVargaChart(positions, ascendant, N) {
  if (N === 1) return { positions, ascendant };

  const vargaPositions = {};
  
  // 1. Calculate Planet Sign Indices for the Varga
  Object.entries(positions).forEach(([name, data]) => {
    const lon = typeof data === 'number' ? data : data.longitude;
    const originalSign = getZodiacSign(lon);
    
    // Position within the current sign (0-30)
    const posWithinSign = lon % 30;
    
    // Which segment (0 to N-1) does it fall in?
    const segment = Math.floor(posWithinSign / (30 / N));
    
    // Calculate the Varga sign index (0-11)
    const vargaSign = (originalSign * N + segment) % 12;
    
    vargaPositions[name] = {
      sign: vargaSign,
      longitude: (vargaSign * 30) + (posWithinSign * N) % 30 // Approximate for display
    };
  });

  // 2. Calculate Ascendant for the Varga
  const ascLon = ascendant.longitude;
  const ascOrigSign = getZodiacSign(ascLon);
  const ascPosWithinSign = ascLon % 30;
  const ascSegment = Math.floor(ascPosWithinSign / (30 / N));
  const ascVargaSign = (ascOrigSign * N + ascSegment) % 12;

  const vargaAscendant = {
    sign: ascVargaSign,
    longitude: (ascVargaSign * 30) + (ascPosWithinSign * N) % 30
  };

  return { positions: vargaPositions, ascendant: vargaAscendant };
}

/**
 * Calculate all standard Shodashavarga (16 divisions) for a profile.
 */
export function getAllVargas(profile) {
  if (!profile) return null;

  // Resolve true birth date (utc)
  const birthDate = parseBirthDateUTC(profile.dob_date, profile.dob_time, profile.iana_timezone || 'Asia/Kolkata');

  const d1Positions = getPlanetaryPositions(birthDate, profile.latitude, profile.longitude);
  const d1Ascendant = getAscendant(birthDate, profile.latitude, profile.longitude);

  const divisions = [1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60];
  const vargas = {};

  divisions.forEach(N => {
    vargas[`D${N}`] = getVargaChart(d1Positions, d1Ascendant, N);
  });

  return vargas;
}

