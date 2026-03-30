import { 
  getPlanetaryPositions, 
  getZodiacSign, 
  getNakshatra, 
  getAscendant 
} from './ephemeris.js';

import { log } from '../logger';

import { 
  getRahuKaal, 
  getYamaghanda, 
  getGuliKaal, 
  getAbhijitMuhurta 
} from './rahu.js';


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
function calculateDasha(natalMoonLon, dobDate, targetDate) {
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

export function getDailyInsights(profile, today = new Date()) {
  if (!profile) throw new Error("Profile is required.");
  const { dob_date, dob_time, latitude, longitude, timezone_offset } = profile;
  
  if (!dob_date || !dob_time) {
    throw new Error("Missing birth data (date or time) in profile.");
  }

  // 1. Calculate Birth Data
  const timeWithSeconds = dob_time.split(':').length === 2 ? `${dob_time}:00` : dob_time;
  const dobISO = `${dob_date}T${timeWithSeconds}Z`;
  const birthDate = new Date(dobISO);

  if (isNaN(birthDate.getTime())) {
    throw new Error(`Invalid birth date format: ${dobISO}`);
  }
  
  // Adjust for timezone offset to get UTC
  birthDate.setMinutes(birthDate.getMinutes() - (timezone_offset * 60));
  
  const natalPositions = getPlanetaryPositions(birthDate, latitude, longitude);
  const natalAsc = getAscendant(birthDate, latitude, longitude);
  
  if (!natalPositions || isNaN(natalPositions.Moon)) {
    throw new Error("Planetary calculation failed. Check latitude/longitude coordinates.");
  }

  const natalMoonSign = getZodiacSign(natalPositions.Moon);
  const natalMoonNak = getNakshatra(natalPositions.Moon).nakshatra;


  
  // 2. Calculate Current Transit Data
  const currentPositions = getPlanetaryPositions(today, latitude, longitude);
  const todayMoonSign = getZodiacSign(currentPositions.Moon);
  const todaySunSign = getZodiacSign(currentPositions.Sun);
  const todayNakIndex = getNakshatra(currentPositions.Moon).nakshatra;
  
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


  
  // C. Tithi
  const rawTithi = (currentPositions.Moon - currentPositions.Sun + 360) % 360;
  const tithiNumber = Math.floor(rawTithi / 12) + 1;
  const tithiIndex = (tithiNumber - 1) % 15;
  const isRikta = [4, 9, 14].includes(tithiNumber % 15 || 15);
  
  // D. Tara Bala
  // Distance from natal nakshatra (1-based)
  const distance = ((todayNakIndex - natalMoonNak + 27) % 27) + 1;
  const taraResult = (distance % 9) || 9;
  const tara = taraBalaData[String(taraResult)];
  
  if (!tara) {
    log.error("Insights", `Tara lookup failed for result: ${taraResult} from distance: ${distance}`);
  }

  // E. Lucky Color + Number
  const ascLord = RASHI_LORDS[natalAsc.sign];
  const weekday = today.getDay(); // 0 = Sunday
  const weekdayRuler = WEEKDAY_RULERS[weekday];
  
  const friends = luckyData.friendships[ascLord] || [];
  const isFriendly = friends.includes(weekdayRuler) || ascLord === weekdayRuler;
  
  const luckyPlanet = isFriendly ? weekdayRuler : ascLord;
  const luckyColor = luckyData.colors[luckyPlanet];
  const luckyNumber = luckyData.numbers[luckyPlanet];
  
  // F. Dasha
  const dasha = calculateDasha(natalPositions.Moon, birthDate, today);
  
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
    tithi: {
      number: tithiNumber,
      name: TITHI_NAMES[tithiIndex],
      isRikta
    },
    taraBala: {
      name: tara?.name || "Unknown",
      favorable: tara?.favorable || false,
      description: tara?.description || ""
    },
    luckyColor,
    luckyNumber,
    currentDasha: dasha,
    timings: {
      rahuKaal: getRahuKaal(today, latitude, longitude),
      yamaghanda: getYamaghanda(today, latitude, longitude),
      guliKaal: getGuliKaal(today, latitude, longitude),
      abhijitMuhurta: getAbhijitMuhurta(today, latitude, longitude)
    }

  };
}

