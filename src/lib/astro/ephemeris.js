/**
 * Jyotish Ephemeris Engine
 * Core planetary calculation engine using the astronomia npm package.
 * All math runs client-side — no external APIs.
 * 
 * Note: Calculations are converted to Sidereal (Nirayana) using Lahiri Ayanamsa.
 */

import * as solar from 'astronomia/solar';
import * as moonposition from 'astronomia/moonposition';
import * as planetposition from 'astronomia/planetposition';
import * as julian from 'astronomia/julian';
import * as sidereal from 'astronomia/sidereal';
import * as nutation from 'astronomia/nutation';
import * as base from 'astronomia/base';
import { log } from '../logger.js';

// VSOP87 B-type data for heliocentric ecliptic coordinates
import vsop87Bearth from 'astronomia/data/vsop87Bearth';
import vsop87Bmars from 'astronomia/data/vsop87Bmars';
import vsop87Bmercury from 'astronomia/data/vsop87Bmercury';
import vsop87Bjupiter from 'astronomia/data/vsop87Bjupiter';
import vsop87Bvenus from 'astronomia/data/vsop87Bvenus';
import vsop87Bsaturn from 'astronomia/data/vsop87Bsaturn';

// ─── Constants ───────────────────────────────────────────────────────────────
const R2D = 180 / Math.PI;  // radians → degrees
const D2R = Math.PI / 180;  // degrees → radians

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha',
  'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
  'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// ─── VSOP87 Planet instances ──────────────────────────────────────────────────
const baseUtil = base.default || base;

const marsP    = new planetposition.Planet(vsop87Bmars);
const mercuryP = new planetposition.Planet(vsop87Bmercury);
const jupiterP = new planetposition.Planet(vsop87Bjupiter);
const venusP   = new planetposition.Planet(vsop87Bvenus);
const saturnP  = new planetposition.Planet(vsop87Bsaturn);
const earthP   = new planetposition.Planet(vsop87Bearth);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize any angle (degrees) into [0, 360).
 */
function norm360(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * Convert a JS Date (assumed UTC) to a Julian Day Number (JD).
 */
function dateToJD(dateObj) {
  return julian.DateToJD(dateObj);
}

/**
 * Calculate Lahiri Ayanamsa for a given Julian Century T.
 * Formula: 23.853056 + 1.396042 * T + 0.000308 * T^2
 */
export function getAyanamsa(jd) {
  const T = baseUtil.J2000Century(jd);
  return 23.853056 + (1.396042 + 0.000308 * T) * T;
}

/**
 * Get heliocentric ecliptic longitude of a planet in degrees (J2000 ecliptic),
 * then convert to geocentric by subtracting Earth's longitude (+ 180°).
 */
function helioToGeo(planetInst, jde) {
  const { lon: pLon } = planetInst.position2000(jde);
  const { lon: eLon } = earthP.position2000(jde);
  // Geocentric = heliocentric planet – heliocentric earth + 180°
  return norm360((pLon - eLon) * R2D + 180);
}

/**
 * Calculate the Moon's node (Rahu) longitude in degrees.
 * Uses the mean node formula.
 */
function rahuLongitude(T) {
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
  return norm360(omega);
}

// ─── Exported Functions ───────────────────────────────────────────────────────

/**
 * getPlanetaryPositions(dateObj, lat, lon)
 * Returns ecliptic SIDEREAL longitude (0–360°) for each graha.
 */
export function getPlanetaryPositions(dateObj, lat, lon) {
  const jd = dateToJD(dateObj);
  const T = baseUtil.J2000Century(jd);
  const ayanamsa = getAyanamsa(jd);

  // ── Sun ───────────────────────────────────────────────────────────────────
  const sunLonTropical = solar.apparentLongitude(T) * R2D;
  const sunLon = norm360(sunLonTropical - ayanamsa);

  // ── Moon ───────────────────────────────────────────────────────────────────
  const moon = moonposition.position(jd);
  const moonLon = norm360(moon.lon * R2D - ayanamsa);

  // ── Superior / Inferior Planets ───────────────────────────────────────────
  const marsLon = norm360(helioToGeo(marsP, jd) - ayanamsa);
  const mercLon = norm360(helioToGeo(mercuryP, jd) - ayanamsa);
  const jupLon  = norm360(helioToGeo(jupiterP, jd) - ayanamsa);
  const venLon  = norm360(helioToGeo(venusP,   jd) - ayanamsa);
  const satLon  = norm360(helioToGeo(saturnP,  jd) - ayanamsa);

  // ── Rahu / Ketu ───────────────────────────────────────────────────────────
  const rahuLon = norm360(rahuLongitude(T) - ayanamsa);
  const ketuLon = norm360(rahuLon + 180);

  return {
    Sun: sunLon,
    Moon: moonLon,
    Mars: marsLon,
    Mercury: mercLon,
    Jupiter: jupLon,
    Venus: venLon,
    Saturn: satLon,
    Rahu: rahuLon,
    Ketu: ketuLon,
  };
}

/**
 * getZodiacSign(longitude)
 * Returns the Vedic rashi index 0–11.
 */
export function getZodiacSign(longitude) {
  return Math.floor(norm360(longitude) / 30);
}

/**
 * getNakshatra(longitude)
 */
export function getNakshatra(longitude) {
  const deg = norm360(longitude);
  const NAKSHATRA_SPAN = 360 / 27;
  const PADA_SPAN = NAKSHATRA_SPAN / 4;

  const nakshatraIndex = Math.floor(deg / NAKSHATRA_SPAN);
  const posWithinNak = deg % NAKSHATRA_SPAN;
  const pada = Math.floor(posWithinNak / PADA_SPAN) + 1;

  return {
    nakshatra: nakshatraIndex,
    pada: Math.min(pada, 4),
    name: NAKSHATRA_NAMES[nakshatraIndex],
  };
}

/**
 * getAscendant(dateObj, lat, lon)
 * Returns sidereal Ascendant.
 */
export function getAscendant(dateObj, lat, lon) {
  const jd = dateToJD(dateObj);
  const ayanamsa = getAyanamsa(jd);

  const gastSec = sidereal.apparent(jd);
  const gastDeg = (gastSec / 3600) * 15;
  const lst = norm360(gastDeg + lon); 
  const lstRad = lst * D2R;

  const nutationResult = nutation.nutation(jd);
  const deltaEps = nutationResult[1];
  const eps0 = nutation.meanObliquity(jd);
  const eps = eps0 + deltaEps;
  const latR = lat * D2R;

  const ascRad = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(lstRad) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps))
  );
  const ascLonTropical = ascRad * R2D;
  const ascLonSidereal = norm360(ascLonTropical - ayanamsa);

  return {
    longitude: ascLonSidereal,
    sign: getZodiacSign(ascLonSidereal),
  };
}

// ─── Test Function ─────────────────────────────────────────────────────────────

export function testEphemeris() {
  const SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const testDate = new Date('1990-01-01T00:30:00.000Z');
  const lat = 19.076;
  const lon = 72.877;

  log.info('Ephemeris', '═══════════════════════════════════════════════════');
  log.info('Ephemeris', ' Jyotish Sidereal Ephemeris Test');
  log.info('Ephemeris', ' Date : 01 Jan 1990, 06:00 IST (00:30 UTC)');
  log.info('Ephemeris', ` Place: Mumbai  Lat=${lat}°N  Lon=${lon}°E`);
  log.info('Ephemeris', '═══════════════════════════════════════════════════');

  const jd = dateToJD(testDate);
  log.info('Ephemeris', ` Ayanamsa: ${getAyanamsa(jd).toFixed(4)}°`);

  const positions = getPlanetaryPositions(testDate, lat, lon);
  log.info('Ephemeris', '\n── Sidereal Planetary Positions ───────────────────');
  for (const [planet, lon_] of Object.entries(positions)) {
    const sign = getZodiacSign(lon_);
    const nak = getNakshatra(lon_);
    log.info('Ephemeris', 
      `  ${planet.padEnd(8)} : ${lon_.toFixed(4).padStart(9)}°  →  ${SIGN_NAMES[sign].padEnd(12)} (sign ${sign})  |  ${nak.name} pada ${nak.pada}`
    );
  }

  log.info('Ephemeris', '\n── Sidereal Ascendant (Lagna) ─────────────────────');
  const asc = getAscendant(testDate, lat, lon);
  const ascNak = getNakshatra(asc.longitude);
  log.info('Ephemeris', 
    `  Lagna    : ${asc.longitude.toFixed(4).padStart(9)}°  →  ${SIGN_NAMES[asc.sign].padEnd(12)} (sign ${asc.sign})  |  ${ascNak.name} pada ${ascNak.pada}`
  );

  log.info('Ephemeris', '\n── Verification ───────────────────────────────────');
  const sunSign = getZodiacSign(positions.Sun);
  const pass = sunSign === 8;
  log.info('Ephemeris', `  Sun sign index : ${sunSign}  (expected 8 = Sagittarius)`);
  log.info('Ephemeris', `  Cross-check    : ${pass ? '✅ PASS — Sun is in Sagittarius' : '❌ FAIL — unexpected sign'}`);
  log.info('Ephemeris', '═══════════════════════════════════════════════════\n');

  return { positions, ascendant: asc, sunSignPass: pass };
}
