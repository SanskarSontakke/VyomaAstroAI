export const REFERENCE_CHARTS = [
  {
    id: 'chart_mumbai_1990',
    label: 'Test case — Mumbai, 1990',
    input: {
      dob_date: '1990-01-01',
      dob_time: '06:00',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone_offset: 5.5,
    },
    expected: {
      positions: {
        Sun:     { sign: 8,  longitude: 256.38, retrograde: false },
        Moon:    { sign: 10, longitude: 300.05, retrograde: false },
        Mars:    { sign: 7,  longitude: 225.94, retrograde: false },
        Mercury: { sign: 9,  longitude: 272.26, retrograde: true  },
        Jupiter: { sign: 2,  longitude: 71.67,  retrograde: true  },
        Venus:   { sign: 9,  longitude: 282.73, retrograde: true  },
        Saturn:  { sign: 8,  longitude: 262.01, retrograde: false },
        Rahu:    { sign: 9,  longitude: 293.26, retrograde: true  },
        Ketu:    { sign: 3,  longitude: 113.26, retrograde: true  },
      },
      ascendant: { sign: 11, longitude: 343.92 },
      nakshatra: { moon: { index: 22, name: 'Dhanishtha', pada: 3 } },
    },
  },
  {
    id: 'chart_delhi_1975',
    label: 'Test case — Delhi, 1975',
    input: {
      dob_date: '1975-06-15',
      dob_time: '14:30',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone_offset: 5.5,
    },
    expected: {
      positions: {
        Sun:     { sign: 1,  longitude: 59.93,  retrograde: false },
        Moon:    { sign: 4,  longitude: 130.25, retrograde: false },
        Mars:    { sign: 11, longitude: 355.27, retrograde: false },
        Mercury: { sign: 1,  longitude: 53.76,  retrograde: true  },
        Jupiter: { sign: 11, longitude: 356.08, retrograde: false },
        Venus:   { sign: 3,  longitude: 105.59, retrograde: false },
        Saturn:  { sign: 2,  longitude: 85.47,  retrograde: false },
        Rahu:    { sign: 7,  longitude: 217.23, retrograde: true  },
        Ketu:    { sign: 1,  longitude: 37.23,  retrograde: true  },
      },
      ascendant: { sign: 9, longitude: 286.59 },
      nakshatra: { moon: { index: 9, name: 'Magha', pada: 4 } },
    },
  },
  {
    id: 'chart_chennai_1985',
    label: 'Test case — Chennai, 1985',
    input: {
      dob_date: '1985-11-20',
      dob_time: '22:15',
      latitude: 13.0827,
      longitude: 80.2707,
      timezone_offset: 5.5,
    },
    expected: {
      positions: {
        Sun:     { sign: 7,  longitude: 214.43, retrograde: false },
        Moon:    { sign: 10, longitude: 317.17, retrograde: false },
        Mars:    { sign: 5,  longitude: 171.46, retrograde: false },
        Mercury: { sign: 7,  longitude: 231.29, retrograde: true  },
        Jupiter: { sign: 9,  longitude: 287.27, retrograde: false },
        Venus:   { sign: 6,  longitude: 200.14, retrograde: false },
        Saturn:  { sign: 7,  longitude: 216.96, retrograde: false },
        Rahu:    { sign: 0,  longitude: 15.45,  retrograde: true  },
        Ketu:    { sign: 6,  longitude: 195.45, retrograde: true  },
      },
      ascendant: { sign: 6, longitude: 201.21 },
      nakshatra: { moon: { index: 23, name: 'Shatabhisha', pada: 1 } },
    },
  },
  {
    id: 'chart_kolkata_1960',
    label: 'Test case — Kolkata, 1960',
    input: {
      dob_date: '1960-03-21',
      dob_time: '08:45',
      latitude: 22.5726,
      longitude: 88.3639,
      timezone_offset: 5.5,
    },
    expected: {
      positions: {
        Sun:     { sign: 11, longitude: 336.99, retrograde: false },
        Moon:    { sign: 8,  longitude: 255.29, retrograde: false },
        Mars:    { sign: 9,  longitude: 297.75, retrograde: false },
        Mercury: { sign: 10, longitude: 319.95, retrograde: true  },
        Jupiter: { sign: 8,  longitude: 249.48, retrograde: false },
        Venus:   { sign: 10, longitude: 313.22, retrograde: false },
        Saturn:  { sign: 8,  longitude: 264.56, retrograde: false },
        Rahu:    { sign: 5,  longitude: 151.25, retrograde: true  },
        Ketu:    { sign: 11, longitude: 331.25, retrograde: true  },
      },
      ascendant: { sign: 3, longitude: 110.05 },
      nakshatra: { moon: { index: 19, name: 'Purva Ashadha', pada: 1 } },
    },
  },
  {
    id: 'chart_pune_2000',
    label: 'Test case — Pune, 2000',
    input: {
      dob_date: '2000-07-04',
      dob_time: '03:30',
      latitude: 18.5204,
      longitude: 73.8567,
      timezone_offset: 5.5,
    },
    expected: {
      positions: {
        Sun:     { sign: 2,  longitude: 78.17,  retrograde: false },
        Moon:    { sign: 3,  longitude: 104.81, retrograde: false },
        Mars:    { sign: 2,  longitude: 77.59,  retrograde: false },
        Mercury: { sign: 2,  longitude: 82.55,  retrograde: true  },
        Jupiter: { sign: 1,  longitude: 36.85,  retrograde: false },
        Venus:   { sign: 2,  longitude: 84.29,  retrograde: false },
        Saturn:  { sign: 1,  longitude: 33.07,  retrograde: false },
        Rahu:    { sign: 3,  longitude: 90.68,  retrograde: true  },
        Ketu:    { sign: 9,  longitude: 270.68, retrograde: true  },
      },
      ascendant: { sign: 4, longitude: 123.00 },
      nakshatra: { moon: { index: 7, name: 'Pushya', pada: 4 } },
    },
  },
];

export const TOLERANCE = 2.0;
export function withinTolerance(actual, expected, tol = TOLERANCE) {
  return Math.abs(actual - expected) < tol;
}

export const DASHA_CASES = [
  {
    label: 'Moon in Dhanishtha — Mars dasha at birth',
    moonLongitude: 300.05,
    birthDate: new Date('1990-01-01T00:30:00Z'),
    expectedFirstMaha: 'Mars',
    expectedSecondMaha: 'Rahu',
  },
  {
    label: 'Moon in Pushya — Saturn dasha at birth',
    moonLongitude: 104.81,
    birthDate: new Date('2000-07-04T03:30:00Z'),
    expectedFirstMaha: 'Saturn',
  },
];

export const COMBUSTION_CASES = []; // Placeholder for now
export const ASPECT_CASES = []; // Placeholder for now
export const PANCHANG_CASES = []; // Placeholder for now
