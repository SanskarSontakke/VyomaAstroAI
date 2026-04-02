import { fromZonedTime, getTimezoneOffset } from 'date-fns-tz';

/* 
 * Map from common city names / countries to IANA timezone strings.
 * Used as fallback when Nominatim doesn't return a timezone.
 */
export const INDIA_TIMEZONE = 'Asia/Kolkata'; // IST, UTC+5:30

/*
 * Convert a local birth time string to a UTC Date object.
 *
 * @param dobDate    string 'YYYY-MM-DD'
 * @param dobTime    string 'HH:MM'
 * @param ianaZone   string e.g. 'Asia/Kolkata'
 * @returns          Date object in UTC
 */
export function parseBirthDateUTC(dobDate, dobTime, ianaZone) {
  let timeStr = dobTime;
  if (timeStr.split(':').length === 2) {
    timeStr += ':00';
  }
  const localStr = `${dobDate}T${timeStr}`;

  /* fromZonedTime converts local time in the given zone to UTC */
  const utcDate = fromZonedTime(localStr, ianaZone);

  if (isNaN(utcDate.getTime())) {
    throw new Error(
      `Invalid birth date/time: ${localStr} in timezone ${ianaZone}`
    );
  }

  return utcDate;
}

/*
 * Get UTC offset in hours for a given IANA zone at a specific moment.
 * Handles DST automatically.
 */
export function getUTCOffset(ianaZone, atDate = new Date()) {
  const offsetMs = getTimezoneOffset(ianaZone, atDate);
  return offsetMs / (1000 * 60 * 60);
}

/*
 * Suggest IANA timezone from country/city name (fallback list).
 * Nominatim should provide this but doesn't always.
 */
export const TIMEZONE_SUGGESTIONS = {
  india:        'Asia/Kolkata',
  pakistan:     'Asia/Karachi',
  bangladesh:   'Asia/Dhaka',
  'sri lanka':  'Asia/Colombo',
  nepal:        'Asia/Kathmandu',
  uk:           'Europe/London',
  london:       'Europe/London',
  usa:          'America/New_York',
  'new york':   'America/New_York',
  'los angeles':'America/Los_Angeles',
  chicago:      'America/Chicago',
  australia:    'Australia/Sydney',
  sydney:       'Australia/Sydney',
  uae:          'Asia/Dubai',
  dubai:        'Asia/Dubai',
  singapore:    'Asia/Singapore',
  germany:      'Europe/Berlin',
  berlin:       'Europe/Berlin',
  france:       'Europe/Paris',
  paris:        'Europe/Paris',
};

export function suggestTimezone(locationName) {
  const lower = (locationName || '').toLowerCase();
  for (const [key, tz] of Object.entries(TIMEZONE_SUGGESTIONS)) {
    if (lower.includes(key)) return tz;
  }
  return INDIA_TIMEZONE; // default
}
