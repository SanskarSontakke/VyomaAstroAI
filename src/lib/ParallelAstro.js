import { sendPoolTask } from './WorkerPool';
import { parseBirthDateUTC } from './timezones';
import { getCurrentDasha, getMahaDasha } from './astro/dasha';
import { getPlanetaryPositions, getAscendant } from './astro/ephemeris';
import { detectYogas } from './astro/yogas';

/**
 * Orchestrates a parallelized calculation of a full Vedic chart.
 * This implements the unified, upfront calculation sequence.
 */
export async function calculateFullChartParallel(profile, ayanamsaSystem, updateProgress) {
  const birthUTC = parseBirthDateUTC(
    profile.dob_date, profile.dob_time, profile.iana_timezone || 'Asia/Kolkata'
  );

  updateProgress(5, 'Initializing Celestial Engine...');

  const isLowMemoryDevice = typeof navigator !== 'undefined' && (
    (navigator.deviceMemory && navigator.deviceMemory <= 4) || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );

  if (isLowMemoryDevice) {
    return await calculateMinimalChart(profile, ayanamsaSystem, updateProgress);
  }

  // 1. Initial Positions & Ascendant (Base for all others)
  // We use CALC_CHART as a base because it returns positions and ascendant quickly
  const baseData = await sendPoolTask('CALC_CHART', { 
    profile, 
    ayanamsaSystem 
  });
  
  const { positions, ascendant } = baseData;
  const ascSign = ascendant.sign;
  const moonLon = positions.Moon.longitude;

  updateProgress(20, 'Distributing Computational Load...');

  const shouldRunSequentially = typeof navigator !== 'undefined' && (
    navigator.deviceMemory <= 4 || (navigator.hardwareConcurrency || 4) <= 3
  );

  const taskDefinitions = [
    { type: 'CALC_VARGAS', payload: { profile, ayanamsaSystem }, weight: 20, label: 'Computing Divisional Charts (D1-D60)...' },
    { type: 'CALC_YOGAS', payload: { positions, ascendantSign: ascSign }, weight: 15, label: 'Analyzing Planetary Yogas...' },
    { type: 'CALC_SHADBALA', payload: { positions, ascendantSign: ascSign, birthUTC: birthUTC.toISOString() }, weight: 15, label: 'Calculating Shadbala Strengths...' },
    { type: 'CALC_ASHTAKAVARGA', payload: { positions, ascendantSign: ascSign }, weight: 15, label: 'Generating Ashtakavarga Bindus...' },
    { type: 'CALC_DASHAS', payload: { moonLon, birthUTC: birthUTC.toISOString() }, weight: 15, label: 'Projecting Dasha Timeline...' }
  ];

  const runTask = async (task) => {
    const data = await sendPoolTask(task.type, task.payload);
    updateProgress(task.weight, task.label);
    return { type: task.type, data };
  };

  let results;
  if (shouldRunSequentially) {
    results = [];
    for (const task of taskDefinitions) {
      results.push(await runTask(task));
    }
  } else {
    results = await Promise.all(taskDefinitions.map(runTask));
  }

  // 3. Reassembly into a flat, React-optimized structure
  const final = {
    positions,
    ascendant,
    birthDate: birthUTC.toISOString(),
    ayanamsaUsed: ayanamsaSystem,
    vargas: results.find(r => r.type === 'CALC_VARGAS').data,
    yogas: results.find(r => r.type === 'CALC_YOGAS').data,
    shadbala: results.find(r => r.type === 'CALC_SHADBALA').data,
    ashtakavarga: results.find(r => r.type === 'CALC_ASHTAKAVARGA').data,
    dashaTimeline: results.find(r => r.type === 'CALC_DASHAS').data,
  };

  // Pre-calculate current dasha for convenience
  final.currentDasha = getCurrentDasha(final.dashaTimeline, new Date());

  return final;
}

export async function calculateMinimalChart(profile, ayanamsaSystem, updateProgress = () => {}) {
  const birthUTC = parseBirthDateUTC(
    profile.dob_date, profile.dob_time, profile.iana_timezone || 'Asia/Kolkata'
  );

  updateProgress(5, 'Computing core planetary positions...');
  const positions = getPlanetaryPositions(birthUTC, profile.latitude, profile.longitude, ayanamsaSystem);
  const ascendant = getAscendant(birthUTC, profile.latitude, profile.longitude, ayanamsaSystem);
  
  updateProgress(15, 'Calculating dasha timeline...');
  const moonLon = positions.Moon.longitude;
  const dashaTimeline = getMahaDasha(moonLon, birthUTC);
  const currentDasha = getCurrentDasha(dashaTimeline, new Date());

  updateProgress(25, 'Applying lightweight chart fallback...');
  const vargas = {
    D1: {
      positions,
      ascendant,
    }
  };

  const yogas = detectYogas(positions, ascendant.sign);

  const ashtakavarga = {
    Jupiter: { scores: new Array(12).fill(0) },
    Saturn: { scores: new Array(12).fill(0) }
  };

  const final = {
    positions,
    ascendant,
    birthDate: birthUTC.toISOString(),
    ayanamsaUsed: ayanamsaSystem,
    vargas,
    yogas,
    shadbala: [],
    ashtakavarga,
    dashaTimeline,
    currentDasha,
  };

  return final;
}

export async function calculateFullChartSafe(profile, ayanamsaSystem, updateProgress) {
  try {
    return await sendPoolTask('CALC_CHART', { profile, ayanamsaSystem });
  } catch {
    return await calculateMinimalChart(profile, ayanamsaSystem, updateProgress);
  }
}
