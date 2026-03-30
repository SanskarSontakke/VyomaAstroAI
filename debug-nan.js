import { getPlanetaryPositions, getAscendant, getZodiacSign } from './src/lib/astro/ephemeris.js';

const profile = {
  dob_date: "1990-01-01",
  dob_time: "06:00",
  latitude: 19.076,
  longitude: 72.877,
  timezone_offset: 5.5
};

const dobISO = `${profile.dob_date}T${profile.dob_time}:00Z`;
const birthDate = new Date(dobISO);
birthDate.setMinutes(birthDate.getMinutes() - (profile.timezone_offset * 60));

console.log("Birth Date (UTC):", birthDate.toUTCString());

try {
  const positions = getPlanetaryPositions(birthDate, profile.latitude, profile.longitude);
  console.log("Positions:", positions);
  
  const ascendant = getAscendant(birthDate, profile.latitude, profile.longitude);
  console.log("Ascendant:", ascendant);
  
  Object.keys(positions).forEach(p => {
    const lon = positions[p];
    if (isNaN(lon)) console.error(`Planet ${p} has NaN longitude!`);
  });
  
  if (isNaN(ascendant.longitude)) console.error("Ascendant has NaN longitude!");

} catch (err) {
  console.error("Calculation failed:", err);
}
