const { julian, planetposition, solar, moonposition, data } = require('astronomia');

const jd = julian.CalendarGregorianToJD(1990, 1, 1);
console.log("JD:", jd);

// Let's see what's in data
// console.log(Object.keys(data));

// solar
const sun = solar.trueLongitude(julian.jdToJDE(jd));
console.log("Sun Longitude:", sun * 180 / Math.PI);

const moon = moonposition.position(julian.jdToJDE(jd));
console.log("Moon Longitude:", moon.lon * 180 / Math.PI);

