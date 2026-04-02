const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASHA_YEARS = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
const TOTAL_YEARS = 120;
const NAK_SPAN = 360 / 27; // 13.3333°

/* Build the complete KP sub-lord table:
   For each Nakshatra (0-26), find which planet is the sub-lord
   at any given degree within that Nakshatra */

export function buildKPSubLordTable() {
  /* 
   * The 9 sub-lords repeat within each Nakshatra,
   * starting from the Nakshatra lord.
   * Sub-lord span within Nakshatra:
   *   subSpan[i] = (DASHA_YEARS[planet_i] / TOTAL_YEARS) * NAK_SPAN
   */
  const nakLords = [
    'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
    'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
    'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
  ]; // 27 Nakshatras, lords cycle through 9-planet sequence

  const table = [];

  for (let nak = 0; nak < 27; nak++) {
    const nakStart = nak * NAK_SPAN;
    const nakLord  = nakLords[nak];
    const lordIdx  = DASHA_ORDER.indexOf(nakLord);
    
    let subStart = 0; // degrees from start of Nakshatra
    const subs   = [];

    for (let i = 0; i < 9; i++) {
      const subPlanetIdx = (lordIdx + i) % 9;
      const subPlanet    = DASHA_ORDER[subPlanetIdx];
      const subSpan      = (DASHA_YEARS[subPlanet] / TOTAL_YEARS) * NAK_SPAN;

      subs.push({
        subLord:       subPlanet,
        startDegree:   nakStart + subStart,
        endDegree:     nakStart + subStart + subSpan,
        spanDegrees:   subSpan,
      });

      subStart += subSpan;
    }

    table.push({ nakshatra: nak, lord: nakLord, subs });
  }

  return table;
}

/* Cache the table — build once, reuse */
let _kpTable = null;
export function getKPTable() {
  if (!_kpTable) _kpTable = buildKPSubLordTable();
  return _kpTable;
}

export function getKPSubLord(longitude) {
  /* Find which sub-lord a given sidereal longitude falls under */
  const normLon = ((longitude % 360) + 360) % 360;
  const table   = getKPTable();
  
  for (const nak of table) {
    for (const sub of nak.subs) {
      if (normLon >= sub.startDegree && normLon < sub.endDegree) {
        return {
          nakshatra: nak.nakshatra,
          nakshatraLord: nak.lord,
          subLord: sub.subLord,
          longitude: normLon,
          degreeInSub: normLon - sub.startDegree,
          subSpan: sub.spanDegrees,
        };
      }
    }
  }
  
  /* Fallback — should never happen with valid longitude */
  return { nakshatra: 0, nakshatraLord: 'Ketu', subLord: 'Ketu', longitude: normLon };
}

export function getKPSignificators(positions, ascendantSign) {
  /*
   * In KP, each planet signifies:
   * 1. The house it occupies
   * 2. The houses of planets in its star (Nakshatra)
   * 3. The house it rules (dispositor)
   *
   * Returns for each planet: which houses it strongly signifies.
   */
  const RASHI_LORD = ['Mars','Venus','Mercury','Moon','Sun','Mercury',
                      'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'];

  /* House of each planet */
  const getHouse = (lon) => {
    const sign = Math.floor(((lon % 360) + 360) % 360 / 30);
    return ((sign - ascendantSign + 12) % 12) + 1;
  };

  const result = {};

  Object.entries(positions).forEach(([planet, data]) => {
    // Only process actual planets, not 'Ascendant' if it happens to be passed in
    if (typeof data !== 'object' || !data.longitude) return;

    const lon    = data.longitude;
    const kpData = getKPSubLord(lon);
    const occupiedHouse = getHouse(lon);

    /* Houses ruled by the star lord */
    const starLord = kpData.nakshatraLord;
    const subLord  = kpData.subLord;

    /* Houses ruled by this planet (as rashi lord) */
    const ruledHouses = [];
    for (let sign = 0; sign < 12; sign++) {
      if (RASHI_LORD[sign] === planet) {
        ruledHouses.push(((sign - ascendantSign + 12) % 12) + 1);
      }
    }

    result[planet] = {
      occupiedHouse,
      starLord,
      subLord,
      ruledHouses,
      kpLongitude: lon,
      /* Primary significators: houses occupied + ruled */
      primarySignificators: [...new Set([occupiedHouse, ...ruledHouses])].sort((a,b)=>a-b),
    };
  });

  return result;
}
