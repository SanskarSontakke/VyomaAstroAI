import { 
  getPlanetaryPositions, 
  getZodiacSign, 
  getNakshatra, 
  getAscendant 
} from './ephemeris.js';

import { log } from '../logger';
import { parseBirthDateUTC } from '../timezones';

import { 
  getRahuKaal, 
  getYamaghanda, 
  getGuliKaal, 
  getAbhijitMuhurta 
} from './rahu.js';
import { getFullPanchang } from './panchang.js';


import gocharMoonData from '../../locales/en/gochar_moon.json';
import monthlyThemeData from '../../locales/en/monthly_theme.json';
import luckyData from '../../locales/en/lucky.json';
import taraBalaData from '../../locales/en/tara_bala.json';

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", 
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", 
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
];

const WEEKDAY_RULERS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

const RASHI_LORDS = [
  "Mars",    // Aries
  "Venus",   // Taurus
  "Mercury", // Gemini
  "Moon",    // Cancer
  "Sun",     // Leo
  "Mercury", // Virgo
  "Venus",   // Libra
  "Mars",    // Scorpio
  "Jupiter", // Sagittarius
  "Saturn",  // Capricorn
  "Saturn",  // Aquarius
  "Jupiter"  // Pisces
];

const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_DURATIONS = [7, 20, 6, 10, 7, 18, 16, 19, 17];
const TOTAL_DASHA_CYCLE = 120;

/**
 * Helper to calculate Vimshottari Dasha
 */
function calculateDasha(moonData, dobDate, targetDate) {
  const natalMoonLon = typeof moonData === 'number' ? moonData : moonData.longitude;
  const nakDegree = natalMoonLon % (360/27);
  const nakIndex = Math.floor(natalMoonLon / (360/27));
  const firstDashaIndex = nakIndex % 9;
  
  const totalYearsInNak = (360/27);
  const percentRemaining = (totalYearsInNak - nakDegree) / totalYearsInNak;
  
  const firstDashaDuration = DASHA_DURATIONS[firstDashaIndex];
  const remainingFirstDashaYears = percentRemaining * firstDashaDuration;
  
  let currentDate = new Date(dobDate);
  currentDate.setFullYear(currentDate.getFullYear() + remainingFirstDashaYears);
  
  let dashaPointer = firstDashaIndex;
  
  // Find current Mahadasha
  while (currentDate < targetDate) {
    dashaPointer = (dashaPointer + 1) % 9;
    currentDate.setFullYear(currentDate.getFullYear() + DASHA_DURATIONS[dashaPointer]);
  }
  
  const mahaDasha = DASHA_ORDER[dashaPointer];
  const mahaDashaEnd = new Date(currentDate);
  const mahaDashaStart = new Date(currentDate);
  mahaDashaStart.setFullYear(mahaDashaStart.getFullYear() - DASHA_DURATIONS[dashaPointer]);
  
  // Calculate Antardasha within this Mahadasha
  const mahaDashaTotalYears = DASHA_DURATIONS[dashaPointer];
  let antarPointer = dashaPointer; // Antardasha starts with the same planet as Mahadasha
  let antarStartDate = new Date(mahaDashaStart);
  let antarEndDate = new Date(mahaDashaStart);
  
  for (let i = 0; i < 9; i++) {
    const years = (DASHA_DURATIONS[dashaPointer] * DASHA_DURATIONS[antarPointer]) / TOTAL_DASHA_CYCLE;
    antarEndDate = new Date(antarStartDate);
    antarEndDate.setTime(antarEndDate.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);
    
    if (antarEndDate > targetDate) {
      return {
        maha: mahaDasha,
        antar: DASHA_ORDER[antarPointer],
        antarEnds: antarEndDate
      };
    }
    antarStartDate = new Date(antarEndDate);
    antarPointer = (antarPointer + 1) % 9;
  }
  
  return { maha: mahaDasha, antar: "Unknown", antarEnds: mahaDashaEnd };
}

export function getDailyInsights(profile, today = new Date(), ayanamsaSystem = 'lahiri') {
  if (!profile) throw new Error("Profile is required.");
  const { dob_date, dob_time, latitude, longitude, iana_timezone } = profile;
  
  if (!dob_date || !dob_time) {
    throw new Error("Missing birth data (date or time) in profile.");
  }

  // 1. Calculate Birth Data
  const birthDate = parseBirthDateUTC(dob_date, dob_time, iana_timezone || 'Asia/Kolkata');
  
  const natalPositions = getPlanetaryPositions(birthDate, latitude, longitude, ayanamsaSystem);
  const natalAsc = getAscendant(birthDate, latitude, longitude, ayanamsaSystem);
  
  if (!natalPositions || isNaN(natalPositions.Moon.longitude)) {
    throw new Error("Planetary calculation failed. Check latitude/longitude coordinates.");
  }

  const natalMoonSign = getZodiacSign(natalPositions.Moon.longitude);
  const natalMoonNak = getNakshatra(natalPositions.Moon.longitude).nakshatra;
  
  // 2. Calculate Current Transit Data
  const currentPositions = getPlanetaryPositions(today, latitude, longitude, ayanamsaSystem);
  const todayMoonSign = getZodiacSign(currentPositions.Moon.longitude);
  const todaySunSign = getZodiacSign(currentPositions.Sun.longitude);
  const todayNakIndex = getNakshatra(currentPositions.Moon.longitude).nakshatra;
  
  // A. Daily Outlook (Chandra Gochar)
  const houseFromMoon = ((todayMoonSign - natalMoonSign + 12) % 12) + 1;
  const outlook = gocharMoonData[`house_${houseFromMoon}`];
  
  if (!outlook) {
    throw new Error(`Outlook record for house ${houseFromMoon} is missing from locales.`);
  }

  // B. Monthly Theme (Surya Gochar)
  const houseFromLagna = ((todaySunSign - natalAsc.sign + 12) % 12) + 1;
  const theme = monthlyThemeData[`house_${houseFromLagna}`];

  if (!theme) {
    throw new Error(`Monthly theme for house ${houseFromLagna} is missing from locales.`);
  }
  
  const dasha = calculateDasha(natalPositions.Moon, birthDate, today);
  
  // G. Full Panchang
  const panchang = getFullPanchang(today, latitude, longitude, ayanamsaSystem);

  const ruler = RASHI_LORDS[todayMoonSign];
  const luckyColor = luckyData.colors[ruler];
  const luckyNumber = luckyData.numbers[ruler];
  const tara = taraBalaData[((todayNakIndex - natalMoonNak + 27) % 9) + 1];

  return {
    dailyOutlook: {
      score: outlook.score,
      title: outlook.title,
      description: outlook.description,
      houseFromMoon
    },
    monthlyTheme: {
      title: theme.title,
      description: theme.description,
      favorable: theme.favorable,
      houseFromLagna
    },
    tithi: panchang.tithi,
    nakshatra: panchang.nakshatra,
    yoga: panchang.yoga,
    karana: panchang.karana,
    upagrahas: panchang.upagrahas,
    vara: panchang.vara,
    taraBala: {
      name: tara?.name || "Unknown",
      favorable: tara?.favorable || false,
      description: tara?.description || ""
    },
    luckyColor,
    luckyNumber,
    currentDasha: dasha,
    timings: panchang.timings
  };
}


