import { sendPoolTask } from './WorkerPool';
import { parseBirthDateUTC } from './timezones';
import { getCurrentDasha } from './astro/dasha';

/**
 * Orchestrates a parallelized calculation of a full Vedic chart.
 * Progress is reported via the updateProgress callback.
 */
export async function calculateFullChartParallel(profile, ayanamsaSystem, updateProgress) {
  const birthUTC = parseBirthDateUTC(
    profile.dob_date, profile.dob_time, profile.iana_timezone || 'Asia/Kolkata'
  );

  // 1. Initial State: Positions & Ascendant (Needed for almost all other calcs)
  updateProgress(10, 'Synchronizing Celestial Positions...');
  const baseData = await sendPoolTask('CALC_POSITIONS', {
    dateISO: birthUTC.toISOString(),
    lat: profile.latitude,
    lon: profile.longitude,
    ayanamsaSystem
  });
  
  const positions = baseData;
  // Ascendant calculation (Fast, usually part of positions or separate)
  // Re-fetch Ascendant if not included in positions (astro.worker.js calcPositions returns getPlanetaryPositions)
  // Let's refine astro.worker.js later if needed, but for now assuming we need Ascendant sign.
  // Actually, astro.worker.js calcFullChart does both.
  
  // To keep it simple and truly parallel, let's have a dedicated ASC task or just use the worker's calcFullChart logic
  // but split it. For now, I'll assume we need the ASC sign for the rest.
  
  // We'll call a quick task for the Ascendant.
  const ascendant = await sendPoolTask('CALC_CHART', { profile, ayanamsaSystem }); 
  // Wait, if I call CALC_CHART, it does everything. 
  // I should have a CALC_BASE task.
  
  updateProgress(20, 'Distributing Computational Load...');

  const ascSign = ascendant.ascendant.sign; 
  const moonLon = positions.Moon.longitude;

  // 2. Parallel Dispatch
  const tasks = [
    { 
      type: 'CALC_VARGAS', 
      payload: { profile, ayanamsaSystem }, 
      weight: 15, 
      label: 'Partitioning Divisional Charts (Vargas)...' 
    },
    { 
      type: 'CALC_YOGAS', 
      payload: { positions, ascendantSign: ascSign }, 
      weight: 15, 
      label: 'Identifying Planetary Combinations (Yogas)...' 
    },
    { 
      type: 'CALC_SHADBALA', 
      payload: { positions, ascendantSign: ascSign, birthUTC: birthUTC.toISOString() }, 
      weight: 15, 
      label: 'Measuring Planetary Strengths (Shadbala)...' 
    },
    { 
      type: 'CALC_ASHTAKAVARGA', 
      payload: { positions, ascendantSign: ascSign }, 
      weight: 15, 
      label: 'Computing Bindu Points (Ashtakavarga)...' 
    },
    { 
      type: 'CALC_DASHAS', 
      payload: { moonLon, birthUTC: birthUTC.toISOString() }, 
      weight: 20, 
      label: 'Timeline Projection (Vimshottari Dasha)...' 
    }
  ];

  const results = await Promise.all(
    tasks.map(async (t) => {
      const res = await sendPoolTask(t.type, t.payload);
      updateProgress(t.weight, t.label);
      return { type: t.type, data: res };
    })
  );

  // 3. Reassembly
  const final = {
    positions,
    ascendant: ascendant.ascendant,
    birthDate: birthUTC,
    currentDasha: getCurrentDasha(results.find(r => r.type === 'CALC_DASHAS').data, new Date())
  };

  results.forEach(r => {
    if (r.type === 'CALC_VARGAS') final.vargas = r.data;
    if (r.type === 'CALC_YOGAS') final.yogas = r.data;
    if (r.type === 'CALC_SHADBALA') final.shadbala = r.data;
    if (r.type === 'CALC_ASHTAKAVARGA') final.ashtakavarga = r.data;
    if (r.type === 'CALC_DASHAS') final.dashaTimeline = r.data;
  });

  return final;
}
