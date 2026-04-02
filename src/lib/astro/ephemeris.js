/**
 * Jyotish Ephemeris Engine — v2
 * Core planetary calculation engine using the astronomia npm package.
 * All math runs client-side — no external APIs.
 *
 * Note: Calculations are converted to Sidereal (Nirayana) using Lahiri Ayanamsa.
 *
 * FIX v2: Replaced naive helioToGeo (angle subtraction) with proper geocentric
 * vector conversion using VSOP87 3D Cartesian coordinates, then longitude from
 * atan2. This eliminates the ~20–90° errors seen in Mars, Jupiter, Saturn etc.
 */

import { apparentVSOP87 as solarApparentVSOP87 } from 'astronomia/solar';
import { position as moonPosition, trueNode as moonTrueNode } from 'astronomia/moonposition';
import { Planet } from 'astronomia/planetposition';
import { nutation as getPsiEpsilon, meanObliquity } from 'astronomia/nutation';
import { apparent as siderealApparent } from 'astronomia/sidereal';
import { J2000Century, JDEToJulianYear } from 'astronomia/base';
import { EclipticPrecessor } from 'astronomia/precess';
import { Ecliptic } from 'astronomia/coord';
import * as julian from 'astronomia/julian';
import { log } from '../logger.js';

// VSOP87 B-type data for heliocentric ecliptic coordinates
import vsop87Bearth   from 'astronomia/data/vsop87Bearth';
import vsop87Bmars    from 'astronomia/data/vsop87Bmars';
import vsop87Bmercury from 'astronomia/data/vsop87Bmercury';
import vsop87Bjupiter from 'astronomia/data/vsop87Bjupiter';
import vsop87Bvenus   from 'astronomia/data/vsop87Bvenus';
import vsop87Bsaturn  from 'astronomia/data/vsop87Bsaturn';

// ─── Constants ───────────────────────────────────────────────────────────────
const R2D = 180 / Math.PI;
const D2R = Math.PI / 180;

/**
 * Supported Ayanamsa systems.
 */
export const AYANAMSA_SYSTEMS = {
  LAHIRI:        'lahiri',
  KRISHNAMURTI:  'krishnamurti',
  RAMAN:         'raman',
  YUKTESHWAR:    'yukteshwar',
};

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha',
  'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
  'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// ─── VSOP87 Planet instances ──────────────────────────────────────────────────
// baseUtil removed - use named imports from astronomia/base

const marsP    = new Planet(vsop87Bmars);
const mercuryP = new Planet(vsop87Bmercury);
const jupiterP = new Planet(vsop87Bjupiter);
const venusP   = new Planet(vsop87Bvenus);
const saturnP  = new Planet(vsop87Bsaturn);
const earthP   = new Planet(vsop87Bearth);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize any angle (degrees) into [0, 360). */
function norm360(deg) {
  return ((deg % 360) + 360) % 360;
}

/** Convert a JS Date (assumed UTC) to a Julian Day Number (JD). */
function dateToJD(dateObj) {
  return julian.DateToJD(dateObj);
}

/**
 * Calculate Lahiri Ayanamsa for a given Julian Day.
 * Uses the IAU/Lahiri formula cited in the Astronomical Ephemeris.
 * Reference epoch: JD 2415020.0 (J1900.0), precession 50.2388475"/yr
 * Starting value at J1900: 22°27'52.54" = 22.4646°
 */
export function getAyanamsa(jd, system = AYANAMSA_SYSTEMS.LAHIRI) {
  const T = J2000Century(jd);
  switch (system) {
    case AYANAMSA_SYSTEMS.KRISHNAMURTI:
      // KP Ayanamsa: offset from Lahiri by ~6 arcminutes (0.1°)
      return norm360(23.9570972 + (1.396042 + 0.000308 * T) * T);
    case AYANAMSA_SYSTEMS.RAMAN:
      // Raman Ayanamsa: uses 22.46° at J1900
      return norm360(22.46 + 0.005011 * (jd - 2415020.0) / 365.25);
    case AYANAMSA_SYSTEMS.YUKTESHWAR:
      // Sri Yukteshwar: 21.50° at 1893.0
      return norm360(21.5 + 0.005011 * (jd - 2411929.0) / 365.25);
    case AYANAMSA_SYSTEMS.LAHIRI:
    default:
      // Official Chitra Paksha (Lahiri) Ayanamsa: 23° 51' 25.55" at J2000.0
      return norm360(23.8570972 + (1.396042 + 0.000308 * T) * T);
  }
}

/**
 * Get geocentric apparent longitude for a planet with light-time correction.
 * This is the standard high-precision workflow.
 */
function helioToGeo(planetInst, jde) {
  // 1. Earth's position at time t
  const e = earthP.position(jde);
  const eX = e.range * Math.cos(e.lat) * Math.cos(e.lon);
  const eY = e.range * Math.cos(e.lat) * Math.sin(e.lon);
  const eZ = e.range * Math.sin(e.lat);

  // 2. Iterative light-time correction
  let t_tau = jde;
  let gX = 0, gY = 0, gZ = 0;
  
  for (let i = 0; i < 2; i++) {
    const p = planetInst.position(t_tau);
    const pX = p.range * Math.cos(p.lat) * Math.cos(p.lon);
    const pY = p.range * Math.cos(p.lat) * Math.sin(p.lon);
    const pZ = p.range * Math.sin(p.lat);

    gX = pX - eX;
    gY = pY - eY;
    gZ = pZ - eZ;

    const dist = Math.sqrt(gX*gX + gY*gY + gZ*gZ);
    const tau = 0.0057755183 * dist; // Light-time in days
    t_tau = jde - tau;
  }

  // 3. Convert geocentric vector to longitude in J2000 frame
  const geoLonJ2000 = Math.atan2(gY, gX);
  const geoLatJ2000 = Math.atan2(gZ, Math.sqrt(gX*gX + gY*gY));

  // 4. Precess from J2000 (Julian Year 2000.0) to frame of date (Julian Year)
  const yrTo = JDEToJulianYear(jde);
  const prec = new EclipticPrecessor(2000.0, yrTo);
  const eclJ2000 = new Ecliptic(geoLonJ2000, geoLatJ2000);
  const eclDate = prec.precess(eclJ2000);

  // 5. Apply Nutation (dPsi)
  const [dPsi] = getPsiEpsilon(jde);
  return norm360((eclDate.lon + dPsi) * R2D);
}

/**
 * Get apparent Sun longitude using astronomia's optimized solar module.
 */
function getSunApparent(jde) {
  // Use full VSOP87 apparent position for the Sun
  const { lon } = solarApparentVSOP87(earthP, jde);
  return norm360(lon * R2D);
}

/**
 * Rahu (True Node) longitude in degrees.
 * Transitioned from Mean Node to True Node for high precision.
 */
function getRahuLongitude(jd) {
  // moonTrueNode returns radians
  return norm360(moonTrueNode(jd) * R2D);
}

// ─── Exported Functions ───────────────────────────────────────────────────────

/**
 * getPlanetaryPositions(dateObj, lat, lon)
 * Returns ecliptic SIDEREAL longitude (0–360°) for each graha.
 * The returned object maps planet name → longitude in degrees.
 */
/**
 * list of combustion orbs (standard Jyotish)
 */
const COMBUST_ORBS = {
  Moon: 12,
  Mars: 17,
  Mercury: 14,
  Mercury_Retro: 12,
  Jupiter: 11,
  Venus: 10,
  Venus_Retro: 8,
  Saturn: 15
};

/**
 * isCombust(planet, planetLon, sunLon, isRetrograde)
 * Returns true if the planet is within its combustion orb from the Sun.
 */
export function isCombust(planet, planetLon, sunLon, isRetrograde = false) {
  if (['Sun', 'Rahu', 'Ketu'].includes(planet)) return false;
  
  let orb = COMBUST_ORBS[planet];
  if (planet === 'Mercury' && isRetrograde) orb = COMBUST_ORBS.Mercury_Retro;
  if (planet === 'Venus' && isRetrograde) orb = COMBUST_ORBS.Venus_Retro;
  
  if (!orb) return false;
  
  const diff = Math.min(
    Math.abs(planetLon - sunLon),
    360 - Math.abs(planetLon - sunLon)
  );
  return diff <= orb;
}

/**
 * getPlanetaryPositions(dateObj, lat, lon)
 * Returns ecliptic SIDEREAL positions for each graha.
 * Returns map of planet name -> { longitude, retrograde, combust }.
 */
export function getPlanetaryPositions(dateObj, lat, lon) {
  const jd       = dateToJD(dateObj);
  const jdNext   = jd + 1.0; // 1-day step for stable retrograde detection
  const ayanamsa = getAyanamsa(jd);

  // 1. Calculate Apparent Tropical Longitudes
  const getTropicalLons = (j) => {
    const [dPsi] = getPsiEpsilon(j);
    return {
      Sun:     getSunApparent(j),
      Moon:    norm360((moonPosition(j).lon + dPsi) * R2D),
      Mars:    helioToGeo(marsP,    j),
      Mercury: helioToGeo(mercuryP, j),
      Jupiter: helioToGeo(jupiterP, j),
      Venus:   helioToGeo(venusP,   j),
      Saturn:  helioToGeo(saturnP,  j),
      Rahu:    norm360((moonTrueNode(j) + dPsi) * R2D),
    };
  };

  const lonsTropical      = getTropicalLons(jd);
  const lonsTropicalNext  = getTropicalLons(jdNext);
  const ayNext            = getAyanamsa(jdNext);

  const result = {};
  
  Object.keys(lonsTropical).forEach(p => {
    // Convert to Sidereal
    const sidLon = norm360(lonsTropical[p] - ayanamsa);
    const sidLonNext = norm360(lonsTropicalNext[p] - ayNext);

    // Detect retrograde based on TROPICAL motion (precession-independent)
    let motionTrop = lonsTropicalNext[p] - lonsTropical[p];
    if (motionTrop > 180) motionTrop -= 360;
    if (motionTrop < -180) motionTrop += 360;
    
    const isRetro = motionTrop < 0;
    const sunSidLon = norm360(lonsTropical.Sun - ayanamsa);
    const combust = isCombust(p, sidLon, sunSidLon, isRetro);
    
    result[p] = {
      longitude: sidLon,
      retrograde: isRetro,
      combust: combust,
      sign: getZodiacSign(sidLon)
    };
  });

  // Ketu is always opposite Rahu
  const ketuLon = norm360(result.Rahu.longitude + 180);
  result.Ketu = {
    longitude: ketuLon,
    retrograde: true, // Rahu/Ketu always retrograde in Jyotish
    combust: false,
    sign: getZodiacSign(ketuLon)
  };

  // Rahu should also be explicitly retrograde
  result.Rahu.retrograde = true;

  return result;
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
 * Returns { nakshatra (index 0–26), pada (1–4), name }
 */
export function getNakshatra(longitude) {
  const deg          = norm360(longitude);
  const NAKSHATRA_SPAN = 360 / 27;
  const PADA_SPAN      = NAKSHATRA_SPAN / 4;

  const nakshatraIndex  = Math.floor(deg / NAKSHATRA_SPAN);
  const posWithinNak    = deg % NAKSHATRA_SPAN;
  const pada            = Math.floor(posWithinNak / PADA_SPAN) + 1;

  return {
    nakshatra: nakshatraIndex,
    pada:      Math.min(pada, 4),
    name:      NAKSHATRA_NAMES[nakshatraIndex],
  };
}

/**
 * getAscendant(dateObj, lat, lon)
 * Returns sidereal Ascendant { longitude, sign }.
 *
 * Method:
 *  1. Compute Apparent Greenwich Sidereal Time (GAST) in hours (from astronomia/sidereal).
 *  2. Convert to degrees; add observer longitude → LST in degrees.
 *  3. Use obliquity + standard formula to derive ecliptic Ascendant.
 *  4. Subtract Ayanamsa.
 */
export function getAscendant(dateObj, lat, lon) {
  const jd       = dateToJD(dateObj);
  const ayanamsa = getAyanamsa(jd);

  // GAST from astronomia returns seconds of time (apparent)
  const gastSeconds = siderealApparent(jd);
  const gastDeg     = norm360((gastSeconds / 240));          // (seconds/3600) * 15 = seconds/240
  const lst         = norm360(gastDeg + lon);                // Local Sidereal Time in degrees
  const lstRad    = lst * D2R;

  // Obliquity (mean + Δε from nutation)
  const [, deltaEps] = getPsiEpsilon(jd);
  const eps0         = meanObliquity(jd);
  const eps          = eps0 + deltaEps;                // true obliquity (radians)

  const latR = lat * D2R;

  // Standard ascendant formula (Meeus ch. 14, p. 99)
  // tan(A) = -cos(H) / (sin(H)cos(e) + tan(L)sin(e))
  const ascRad    = Math.atan2(
    -Math.cos(lstRad),
    (Math.sin(lstRad) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps))
  );
  const ascTropical  = norm360(ascRad * R2D);
  const ascSidereal  = norm360(ascTropical - ayanamsa);

  return {
    longitude: ascSidereal,
    sign:      getZodiacSign(ascSidereal),
  };
}

// ─── Diagnostic helper (browser console / dev use only) ──────────────────────

export function testEphemeris() {
  const SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  const testDate = new Date('1989-12-31T19:00:00.000Z'); // Mumbai 1990-01-01 06:00 IST
  const lat = 19.076;
  const lon = 72.877;

  log.info('Ephemeris', '═══════════════════════════════════════════════════');
  log.info('Ephemeris', ' Jyotish Sidereal Ephemeris v2 — Test');
  log.info('Ephemeris', ' Date : 01 Jan 1990, 06:00 IST (1989-12-31T19:00Z)');
  log.info('Ephemeris', ` Place: Mumbai  Lat=${lat}°N  Lon=${lon}°E`);
  log.info('Ephemeris', '═══════════════════════════════════════════════════');

  const jd = dateToJD(testDate);
  log.info('Ephemeris', ` Ayanamsa: ${getAyanamsa(jd).toFixed(4)}°`);

  const positions = getPlanetaryPositions(testDate, lat, lon);
  log.info('Ephemeris', '\n── Sidereal Planetary Positions ───────────────────');
  for (const [planet, l] of Object.entries(positions)) {
    const sign = getZodiacSign(l);
    const nak  = getNakshatra(l);
    log.info('Ephemeris',
      `  ${planet.padEnd(8)} : ${l.toFixed(4).padStart(9)}°  →  ${SIGN_NAMES[sign].padEnd(12)} (sign ${sign})  |  ${nak.name} pada ${nak.pada}`
    );
  }

  log.info('Ephemeris', '\n── Sidereal Ascendant (Lagna) ─────────────────────');
  const asc    = getAscendant(testDate, lat, lon);
  const ascNak = getNakshatra(asc.longitude);
  log.info('Ephemeris',
    `  Lagna    : ${asc.longitude.toFixed(4).padStart(9)}°  →  ${SIGN_NAMES[asc.sign].padEnd(12)} (sign ${asc.sign})  |  ${ascNak.name} pada ${ascNak.pada}`
  );

  log.info('Ephemeris', '═══════════════════════════════════════════════════\n');

  return { positions, ascendant: asc };
}
