import { getZodiacSign, getNakshatra } from './ephemeris';

const RASHI_LORD = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
];

const DEBILITATION_SIGNS = {
  Sun: 6,      // Libra
  Moon: 7,     // Scorpio
  Mars: 3,     // Cancer
  Mercury: 11, // Pisces
  Jupiter: 9,  // Capricorn
  Venus: 5,    // Virgo
  Saturn: 0    // Aries
};

const EXALTATION_SIGNS = {
  Sun: 0,      // Aries
  Moon: 1,     // Taurus
  Mars: 9,     // Capricorn
  Mercury: 5,  // Virgo
  Jupiter: 3,  // Cancer
  Venus: 11,   // Pisces
  Saturn: 6    // Libra
};

function getHouse(planetSign, ascendantSign) {
  return (planetSign - ascendantSign + 12) % 12 + 1;
}

function getHouseLord(houseNum, ascendantSign) {
  const signIdx = (ascendantSign + houseNum - 1) % 12;
  return RASHI_LORD[signIdx];
}

export function detectYogas(positions, ascendantSign) {
  const yogas = [];
  const planetSigns = {};
  const planetHouses = {};

  Object.entries(positions).forEach(([name, data]) => {
    const lon = typeof data === 'number' ? data : data.longitude;
    const sign = getZodiacSign(lon);
    planetSigns[name] = sign;
    planetHouses[name] = getHouse(sign, ascendantSign);
  });

  // Helper for conjunction
  const isConjunct = (p1, p2) => planetSigns[p1] === planetSigns[p2];

  // 1. GAJAKESARI
  const jupScoreFromMoon = (planetSigns.Jupiter - planetSigns.Moon + 12) % 12 + 1;
  const gajakesariPresent = [1, 4, 7, 10].includes(jupScoreFromMoon);
  if (gajakesariPresent) {
    yogas.push({
      name: 'Gajakesari Yoga',
      present: true,
      strength: [1, 4, 7, 10].includes(planetHouses.Jupiter) ? 'Strong' : 'Moderate',
      description: 'Jupiter in angular position from Moon. Bestows wisdom, fame, and good fortune.'
    });
  }

  // 2. BUDHADITYA
  if (isConjunct('Sun', 'Mercury')) {
    const mercCombust = positions.Mercury.combust;
    yogas.push({
      name: 'Budhaditya Yoga',
      present: true,
      strength: [1, 4, 7, 10, 5, 9].includes(planetHouses.Sun) ? 'Strong' : 'Moderate',
      combustCancelled: mercCombust,
      description: mercCombust 
        ? 'Sun and Mercury conjunct, but Mercury is combust. Sharpeness is present but intellectual focus is strained.'
        : 'Sun and Mercury conjunct. Sharp intellect, eloquence, and analytical ability.'
    });
  }

  // 3. CHANDRA-MANGAL
  const moonMarsAngle = Math.abs(planetSigns.Moon - planetSigns.Mars);
  if (isConjunct('Moon', 'Mars') || moonMarsAngle === 6) {
    yogas.push({
      name: 'Chandra-Mangal Yoga',
      present: true,
      strength: 'Moderate',
      description: 'Moon-Mars combination. Strong will, emotional courage, and financial drive.'
    });
  }

  // 4. NEECHABHANGA RAJ YOGA
  Object.entries(DEBILITATION_SIGNS).forEach(([planet, sign]) => {
    if (planetSigns[planet] === sign) {
        // Debilitation cancelled if dispositor is in kendra
        const dispositor = RASHI_LORD[sign];
        const exaltingPlanet = Object.keys(EXALTATION_SIGNS).find(p => EXALTATION_SIGNS[p] === sign);

        if ([1,4,7,10].includes(planetHouses[dispositor]) || 
            (exaltingPlanet && [1,4,7,10].includes(planetHouses[exaltingPlanet]))) {
            yogas.push({
                name: `Neechabhanga Raj Yoga (${planet})`,
                present: true,
                strength: 'Strong',
                description: 'Debilitation cancelled. Apparent weakness transforms into hidden strength.'
            });
        }
    }
  });

  // 5. VIPARITA RAJ YOGA
  const lordsInDusthana = [];
  [6, 8, 12].forEach(h => {
    const lord = getHouseLord(h, ascendantSign);
    if ([6, 8, 12].includes(planetHouses[lord])) lordsInDusthana.push(lord);
  });
  if (lordsInDusthana.length > 0) {
    yogas.push({
      name: 'Viparita Raj Yoga',
      present: true,
      strength: lordsInDusthana.length > 1 ? 'Strong' : 'Moderate',
      description: 'Dusthana lords exchanged. Obstacles turn to opportunities through adversity.'
    });
  }

  // 6. DHANA YOGA
  const connectingWealth = isConjunct(getHouseLord(2, ascendantSign), getHouseLord(1, ascendantSign)) ||
                        isConjunct(getHouseLord(2, ascendantSign), getHouseLord(5, ascendantSign)) ||
                        isConjunct(getHouseLord(2, ascendantSign), getHouseLord(9, ascendantSign)) ||
                        isConjunct(getHouseLord(11, ascendantSign), getHouseLord(1, ascendantSign)) ||
                        isConjunct(getHouseLord(11, ascendantSign), getHouseLord(5, ascendantSign)) ||
                        isConjunct(getHouseLord(11, ascendantSign), getHouseLord(9, ascendantSign));
  if (connectingWealth) {
    yogas.push({
      name: 'Dhana Yoga',
      present: true,
      strength: 'Moderate',
      description: 'Wealth house lords connected. Strong potential for financial accumulation.'
    });
  }

  // 7. RAJA YOGA
  let rajPairs = 0;
  [1, 4, 7, 10].forEach(k => {
    [1, 5, 9].forEach(t => {
      if (isConjunct(getHouseLord(k, ascendantSign), getHouseLord(t, ascendantSign))) rajPairs++;
    });
  });
  if (rajPairs > 0) {
    yogas.push({
      name: 'Raja Yoga',
      present: true,
      strength: rajPairs >= 2 ? 'Strong' : 'Moderate',
      description: 'Kendra-trikona connection. Authority, status, and career success indicated.'
    });
  }

  // 8. KAAL SARPA
  const sortedSigns = Object.values(planetSigns).sort((a,b) => a - b);
  const rahuSign = planetSigns.Rahu;
  const ketuSign = planetSigns.Ketu;
  const arc1 = (ketuSign - rahuSign + 12) % 12;
  const allInArc = Object.keys(planetSigns)
    .filter(p => !['Rahu', 'Ketu'].includes(p))
    .every(p => {
        const diff = (planetSigns[p] - rahuSign + 12) % 12;
        return diff <= arc1;
    });
  if (allInArc) {
    yogas.push({
      name: 'Kaal Sarpa Yoga',
      present: true,
      strength: 'Partial',
      description: 'All planets hemmed between nodal axis. Karmic intensity, challenges followed by breakthroughs.'
    });
  }

  // 9. HAMSA
  if ((planetSigns.Jupiter === 8 || planetSigns.Jupiter === 11 || planetSigns.Jupiter === 3) && [1, 4, 7, 10].includes(planetHouses.Jupiter)) {
    yogas.push({
      name: 'Hamsa Yoga',
      present: true,
      strength: 'Strong',
      description: 'Jupiter in power in an angular house. Wisdom, righteousness, and prosperity.'
    });
  }

  // 10. MALAVYA
  if ((planetSigns.Venus === 1 || planetSigns.Venus === 6 || planetSigns.Venus === 11) && [1, 4, 7, 10].includes(planetHouses.Venus)) {
    yogas.push({
      name: 'Malavya Yoga',
      present: true,
      strength: 'Strong',
      description: 'Venus in strength in angular house. Luxury, beauty, and romantic fulfillment.'
    });
  }

  // 11. RUCHAKA
  if ((planetSigns.Mars === 0 || planetSigns.Mars === 7 || planetSigns.Mars === 9) && [1, 4, 7, 10].includes(planetHouses.Mars)) {
    yogas.push({
      name: 'Ruchaka Yoga',
      present: true,
      strength: 'Strong',
      description: 'Mars exalted or own sign in angle. Courage, authority, and martial success.'
    });
  }

  // 12. SASA
  if ((planetSigns.Saturn === 9 || planetSigns.Saturn === 10 || planetSigns.Saturn === 6) && [1, 4, 7, 10].includes(planetHouses.Saturn)) {
    yogas.push({
      name: 'Sasa Yoga',
      present: true,
      strength: 'Strong',
      description: 'Saturn empowered in angle. Discipline, longevity, and late-life success.'
    });
  }

  return yogas.sort((a, b) => {
    const priority = (name) => {
      if (name.includes('Raja Yoga')) return 1;
      if (name.includes('Dhana Yoga')) return 2;
      if (['Hamsa', 'Malavya', 'Ruchaka', 'Sasa'].some(m => name.includes(m))) return 3;
      return 4;
    };
    return priority(a.name) - priority(b.name);
  });
}
