import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';
import { sendWorkerMessage } from '../lib/astroWorker';
import { getCachedChart, setCachedChart, getCachedInsights, setCachedInsights } from '../lib/chartCache';
import { useCalculation } from '../lib/CalculationContext';

export function useProfiles(userId) {
  return useQuery({
    queryKey: ['profiles', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useAstroData(profile, date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const { settings } = useProfile();
  
  return useQuery({
    queryKey: ['astroData_v3', profile?.id, dateStr, settings.ayanamsaSystem],
    queryFn: async () => {
      if (!profile) return null;
      
      // 1. Check IndexDB Cache
      const cached = await getCachedInsights(profile.id, date);
      if (cached) return cached;

      // 2. Offload to Worker
      const result = await sendWorkerMessage('CALC_INSIGHTS', {
        profile,
        dateISO: date.toISOString(),
        ayanamsaSystem: settings.ayanamsaSystem
      });

      // 3. Update Cache
      await setCachedInsights(profile.id, date, result);
      return result;
    },
    enabled: !!profile,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export async function getChartData(p, settings = {}) {
  if (!p) return null;
  
  // 1. Check IndexDB Cache
  const cached = await getCachedChart(p.id);
  if (cached) {
      /* Check if settings in cache match current settings */
      // (Simplified for now, assuming settings are part of cache key in a more robust system)
      return cached;
  }

  // 2. Offload to Worker
  const result = await sendWorkerMessage('CALC_CHART', {
    profile: p,
    ayanamsaSystem: settings.ayanamsaSystem || 'lahiri',
    houseSystem: settings.houseSystem || 'whole_sign'
  });

  // 3. Update Cache
  await setCachedChart(p.id, result);
  return result;
}

export function useChartData(profile) {
  const { activeProfile, settings } = useProfile();
  const { astroDataMap, isCalculating, error, calculateAll } = useCalculation();
  
  const targetProfile = profile || activeProfile;
  const data = targetProfile ? astroDataMap[targetProfile.id] : undefined;

  // If we have a target profile but no data in context, trigger calculation
  // This handles the "Compare" use case where secondary profiles might not be pre-calculated yet
  useEffect(() => {
    if (targetProfile && !data && !isCalculating) {
      calculateAll(targetProfile, settings.ayanamsaSystem);
    }
  }, [targetProfile, data, isCalculating, calculateAll, settings.ayanamsaSystem]);

  return {
    data,
    isLoading: isCalculating && !data,
    isFetching: isCalculating,
    error
  };
}

export function useCompatibility(profileA, profileB) {
  const { settings } = useProfile();
  return useQuery({
    queryKey: ['compat_v3', profileA?.id, profileB?.id, settings.ayanamsaSystem],
    queryFn: async () => {
      if (!profileA || !profileB) return null;
      /* Logic for compatibility could also be moved to worker if it's heavy */
      return sendWorkerMessage('CALC_COMPATIBILITY', {
          profileA,
          profileB,
          ayanamsaSystem: settings.ayanamsaSystem
      });
    },
    enabled: !!profileA && !!profileB,
    staleTime: Infinity,
  });
}

export function useMuhurta(profile, goalType, startDate, endDate) {
  const { settings } = useProfile();
  return useQuery({
    queryKey: ['muhurta', profile?.id, goalType, startDate, endDate, settings.ayanamsaSystem],
    queryFn: async () => {
      if (!profile || !goalType || !startDate || !endDate) return null;
      return sendWorkerMessage('FIND_MUHURTAS', {
          profile,
          goalType,
          startISO: startDate.toISOString(),
          endISO: endDate.toISOString(),
          ayanamsaSystem: settings.ayanamsaSystem
      });
    },
    enabled: !!profile && !!goalType && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 60,
  });
}


