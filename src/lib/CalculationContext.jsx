import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { calculateFullChartParallel } from './ParallelAstro';
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
  const calculateAll = useCallback(async (profile, ayanamsaSystem, force = false) => {
    if (!profile) return;
    
    // Check memory first
    const existing = astroDataMap[profile.id];
    if (!force && existing && existing.ayanamsaUsed === ayanamsaSystem) {
      return existing;
    }

    // Check persistent cache
    if (!force) {
      const cached = await getCachedChart(profile, ayanamsaSystem);
      if (cached && cached.ayanamsaUsed === ayanamsaSystem) {
        setAstroDataMap(prev => ({ ...prev, [profile.id]: cached }));
        return cached;
      }
    }

    setIsCalculating(true);
    setProgress(0);
    setError(null);
    setCurrentTask(`Analyzing ${profile.name}'s cosmic imprint...`);

    try {
      const result = await calculateFullChartParallel(profile, ayanamsaSystem, updateProgress);
      const dataToStore = { ...result, profileId: profile.id };
      
      setAstroDataMap(prev => ({ ...prev, [profile.id]: dataToStore }));
      await setCachedChart(profile, ayanamsaSystem, dataToStore);
      
      setProgress(100);
      return dataToStore;
    } catch (err) {
      console.error('Calculation Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setTimeout(() => {
        setIsCalculating(false);
        setProgress(0);
        setCurrentTask('');
      }, 500);
    }
  }, [astroDataMap, updateProgress]);

  // Automatically trigger upfront calculation for active profile
  useEffect(() => {
    if (activeProfile) {
      calculateAll(activeProfile, settings.ayanamsaSystem);
    }
  }, [activeProfile, settings.ayanamsaSystem, calculateAll]);

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
