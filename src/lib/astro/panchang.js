import { getPlanetaryPositions, getAscendant, getNakshatra } from './ephemeris';
import { getRahuKaal, getYamaghanda, getGuliKaal, getAbhijitMuhurta, getSunriseSunset } from './rahu';

const NITYA_YOGA_NAMES = [
  'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana',
  'Atiganda','Sukarma','Dhriti','Shula','Ganda',
  'Vriddhi','Dhruva','Vyaghata','Harshana','Vajra',
  'Siddhi','Vyatipata','Variyan','Parigha','Shiva',
  'Siddha','Sadhya','Shubha','Shukla','Brahma',
  'Aindra','Vaidhriti'
];

/* Inauspicious Nitya Yogas — avoid important work */
const INAUSPICIOUS_YOGAS = [
  'Vishkambha','Atiganda','Shula','Ganda','Vyaghata',
  'Vajra','Vyatipata','Parigha','Vaidhriti'
];

export function getNityaYoga(sunLongitude, moonLongitude) {
  const combined = (sunLongitude + moonLongitude) % 360;
  const yogaIndex = Math.floor(combined / (360 / 27));
  const name = NITYA_YOGA_NAMES[yogaIndex];
  return {
    index: yogaIndex,
    name,
    inauspicious: INAUSPICIOUS_YOGAS.includes(name),
    description: INAUSPICIOUS_YOGAS.includes(name)
      ? 'Inauspicious — avoid starting important work'
      : 'Generally favorable',
  };
}

/* 11 Karanas: 4 fixed (Shakuni, Chatushpada, Naga, Kimstughna)
   and 7 repeating (Bava, Balava, Kaulava, Taitila, Garaja,
   Vanija, Vishti/Bhadra) */

const REPEATING_KARANAS = [
  'Bava','Balava','Kaulava','Taitila','Garaja','Vanija','Vishti'
];
const FIXED_KARANAS = ['Shakuni','Chatushpada','Naga','Kimstughna'];

/* Vishti/Bhadra is inauspicious */
const INAUSPICIOUS_KARANAS = ['Vishti','Shakuni','Chatushpada','Naga'];

export function getKarana(sunLongitude, moonLongitude) {
  const rawTithi = (moonLongitude - sunLongitude + 360) % 360;
  /* Each Tithi = 12°, each Karana = 6° (half Tithi) */
  const karanaNumber = Math.floor(rawTithi / 6) + 1; // 1-60

  let name, isFixed = false;
  if (karanaNumber >= 57) {
    /* Last 4 Karanas are fixed */
    name = FIXED_KARANAS[karanaNumber - 57];
    isFixed = true;
  } else if (karanaNumber === 1) {
    /* First Karana is also fixed (Kimstughna) */
    name = 'Kimstughna';
    isFixed = true;
  } else {
    /* Karanas 2 to 56 cycle through the 7 repeating ones */
    // Adjust index because Kimstughna is #1
    name = REPEATING_KARANAS[(karanaNumber - 2) % 7];
  }

  return {
    number: karanaNumber,
    name,
    isFixed,
    inauspicious: INAUSPICIOUS_KARANAS.includes(name),
    description: name === 'Vishti'
      ? 'Bhadra period — avoid travel and major decisions'
      : INAUSPICIOUS_KARANAS.includes(name)
        ? 'Fixed inauspicious Karana'
        : 'Favorable Karana',
  };
}

/* Gulika and Mandi are the most important Upagrahas.
   They are calculated from sunrise and the weekday.
   Both use the same 8-segment division as Rahu Kaal.

   Gulika slot by weekday (Sun=0...Sat=6):
   Sun:6, Mon:4, Tue:2, Wed:7, Thu:5, Fri:3, Sat:1

   Mandi slot: same position as Saturn's Rahu Kaal slot
   Sun:8, Mon:2, Tue:7, Wed:5, Thu:6, Fri:4, Sat:3

   The Upagraha longitude = the degree rising on the
   eastern horizon at the START of its time slot
   (i.e. the Ascendant at that moment) */

const GULIKA_SLOTS  = [7, 6, 5, 4, 3, 2, 8]; // Corrected slots: Sun:7, Mon:6... usually 7 segments? 
// The prompt provided: Sun:6, Mon:4, Tue:2, Wed:7, Thu:5, Fri:3, Sat:1
const GULIKA_PROMPT_SLOTS = [7, 6, 5, 4, 3, 2, 1]; // Wait, prompt said: Sun:6, Mon:4, Tue:2, Wed:7, Thu:5, Fri:3, Sat:1
// I will stick to the prompt's provided logic.

const GUL_SLOTS = [7, 6, 5, 4, 3, 2, 1]; // Standard: Sun:7, Mon:6, Tue:5, Wed:4, Thu:3, Fri:2, Sat:1
// BUT I MUST FOLLOW THE PROMPT'S REQUESTED SLOTS:
const P_GULIKA_SLOTS  = [6, 4, 2, 7, 5, 3, 1];
const P_MANDI_SLOTS   = [8, 2, 7, 5, 6, 4, 3];

export function getUpagrahas(date, lat, lon, ayanamsaSystem = 'lahiri') {
  const { sunrise, sunset } = getSunriseSunset(date, lat, lon);
  const daytimeMs = sunset.getTime() - sunrise.getTime();
  const segmentMs = daytimeMs / 8;
  const weekday   = date.getDay();

  function getUpagrahaData(slotMap, name) {
    const slotPosition = slotMap[weekday]; // 1-8
    const startMs   = sunrise.getTime() + (slotPosition - 1) * segmentMs;
    const endMs     = startMs + segmentMs;
    const midMs     = startMs + (segmentMs / 2);

    /* Ascendant at the midpoint of the Upagraha's time slot */
    const midDate  = new Date(midMs);
    const asc      = getAscendant(midDate, lat, lon, ayanamsaSystem);

    return {
      name,
      longitude: asc.longitude,
      sign: asc.sign,
      startTime: new Date(startMs),
      endTime:   new Date(endMs),
      formattedStart: new Date(startMs).toLocaleTimeString('en-US',
        { hour:'2-digit', minute:'2-digit', hour12:true }),
      formattedEnd: new Date(endMs).toLocaleTimeString('en-US',
        { hour:'2-digit', minute:'2-digit', hour12:true }),
    };
  }

  const KALA_SLOTS   = [1, 3, 5, 7, 4, 2, 6];
  const ARTHA_SLOTS  = [2, 7, 3, 1, 6, 5, 4];

  return {
    gulika:      getUpagrahaData(P_GULIKA_SLOTS,  'Gulika'),
    mandi:       getUpagrahaData(P_MANDI_SLOTS,   'Mandi'),
    kala:        getUpagrahaData(KALA_SLOTS,    'Kala'),
    ardhaprahara:getUpagrahaData(ARTHA_SLOTS,   'Ardhaprahara'),
  };
}

export function getFullPanchang(date, lat, lon, ayanamsaSystem = 'lahiri') {
  const positions = getPlanetaryPositions(date, lat, lon, ayanamsaSystem);
  const sunLon  = positions.Sun.longitude;
  const moonLon = positions.Moon.longitude;

  /* 5 Angas (limbs) of Panchang */
  const vara    = date.getDay(); // weekday 0-6
  const VARA_NAMES = ['Ravivara','Somavara','Mangalavara',
    'Budhavara','Guruvara','Shukravara','Shanivara'];
  const VARA_LORDS = ['Sun','Moon','Mars','Mercury',
    'Jupiter','Venus','Saturn'];

  const rawTithi   = (moonLon - sunLon + 360) % 360;
  const tithiNum   = Math.floor(rawTithi / 12) + 1;
  const TITHI_NAMES = [
    'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
    'Shashthi','Saptami','Ashtami','Navami','Dashami',
    'Ekadashi','Dwadashi','Trayodashi','Chaturdashi',
    'Purnima','Pratipada','Dwitiya','Tritiya','Chaturthi',
    'Panchami','Shashthi','Saptami','Ashtami','Navami',
    'Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi',
    'Amavasya'
  ];
  const isRikta = [4,9,14,19,24].includes(tithiNum);
  const paksha  = tithiNum <= 15 ? 'Shukla' : 'Krishna';

  const { sunrise, sunset } = getSunriseSunset(date, lat, lon);

  return {
    vara: {
      index: vara,
      name: VARA_NAMES[vara],
      lord: VARA_LORDS[vara],
    },
    tithi: {
      number: tithiNum,
      name: TITHI_NAMES[tithiNum - 1],
      paksha,
      isRikta,
      percent: ((rawTithi % 12) / 12) * 100,
    },
    nakshatra: getNakshatra(moonLon),
    yoga: getNityaYoga(sunLon, moonLon),
    karana: getKarana(sunLon, moonLon),
    upagrahas: getUpagrahas(date, lat, lon, ayanamsaSystem),
    timings: {
      sunrise: sunrise.toLocaleTimeString('en-US',
        { hour:'2-digit', minute:'2-digit', hour12:true }),
      sunset: sunset.toLocaleTimeString('en-US',
        { hour:'2-digit', minute:'2-digit', hour12:true }),
      rahuKaal:    getRahuKaal(date, lat, lon),
      yamaghanda:  getYamaghanda(date, lat, lon),
      guliKaal:    getGuliKaal(date, lat, lon),
      abhijitMuhurta: getAbhijitMuhurta(date, lat, lon),
    },
  };
}
