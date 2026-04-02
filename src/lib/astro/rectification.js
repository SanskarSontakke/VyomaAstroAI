import { parseBirthDateUTC } from '../timezones';
import { getMahaDasha, getCurrentDasha } from './dasha';
import { getPlanetaryPositions, getAscendant } from './ephemeris';

const LIFE_EVENT_TYPES = [
  { key: 'marriage',   label: 'Marriage / partnership', dashaIndicators: ['Venus','Jupiter','Moon'] },
  { key: 'career',     label: 'Major career change',    dashaIndicators: ['Sun','Saturn','Mars','Jupiter','Mercury'] },
  { key: 'foreign',    label: 'Foreign travel/residence',dashaIndicators: ['Rahu','Jupiter','Moon'] },
  { key: 'loss',       label: 'Major loss / illness',   dashaIndicators: ['Saturn','Rahu','Ketu','Mars'] },
  { key: 'education',  label: 'Higher education',       dashaIndicators: ['Mercury','Jupiter'] },
  { key: 'child',      label: 'Birth of child',         dashaIndicators: ['Jupiter','Moon','Venus'] },
  { key: 'property',   label: 'Property / house purchase',dashaIndicators: ['Mars','Moon','Saturn'] },
];

export function getRectificationQuestions() {
  return LIFE_EVENT_TYPES.map(e => ({
    key: e.key,
    label: e.label,
    placeholder: 'Year (e.g. 2015)',
  }));
}

export function rectifyBirthTime(profile, lifeEvents, uncertaintyMinutes = 60) {
  /*
   * lifeEvents: [{ type: 'marriage', year: 2015 }, ...]
   * uncertaintyMinutes: how wide a window to scan (default ±30min = 60min total)
   * Returns ranked list of candidate birth times
   */
  const [h, m] = profile.dob_time.split(':').map(Number);
  const startMinutes = h * 60 + m - uncertaintyMinutes / 2;
  const candidates = [];

  /* Scan every 4 minutes */
  for (let deltaMin = 0; deltaMin <= uncertaintyMinutes; deltaMin += 4) {
    const totalMin = startMinutes + deltaMin;
    const hh = Math.floor(totalMin / 60) % 24;
    const mm  = Math.floor(totalMin % 60);
    const candidateTime = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;

    try {
      const birthUTC = parseBirthDateUTC(
        profile.dob_date, candidateTime, profile.iana_timezone || 'Asia/Kolkata'
      );
      const positions  = getPlanetaryPositions(birthUTC, profile.latitude, profile.longitude);
      const ascendant  = getAscendant(birthUTC, profile.latitude, profile.longitude);
      const moonLon    = positions.Moon.longitude;
      const dashaArray = getMahaDasha(positions.Moon, birthUTC);

      /* Score: count life events matching expected Dasha indicators */
      let score = 0;
      const matches = [];

      lifeEvents.forEach(event => {
        if (!event.year) return;
        const yearInt = parseInt(event.year);
        if (isNaN(yearInt)) return;
        
        const eventDate = new Date(`${yearInt}-06-15`); // mid-year approx
        const activeDasha = getCurrentDasha(dashaArray, eventDate);
        if (!activeDasha) return;

        const eventType = LIFE_EVENT_TYPES.find(e => e.key === event.type);
        if (!eventType) return;

        const mahaMatches = eventType.dashaIndicators
          .includes(activeDasha.maha.planet);
        const antarMatches = activeDasha.antar &&
          eventType.dashaIndicators.includes(activeDasha.antar.planet);

        if (mahaMatches) { score += 2; matches.push(`${event.type}: Maha ${activeDasha.maha.planet}`); }
        if (antarMatches) { score += 1; matches.push(`${event.type}: Antar ${activeDasha.antar.planet}`); }
      });

      candidates.push({
        time: candidateTime,
        ascendantSign: ascendant.sign,
        ascendantLongitude: ascendant.longitude,
        score,
        matches,
        moonLongitude: moonLon,
      });
    } catch(e) { 
      // skip invalid times
      console.warn(`Invalid time skipped: ${candidateTime}`, e);
    }
  }

  /* Sort by score descending */
  candidates.sort((a, b) => b.score - a.score);

  const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
    'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  return {
    topCandidates: candidates.slice(0, 5),
    bestTime: candidates[0]?.time || profile.dob_time,
    bestAscendant: candidates[0]
      ? SIGN_NAMES[candidates[0].ascendantSign]
      : 'Unknown',
    totalScanned: candidates.length,
  };
}
