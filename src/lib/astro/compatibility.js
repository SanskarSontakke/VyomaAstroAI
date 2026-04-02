import { getNakshatra, getZodiacSign, getPlanetaryPositions } from './ephemeris';
import { log } from '../logger';
import { parseBirthDateUTC } from '../timezones';

/**
 * Ashtakoot Milan - 36-Point Compatibility Matching
 * Pure Vedic math for relationship compatibility.
 */

const NAKSHATRA_GENDER = [
  'M','F','M','F','M','F','M','F','M','F','M','F','M','F',
  'M','F','M','F','M','F','M','F','M','F','M','F','M'
];

const NAKSHATRA_GANA = [
  'Deva','Manushya','Rakshasa','Deva','Manushya','Rakshasa',
  'Deva','Manushya','Rakshasa','Rakshasa','Manushya','Deva',
  'Deva','Rakshasa','Deva','Rakshasa','Deva','Manushya',
  'Rakshasa','Manushya','Manushya','Deva','Rakshasa','Deva',
  'Deva','Manushya','Rakshasa'
];

const NAKSHATRA_YONI = [
  'Horse','Elephant','Sheep','Serpent','Dog','Cat','Rat','Cow',
  'Buffalo','Tiger','Hare','Buffalo','Mongoose','Monkey','Lion',
  'Tiger','Deer','Dog','Cat','Elephant','Horse','Cow','Lion',
  'Hare','Cow','Lion','Fish'
];

const YONI_COMPATIBILITY = {
  Horse:     { Horse:4, Elephant:0, Sheep:2, Serpent:1, Dog:1, Cat:2, Rat:1, Cow:2, Buffalo:1, Tiger:0, Hare:2, Mongoose:1, Monkey:2, Lion:0, Deer:2, Fish:2 },
  Elephant:  { Horse:0, Elephant:4, Sheep:2, Serpent:1, Dog:2, Cat:1, Rat:1, Cow:2, Buffalo:2, Tiger:1, Hare:2, Mongoose:0, Monkey:2, Lion:1, Deer:2, Fish:2 },
  Sheep:     { Horse:2, Elephant:2, Sheep:4, Serpent:0, Dog:2, Cat:1, Rat:2, Cow:2, Buffalo:2, Tiger:0, Hare:2, Mongoose:1, Monkey:2, Lion:1, Deer:2, Fish:2 },
  Serpent:   { Horse:1, Elephant:1, Sheep:0, Serpent:4, Dog:0, Cat:1, Rat:1, Cow:1, Buffalo:1, Tiger:1, Hare:1, Mongoose:0, Monkey:0, Lion:1, Deer:1, Fish:1 },
  Dog:       { Horse:1, Elephant:2, Sheep:2, Serpent:0, Dog:4, Cat:0, Rat:2, Cow:1, Buffalo:2, Tiger:1, Hare:2, Mongoose:2, Monkey:2, Lion:1, Deer:2, Fish:1 },
  Cat:       { Horse:2, Elephant:1, Sheep:1, Serpent:1, Dog:0, Cat:4, Rat:0, Cow:2, Buffalo:1, Tiger:1, Hare:2, Mongoose:1, Monkey:2, Lion:2, Deer:2, Fish:1 },
  Rat:       { Horse:1, Elephant:1, Sheep:2, Serpent:1, Dog:2, Cat:0, Rat:4, Cow:1, Buffalo:1, Tiger:1, Hare:2, Mongoose:1, Monkey:2, Lion:1, Deer:2, Fish:2 },
  Cow:       { Horse:2, Elephant:2, Sheep:2, Serpent:1, Dog:1, Cat:2, Rat:1, Cow:4, Buffalo:2, Tiger:0, Hare:2, Mongoose:1, Monkey:2, Lion:0, Deer:2, Fish:2 },
  Buffalo:   { Horse:1, Elephant:2, Sheep:2, Serpent:1, Dog:2, Cat:1, Rat:1, Cow:2, Buffalo:4, Tiger:1, Hare:2, Mongoose:2, Monkey:2, Lion:1, Deer:2, Fish:2 },
  Tiger:     { Horse:0, Elephant:1, Sheep:0, Serpent:1, Dog:1, Cat:1, Rat:1, Cow:0, Buffalo:1, Tiger:4, Hare:1, Mongoose:1, Monkey:1, Lion:2, Deer:0, Fish:1 },
  Hare:      { Horse:2, Elephant:2, Sheep:2, Serpent:1, Dog:2, Cat:2, Rat:2, Cow:2, Buffalo:2, Tiger:1, Hare:4, Mongoose:1, Monkey:2, Lion:1, Deer:2, Fish:2 },
  Mongoose:  { Horse:1, Elephant:0, Sheep:1, Serpent:0, Dog:2, Cat:1, Rat:1, Cow:1, Buffalo:2, Tiger:1, Hare:1, Mongoose:4, Monkey:2, Lion:1, Deer:1, Fish:1 },
  Monkey:    { Horse:2, Elephant:2, Sheep:2, Serpent:0, Dog:2, Cat:2, Rat:2, Cow:2, Buffalo:2, Tiger:1, Hare:2, Mongoose:2, Monkey:4, Lion:1, Deer:2, Fish:2 },
  Lion:      { Horse:0, Elephant:1, Sheep:1, Serpent:1, Dog:1, Cat:2, Rat:1, Cow:0, Buffalo:1, Tiger:2, Hare:1, Mongoose:1, Monkey:1, Lion:4, Deer:0, Fish:1 },
  Deer:      { Horse:2, Elephant:2, Sheep:2, Serpent:1, Dog:2, Cat:2, Rat:2, Cow:2, Buffalo:2, Tiger:0, Hare:2, Mongoose:1, Monkey:2, Lion:0, Deer:4, Fish:2 },
  Fish:      { Horse:2, Elephant:2, Sheep:2, Serpent:1, Dog:1, Cat:1, Rat:2, Cow:2, Buffalo:2, Tiger:1, Hare:2, Mongoose:1, Monkey:2, Lion:1, Deer:2, Fish:4 },
};

const RASHI_LORD = [
  'Mars','Venus','Mercury','Moon','Sun','Mercury',
  'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter'
];

const PLANET_FRIENDSHIP = {
  Sun:     { Sun:'N', Moon:'F', Mars:'F', Mercury:'N', Jupiter:'F', Venus:'E', Saturn:'E', Rahu:'E', Ketu:'E' },
  Moon:    { Sun:'F', Moon:'N', Mars:'N', Mercury:'F', Jupiter:'F', Venus:'N', Saturn:'N', Rahu:'N', Ketu:'N' },
  Mars:    { Sun:'F', Moon:'N', Mars:'N', Mercury:'E', Jupiter:'F', Venus:'N', Saturn:'N', Rahu:'N', Ketu:'F' },
  Mercury: { Sun:'N', Moon:'E', Mars:'N', Mercury:'N', Jupiter:'N', Venus:'F', Saturn:'F', Rahu:'F', Ketu:'N' },
  Jupiter: { Sun:'F', Moon:'F', Mars:'F', Mercury:'E', Jupiter:'N', Venus:'E', Saturn:'N', Rahu:'E', Ketu:'F' },
  Venus:   { Sun:'E', Moon:'N', Mars:'N', Mercury:'F', Jupiter:'N', Venus:'N', Saturn:'F', Rahu:'F', Ketu:'N' },
  Saturn:  { Sun:'E', Moon:'E', Mars:'E', Mercury:'F', Jupiter:'N', Venus:'F', Saturn:'N', Rahu:'F', Ketu:'N' },
};

export function calculateCompatibility(profileA, profileB, ayanamsaSystem = 'lahiri') {
  if (!profileA || !profileB) return null;

  // 1. Calculate Birth Data
  const getEphemDate = (p) => {
    return parseBirthDateUTC(p.dob_date, p.dob_time, p.iana_timezone || 'Asia/Kolkata');
  };

  const birthA = getEphemDate(profileA);
  const birthB = getEphemDate(profileB);

  const posA = getPlanetaryPositions(birthA, profileA.latitude, profileA.longitude, ayanamsaSystem);
  const posB = getPlanetaryPositions(birthB, profileB.latitude, profileB.longitude, ayanamsaSystem);

  const nakAIdx = getNakshatra(posA.Moon.longitude).nakshatra;
  const nakBIdx = getNakshatra(posB.Moon.longitude).nakshatra;

  const rashiA = getZodiacSign(posA.Moon.longitude);
  const rashiB = getZodiacSign(posB.Moon.longitude);

  // ─── 8 Kutas ──────────────────────────────────────────────────────────

  // A. VARNA (max 1)
  const getVarna = (rIdx) => {
    if ([3, 7, 11].includes(rIdx)) return 3; // Brahmin
    if ([0, 4, 8].includes(rIdx)) return 2;  // Kshatriya
    if ([1, 5, 9].includes(rIdx)) return 1;  // Vaishya
    return 0; // Shudra
  };
  const vA = getVarna(rashiA);
  const vB = getVarna(rashiB);
  const scoreVarna = vA >= vB ? 1 : 0;

  // B. VASHYA (max 2) - Simplified as requested
  let scoreVashya = 0;
  if (rashiA === rashiB) scoreVashya = 2;
  else if (Math.abs(rashiA - rashiB) <= 2) scoreVashya = 1;

  // C. TARA (max 3)
  const calcTara = (from, to) => {
    const distance = ((to - from + 27) % 27) + 1;
    const res = (distance % 9) || 9;
    if ([2, 4, 6, 8, 9].includes(res)) return 3;
    if ([1, 3].includes(res)) return 1.5;
    return 0;
  };
  const scoreTara = (calcTara(nakAIdx, nakBIdx) + calcTara(nakBIdx, nakAIdx)) / 2;

  // D. YONI (max 4)
  const yA = NAKSHATRA_YONI[nakAIdx];
  const yB = NAKSHATRA_YONI[nakBIdx];
  const scoreYoni = YONI_COMPATIBILITY[yA]?.[yB] ?? 0;

  // E. GRAHA MAITRI (max 5)
  const lordA = RASHI_LORD[rashiA];
  const lordB = RASHI_LORD[rashiB];
  const relAB = PLANET_FRIENDSHIP[lordA]?.[lordB] || 'N';
  const relBA = PLANET_FRIENDSHIP[lordB]?.[lordA] || 'N';
  
  let scoreGraha = 0;
  if (relAB === 'F' && relBA === 'F') scoreGraha = 5;
  else if ((relAB === 'F' && relBA === 'N') || (relAB === 'N' && relBA === 'F')) scoreGraha = 4;
  else if (relAB === 'N' && relBA === 'N') scoreGraha = 3;
  else if ((relAB === 'F' && relBA === 'E') || (relAB === 'E' && relBA === 'F')) scoreGraha = 1;
  else scoreGraha = 0;

  // F. GANA (max 6)
  const gA = NAKSHATRA_GANA[nakAIdx];
  const gB = NAKSHATRA_GANA[nakBIdx];
  let scoreGana = 0;
  if (gA === gB) scoreGana = 6;
  else if ((gA === 'Deva' && gB === 'Manushya') || (gA === 'Manushya' && gB === 'Deva')) scoreGana = 5;
  else if ((gA === 'Deva' && gB === 'Rakshasa') || (gA === 'Rakshasa' && gB === 'Deva')) scoreGana = 1;
  else scoreGana = 0;

  // G. BHAKOOT (max 7)
  const diff = (rashiB - rashiA + 12) % 12;
  const scoreBhakoot = ![2, 5, 6, 9, 11].includes(diff) ? 7 : 0;

  // H. NADI (max 8)
  const getNadi = (nIdx) => {
    if ([0, 5, 6, 11, 12, 17, 18, 23, 24].includes(nIdx)) return 0; // Vata
    if ([1, 4, 7, 10, 13, 16, 19, 22, 25].includes(nIdx)) return 1; // Pitta
    return 2; // Kapha
  };
  const nA = getNadi(nakAIdx);
  const nB = getNadi(nakBIdx);
  const scoreNadi = nA !== nB ? 8 : 0;

  // ─── Accumulate ────────────────────────────────────────────────────────
  const totalScore = scoreVarna + scoreVashya + scoreTara + scoreYoni + scoreGraha + scoreGana + scoreBhakoot + scoreNadi;
  const percentage = (totalScore / 36) * 100;

  let grade = 'Poor';
  if (totalScore >= 31) grade = 'Excellent';
  else if (totalScore >= 25) grade = 'Good';
  else if (totalScore >= 18) grade = 'Average';

  // Summary generation
  let summary = `Overall compatibility is ${grade} at ${totalScore}/36. `;
  if (scoreNadi === 8) summary += "The Nadi match indicates healthy progeny prospects. ";
  else summary += "Nadi Dosha is present, suggesting potential health or energy mismatches. ";

  if (scoreGana >= 5) summary += "Gana compatibility is excellent, suggesting well-matched temperaments.";
  else if (scoreGana === 0) summary += "Nature and temperament differences (Gana) might require extra patience.";

  log.info('Compatibility', `Match: ${profileA.name} & ${profileB.name} | Total: ${totalScore}/36`);

  return {
    totalScore,
    maxScore: 36,
    percentage,
    grade,
    nadiDosha: scoreNadi === 0,
    summary,
    kutas: {
      varna:  { score: scoreVarna, max:1,  name:'Varna',  desc:'Social compatibility' },
      vashya: { score: scoreVashya, max:2,  name:'Vashya', desc:'Mutual attraction' },
      tara:   { score: scoreTara, max:3,  name:'Tara',   desc:'Destiny and luck' },
      yoni:   { score: scoreYoni, max:4,  name:'Yoni',   desc:'Physical compatibility' },
      graha:  { score: scoreGraha, max:5,  name:'Graha Maitri', desc:'Mental compatibility' },
      gana:   { score: scoreGana, max:6,  name:'Gana',   desc:'Nature and temperament' },
      bhakoot:{ score: scoreBhakoot, max:7,  name:'Bhakoot', desc:'Love and family' },
      nadi:   { score: scoreNadi, max:8,  name:'Nadi',   desc:'Health and progeny' },
    }
  };
}

