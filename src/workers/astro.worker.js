/* Vite module worker — can use ES imports */
import { getPlanetaryPositions, getAscendant, getZodiacSign } from '../lib/astro/ephemeris';
import { getMahaDasha, getCurrentDasha } from '../lib/astro/dasha';
import { getDailyInsights } from '../lib/astro/insights';
import { getAllVargas } from '../lib/astro/vargas';
import { detectYogas } from '../lib/astro/yogas';
import { calculateShadbala } from '../lib/astro/shadbala';
import { calculateAshtakavarga } from '../lib/astro/ashtakavarga';
import { parseBirthDateUTC } from '../lib/timezones';
import { calculateCompatibility } from '../lib/astro/compatibility';
import { findNextEclipses } from '../lib/astro/eclipses';
import { findMuhurtas } from '../lib/astro/muhurta';

async function calcPositions({ dateISO, lat, lon, ayanamsaSystem }) {
  const date = new Date(dateISO);
  return getPlanetaryPositions(date, lat, lon, ayanamsaSystem);
}

async function calcFullChart({ profile, ayanamsaSystem, houseSystem }) {
  const birthUTC = parseBirthDateUTC(
    profile.dob_date, profile.dob_time, profile.iana_timezone || 'Asia/Kolkata'
  );
  
  const positions  = getPlanetaryPositions(birthUTC, profile.latitude, profile.longitude, ayanamsaSystem);
  const ascendant  = getAscendant(birthUTC, profile.latitude, profile.longitude, ayanamsaSystem);
  
  const moonLon    = positions.Moon.longitude;
  const dashaTimeline = getMahaDasha(moonLon, birthUTC);
  const current    = getCurrentDasha(dashaTimeline, new Date());
  
  /* Profile must have iana_timezone for vargas */
  const vargas     = getAllVargas({ ...profile, iana_timezone: profile.iana_timezone || 'Asia/Kolkata' }, ayanamsaSystem);
  const yogas      = detectYogas(positions, ascendant.sign);
  
  /* Construct planetary data format expected by shadbala/ashtakavarga */
  const planetData = {};
  Object.entries(positions).forEach(([name, data]) => {
      planetData[name] = { 
          longitude: data.longitude, 
          sign: data.sign,
          retrograde: data.retrograde,
          combust: data.combust
      };
  });

  const shadbala   = calculateShadbala(planetData, ascendant.sign, birthUTC);
  const ashtak     = calculateAshtakavarga(planetData, ascendant.sign);
  
  return { 
    positions: planetData, 
    ascendant, 
    dashaTimeline, 
    currentDasha: current,
    vargas, 
    yogas, 
    shadbala, 
    ashtakavarga: ashtak,
    birthDate: birthUTC
  };
}

async function calcInsights({ profile, dateISO, ayanamsaSystem }) {
  const date = new Date(dateISO);
  return getDailyInsights(profile, date, ayanamsaSystem);
}

async function handleFindEclipses({ lat, lon, count }) {
  return findNextEclipses(lat, lon, count);
}

async function handleFindMuhurtas({ profile, goalType, startISO, endISO, ayanamsaSystem }) {
  return findMuhurtas(profile, goalType, new Date(startISO), new Date(endISO), ayanamsaSystem);
}

async function handleCalcCompatibility({ profileA, profileB, ayanamsaSystem }) {
  return calculateCompatibility(profileA, profileB, ayanamsaSystem);
}

self.addEventListener('message', async (e) => {
  const { id, type, payload } = e.data;
  try {
    let result;
    switch(type) {
      case 'CALC_POSITIONS':  result = await calcPositions(payload); break;
      case 'CALC_CHART':      result = await calcFullChart(payload); break;
      case 'CALC_INSIGHTS':   result = await calcInsights(payload); break;
      case 'FIND_ECLIPSES':   result = await handleFindEclipses(payload); break;
      case 'FIND_MUHURTAS':   result = await handleFindMuhurtas(payload); break;
      case 'CALC_COMPATIBILITY': result = await handleCalcCompatibility(payload); break;
      
      // Parallelizable Sub-tasks
      case 'CALC_VARGAS': 
        result = getAllVargas(payload.profile, payload.ayanamsaSystem); 
        break;
      case 'CALC_YOGAS': 
        result = detectYogas(payload.positions, payload.ascendantSign); 
        break;
      case 'CALC_SHADBALA': 
        result = calculateShadbala(payload.positions, payload.ascendantSign, new Date(payload.birthUTC)); 
        break;
      case 'CALC_ASHTAKAVARGA': 
        result = calculateAshtakavarga(payload.positions, payload.ascendantSign); 
        break;
      case 'CALC_DASHAS':
        result = getMahaDasha(payload.moonLon, new Date(payload.birthUTC));
        break;
        
      default: throw new Error(`Unknown type: ${type}`);
    }
    self.postMessage({ id, type, result });
  } catch(err) {
    self.postMessage({ id, type, error: err.message });
  }
});
