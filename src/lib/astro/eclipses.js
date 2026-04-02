import { getPlanetaryPositions } from './ephemeris.js';

/**
 * Angular distance helper:
 * Returns the shortest distance between two angles in degrees [0, 180].
 */
function angularDiff(a, b) {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

/**
 * findEclipses(lat, lon, fromDate, toDate)
 * Scan day by day to find eclipses.
 */
export function findEclipses(lat, lon, fromDate, toDate) {
  const eclipses = [];
  const current = new Date(fromDate);

  while (current <= toDate) {
    const pos = getPlanetaryPositions(current, lat, lon);
    const sunLon  = pos.Sun.longitude;
    const moonLon = pos.Moon.longitude;
    const rahuLon = pos.Rahu.longitude;
    const ketuLon = pos.Ketu.longitude;

    const sunMoonDiff = angularDiff(sunLon, moonLon);
    const moonRahu    = angularDiff(moonLon, rahuLon);
    const moonKetu    = angularDiff(moonLon, ketuLon);
    const nearNode    = Math.min(moonRahu, moonKetu);

    /* Solar eclipse: New Moon (diff < 15°) near node (< 18°) */
    if (sunMoonDiff < 15 && nearNode < 18) {
      const refined = refineEclipse(current, lat, lon, 'solar');
      if (refined) eclipses.push(refined);
    }

    /* Lunar eclipse: Full Moon (diff 165-195°) near node (< 12°) */
    if (sunMoonDiff > 165 && sunMoonDiff < 195 && nearNode < 12) {
      const refined = refineEclipse(current, lat, lon, 'lunar');
      if (refined) eclipses.push(refined);
    }

    current.setDate(current.getDate() + 1);
  }

  // Deduplicate (in case multiple days hit the same eclipse)
  const unique = [];
  const seen = new Set();
  for (const e of eclipses) {
    const key = `${e.type}-${e.date.getFullYear()}-${e.date.getMonth()}-${e.date.getDate()}`;
    if (!seen.has(key)) {
      unique.push(e);
      seen.add(key);
    }
  }

  return unique;
}

function refineEclipse(dayDate, lat, lon, type) {
  let minDiff = Infinity;
  let eclipseTime = null;

  for (let h = 0; h < 24; h++) {
    const t = new Date(dayDate);
    t.setUTCHours(h, 0, 0, 0);
    const pos = getPlanetaryPositions(t, lat, lon);
    const diff = type === 'solar'
      ? angularDiff(pos.Sun.longitude, pos.Moon.longitude)
      : Math.abs(angularDiff(pos.Sun.longitude, pos.Moon.longitude) - 180);

    if (diff < minDiff) { 
        minDiff = diff; 
        eclipseTime = new Date(t); 
    }
  }

  if (!eclipseTime || minDiff > 15) return null;

  const pos       = getPlanetaryPositions(eclipseTime, lat, lon);
  const rahuLon   = pos.Rahu.longitude;
  const affectedSign = Math.floor(pos.Moon.longitude / 30);

  return {
    type,
    date: eclipseTime,
    formattedDate: eclipseTime.toLocaleDateString('en-IN',
      { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
    moonSign: affectedSign,
    rahuSign: Math.floor(rahuLon / 30),
    magnitude: type === 'solar' ? 'Total/Annular' : 'Penumbral/Umbral',
    isSignificant: minDiff < 3, // very close = stronger eclipse
  };
}

export function findNextEclipses(lat, lon, count = 6) {
  const from = new Date();
  const to   = new Date();
  to.setFullYear(to.getFullYear() + 2);
  const all = findEclipses(lat, lon, from, to);
  return all.slice(0, count);
}

export function eclipseAffectsChart(eclipse, natalPositions) {
  /*
   * Checks if an eclipse affects the natal chart.
   * An eclipse is significant if it falls within 10°
   * of any natal planet or the natal Rahu/Ketu axis.
   */
  const eclipseLon = eclipse.date
    ? getPlanetaryPositions(eclipse.date, 0, 0).Moon.longitude
    : eclipse.moonSign * 30 + 15; // fallback to middle of sign

  const affected = [];
  Object.entries(natalPositions).forEach(([planet, data]) => {
    // data might be numeric or object with longitude
    const planetLon = typeof data === 'number' ? data : data.longitude;
    const diff = angularDiff(planetLon, eclipseLon);
    if (diff <= 10) {
      affected.push({ planet, orb: diff.toFixed(1) });
    }
  });

  return { eclipse, affected, isSignificant: affected.length > 0 };
}
