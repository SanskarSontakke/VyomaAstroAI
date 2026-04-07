import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { calculateFullChartParallel, calculateFullChartSafe } from './ParallelAstro';
import { setCachedChart, getCachedChart } from './chartCache';
import { useProfile } from './ProfileContext';
import { sendPoolTask } from './WorkerPool';

const CalculationContext = createContext(null);

export const CalculationProvider = ({ children }) => {
  const { activeProfile, settings } = useProfile();
  // Map of profileId -> astroData
  const [astroDataMap, setAstroDataMap] = useState({});
  const [transitData, setTransitData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState(null);

  const updateProgress = useCallback((increment, taskName) => {
    setProgress(prev => Math.min(prev + increment, 100));
    if (taskName) setCurrentTask(taskName);
  }, []);

  /**
   * Live Transit Engine
   * Periodically updates celestial coordinates for the current moment.
   */
  const updateTransits = useCallback(async () => {
    if (!activeProfile) return;
    try {
      const pos = await sendPoolTask('CALC_POSITIONS', {
        dateISO: new Date().toISOString(),
        lat: activeProfile.latitude,
        lon: activeProfile.longitude,
        ayanamsaSystem: settings.ayanamsaSystem
      });
      setTransitData({
        positions: pos,
        lastUpdated: new Date()
      });
    } catch (err) {
      console.error('Transit Calculation Error:', err);
    }
  }, [activeProfile, settings.ayanamsaSystem]);

  // Handle live transit heartbeat
  useEffect(() => {
    updateTransits();
    const interval = setInterval(updateTransits, 60000);
    return () => clearInterval(interval);
  }, [updateTransits]);

  /**
   * Dispatches a single, comprehensive calculation job.
   */
  const calculateAll = useCallback(async (profile, ayanamsaSystem, houseSystem = 'whole_sign', force = false) => {
    if (!profile) return;
    
    // Check memory first
    const existing = astroDataMap[profile.id];
    if (!force && existing && existing.ayanamsaUsed === ayanamsaSystem && existing.houseSystem === houseSystem) {
      return existing;
    }

    // Start progress immediately so users see activity during cache lookup.
    if (!force) {
      setIsCalculating(true);
      setProgress(5);
      setError(null);
      setCurrentTask(`Checking cached chart for ${profile.name}...`);
    }

    // Check persistent cache
    if (!force) {
      const cached = await getCachedChart(profile, ayanamsaSystem, houseSystem);
      if (cached && cached.ayanamsaUsed === ayanamsaSystem && cached.houseSystem === houseSystem) {
        setAstroDataMap(prev => ({ ...prev, [profile.id]: cached }));
        setIsCalculating(false);
        setProgress(100);
        setCurrentTask(`Loaded cached chart for ${profile.name}.`);
        return cached;
      }
    }

    if (!isCalculating) {
      setIsCalculating(true);
      setProgress(10);
      setCurrentTask(`Analyzing ${profile.name}'s cosmic imprint...`);
    }

    try {
      let result;
      try {
        result = await calculateFullChartParallel(profile, ayanamsaSystem, updateProgress);
      } catch (primaryError) {
        console.warn('Calculation failed in parallel mode, falling back to single-worker chart calculation.', primaryError);
        setCurrentTask('Retrying with safe chart calculation...');
        result = await calculateFullChartSafe(profile, ayanamsaSystem);
      }

      const dataToStore = { ...result, profileId: profile.id, ayanamsaUsed: ayanamsaSystem, houseSystem };
      
      setAstroDataMap(prev => ({ ...prev, [profile.id]: dataToStore }));
      await setCachedChart(profile, ayanamsaSystem, houseSystem, dataToStore);
      
      setProgress(100);
      return dataToStore;
    } catch (err) {
      console.error('Calculation Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setTimeout(() => {
        setIsCalculating(false);
        setCurrentTask('');
      }, 500);
    }
  }, [astroDataMap, updateProgress, isCalculating]);

  // Automatically trigger upfront calculation for active profile
  useEffect(() => {
    if (activeProfile) {
      calculateAll(activeProfile, settings.ayanamsaSystem, settings.houseSystem).catch(err => {
        console.error('Auto calculate failed:', err);
      });
    }
  }, [activeProfile, settings.ayanamsaSystem, settings.houseSystem, calculateAll]);

  const value = useMemo(() => ({
    astroDataMap,
    transitData,
    isCalculating,
    progress,
    currentTask,
    error,
    calculateAll
  }), [astroDataMap, transitData, isCalculating, progress, currentTask, error, calculateAll]);

  return (
    <CalculationContext.Provider value={value}>
      {children}
    </CalculationContext.Provider>
  );
};

export const useCalculation = () => {
  const context = useContext(CalculationContext);
  if (!context) throw new Error('useCalculation must be used within a CalculationProvider');
  return context;
};
