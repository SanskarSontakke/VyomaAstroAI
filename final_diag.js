import { getPlanetaryPositions, getAscendant } from './src/lib/astro/ephemeris.js';

const CHARTS = [
  { label: 'Mumbai 1990',  date: '1990-01-01T06:00:00', tz: 5.5, lat: 19.0760, lon: 72.8777 },
  { label: 'Delhi 1975',   date: '1975-06-15T14:30:00', tz: 5.5, lat: 28.6139, lon: 77.2090 },
  { label: 'Chennai 1985', date: '1985-11-20T22:15:00', tz: 5.5, lat: 13.0827, lon: 80.2707 },
  { label: 'Kolkata 1960', date: '1960-03-21T08:45:00', tz: 5.5, lat: 22.5726, lon: 88.3639 },
  { label: 'Pune 2000',    date: '2000-07-04T03:30:00', tz: 5.5, lat: 18.5204, lon: 73.8567 },
];

for (const chart of CHARTS) {
  const localDate = new Date(chart.date);
  const utcDate = new Date(localDate.getTime() - chart.tz * 3600 * 1000);
  const pos = getPlanetaryPositions(utcDate, chart.lat, chart.lon);
  const asc = getAscendant(utcDate, chart.lat, chart.lon);
  console.log(`--- ${chart.label} ---`);
  for (const [p, l] of Object.entries(pos)) {
    console.log(`${p}: ${l.toFixed(2)}`);
  }
  console.log(`Ascendant: ${asc.longitude.toFixed(2)}`);
}
