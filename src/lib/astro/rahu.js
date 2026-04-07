import * as julian from 'astronomia/julian';
import * as sunrise from 'astronomia/sunrise';
import { log } from '../logger.js';

/**
 * Rahu Kaal & Auspicious Timings Calculator
 */

/**
 * Format a Date object to "HH:MM AM/PM"
 */
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * getSunriseSunset(date, lat, lon)
 * @param {Date} date - The date to calculate for
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude (Positive East, Negative West for standard math, 
 *                       but astronomia uses Positive West. We will convert.)
 * @returns {Object} { sunrise: Date, sunset: Date }
 */
export function getSunriseSunset(date, lat, lon) {
  // astronomia uses Positive West for longitude. 
  // Most APIs (like Nominatim) use Positive East.
  // We substract lon from 360 or just negate it. 
  // Let's negate it: Mumbai 72.87E -> -72.87 for astronomia.
  const astroLon = -lon;
  
  const cal = new julian.Calendar(date);
  const s = new sunrise.Sunrise(cal, lat, astroLon);
  
  const riseCal = s.rise();
  const setCal = s.set();
  
  // Convert Julian Calendar back to JS Date
  // riseCal is a julian.CalendarGregorian or similar
  // We can get JDE and convert to Date
  const sunriseDate = julian.JDToDate(riseCal.toJD());
  const sunsetDate = julian.JDToDate(setCal.toJD());
  
  return { sunrise: sunriseDate, sunset: sunsetDate };
}

/**
 * Calculate segments for Rahu Kaal, Yamaghanda, etc.
 */
function getTimingWindow(date, lat, lon, slotMap) {
  const { sunrise, sunset } = getSunriseSunset(date, lat, lon);
  const daytimeMs = sunset.getTime() - sunrise.getTime();
  const segmentMs = daytimeMs / 8;
  
  const weekday = date.getDay(); // 0 = Sunday
  const slotIndex = slotMap[weekday] - 1; // 1-based to 0-based
  
  const start = new Date(sunrise.getTime() + (slotIndex * segmentMs));
  const end = new Date(start.getTime() + segmentMs);
  
  return {
    start,
    end,
    formattedStart: formatTime(start),
    formattedEnd: formatTime(end)
  };
}

export function getRahuKaal(date, lat, lon) {
  // Sunday:8, Monday:2, Tuesday:7, Wednesday:5, Thursday:6, Friday:4, Saturday:3
  const mapping = [8, 2, 7, 5, 6, 4, 3];
  return getTimingWindow(date, lat, lon, mapping);
}

export function getYamaghanda(date, lat, lon) {
  // Sunday:4, Monday:6, Tuesday:5, Wednesday:3, Thursday:1, Friday:7, Saturday:2
  const mapping = [4, 6, 5, 3, 1, 7, 2];
  return getTimingWindow(date, lat, lon, mapping);
}

export function getGuliKaal(date, lat, lon) {
  // Sunday:6, Monday:4, Tuesday:2, Wednesday:7, Thursday:5, Friday:3, Saturday:1
  const mapping = [6, 4, 2, 7, 5, 3, 1];
  return getTimingWindow(date, lat, lon, mapping);
}

/**
 * Abhijit Muhurta: 24-minute window centered on solar noon
 */
export function getAbhijitMuhurta(date, lat, lon) {
  const { sunrise, sunset } = getSunriseSunset(date, lat, lon);
  const solarNoonMs = (sunrise.getTime() + sunset.getTime()) / 2;
  
  const start = new Date(solarNoonMs - (12 * 60 * 1000)); // -12 mins
  const end = new Date(solarNoonMs + (12 * 60 * 1000));   // +12 mins
  
  return {
    start,
    end,
    formattedStart: formatTime(start),
    formattedEnd: formatTime(end)
  };
}

/**
 * Test function for Mumbai today
 */
export function testRahu() {
  const today = new Date();
  const lat = 19.076;
  const lon = 72.877;
  
  log.info('Timings', '--- Rahu Kaal & Daily Timings (Mumbai) ---');
  log.info('Timings', `Current Time: ${today.toString()}`);
  
  const sun = getSunriseSunset(today, lat, lon);
  log.info('Timings', `Sunrise: ${formatTime(sun.sunrise)}`);
  log.info('Timings', `Sunset:  ${formatTime(sun.sunset)}`);
  
  const rahu = getRahuKaal(today, lat, lon);
  log.info('Timings', `Rahu Kaal:   ${rahu.formattedStart} - ${rahu.formattedEnd}`);
  
  const yama = getYamaghanda(today, lat, lon);
  log.info('Timings', `Yamaghanda:  ${yama.formattedStart} - ${yama.formattedEnd}`);
  
  const guli = getGuliKaal(today, lat, lon);
  log.info('Timings', `Guli Kaal:   ${guli.formattedStart} - ${guli.formattedEnd}`);
  
  const abhi = getAbhijitMuhurta(today, lat, lon);
  log.info('Timings', `Abhijit:     ${abhi.formattedStart} - ${abhi.formattedEnd}`);
}
