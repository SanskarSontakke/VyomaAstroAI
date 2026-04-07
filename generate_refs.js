import fs from 'fs';
import { getPlanetaryPositions, getAscendant } from './src/lib/astro/ephemeris.js';
import { getMahaDasha } from './src/lib/astro/dasha.js';

const data = [];
const years = [1920, 1970, 2000, 2024, 2050];
const months = [2, 5, 8, 11];
const days = [5, 15, 25];
const locations = [
  { lat: 19.0760, lon: 72.8777, tz: 5.5, name: 'Mumbai' },
  { lat: 40.7128, lon: -74.0060, tz: -5, name: 'New York' },
  { lat: -33.8688, lon: 151.2093, tz: 10, name: 'Sydney' },
  { lat: 51.5074, lon: -0.1278, tz: 0, name: 'London' },
  { lat: 35.6895, lon: 139.6917, tz: 9, name: 'Tokyo' },
  { lat: -90.0, lon: 0.0, tz: 0, name: 'South Pole' }, // Edge case
  { lat: 90.0, lon: 0.0, tz: 0, name: 'North Pole' }, // Edge case
  { lat: 0.0, lon: 0.0, tz: 0, name: 'Equator/Prime' }, // Edge case
];

let idCounter = 1;
for (const y of years) {
  for (const m of months) {
    for (const d of days) {
      for (const loc of locations) {
        const dob_date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dob_time = "12:00";
        const dateObj = new Date(`${dob_date}T${dob_time}:00Z`); // Simplified UTC
        
        try {
          const positions = getPlanetaryPositions(dateObj, loc.lat, loc.lon, 'lahiri');
          const ascendant = getAscendant(dateObj, loc.lat, loc.lon, 'lahiri');
          const dashas = getMahaDasha(positions.Moon.longitude, dateObj);
          
          data.push({
            id: `TC_GEN_${idCounter++}`,
            description: `${loc.name} ${dob_date}`,
            input: {
              dob_date,
              dob_time,
              latitude: loc.lat,
              longitude: loc.lon,
              timezone_offset: loc.tz,
              ayanamsaSystem: "lahiri"
            },
            expected: {
              ascendantSign: ascendant.sign,
              moonSign: positions.Moon.sign,
              mahaDasha: dashas[0].planet,
              positions: {
                Sun: { sign: positions.Sun.sign, longitude: positions.Sun.longitude },
                Moon: { sign: positions.Moon.sign, longitude: positions.Moon.longitude }
              }
            }
          });
        } catch {
          // ignore errors for extreme edge cases if engine doesn't support them
        }
      }
    }
  }
}

fs.writeFileSync('src/lib/astro/__tests__/referenceData.json', JSON.stringify(data, null, 2));
console.log(`Generated ${data.length} test cases.`);
