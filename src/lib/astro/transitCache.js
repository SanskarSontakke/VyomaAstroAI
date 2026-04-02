import { getPlanetaryPositions } from './ephemeris';
import { setCachedTransits, getCachedTransits } from '../chartCache';

export async function precomputeTransits(lat, lon) {
  /*
   * Pre-compute all planet positions at midnight UTC
   * for the next 365 days. Runs once, stores in IndexedDB.
   * Total: 365 × ~10ms = ~3.6s (run in Web Worker).
   */
  const key = `${lat}_${lon}`;
  const existing = await getCachedTransits(key);
  if (existing) return existing;

  const positions = [];
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  for (let day = 0; day < 365; day++) {
    const date = new Date(start.getTime() + day * 86400000);
    const pos  = getPlanetaryPositions(date, lat, lon);
    positions.push({
      dateISO: date.toISOString(),
      day,
      Sun:     pos.Sun.longitude,
      Moon:    pos.Moon.longitude,
      Mars:    pos.Mars.longitude,
      Mercury: pos.Mercury.longitude,
      Jupiter: pos.Jupiter.longitude,
      Venus:   pos.Venus.longitude,
      Saturn:  pos.Saturn.longitude,
      Rahu:    pos.Rahu.longitude,
      Ketu:    pos.Ketu.longitude,
    });
  }

  await setCachedTransits(key, positions);
  return positions;
}

export function interpolatePosition(transitCache, dateISO, planet) {
  /*
   * Linear interpolation between midnight positions
   * for smooth intra-day position estimates.
   */
  if (!transitCache || !transitCache.length) return null;
  
  const targetDate = new Date(dateISO);
  const targetMs = targetDate.getTime();
  
  const midnight = new Date(targetDate);
  midnight.setUTCHours(0, 0, 0, 0);
  
  const fraction = (targetMs - midnight.getTime()) / 86400000;
  
  const dateStr = midnight.toISOString().split('T')[0];
  const dayIdx = transitCache.findIndex(t => t.dateISO.startsWith(dateStr));
  
  if (dayIdx === -1) return null;

  const today    = transitCache[dayIdx][planet] || 0;
  const tomorrow = transitCache[dayIdx + 1]?.[planet] ?? today;
  
  let diff = tomorrow - today;
  /* Degree wrap-around handling */
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  
  return ((today + diff * fraction) + 360) % 360;
}
