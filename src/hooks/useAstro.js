import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

import { getDailyInsights } from '../lib/astro/insights';
import { getPlanetaryPositions, getAscendant, getZodiacSign } from '../lib/astro/ephemeris';
import { getMahaDasha, getCurrentDasha } from '../lib/astro/dasha';


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
  });
}

export function useAstroData(profile, date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['astroData', profile?.id, dateStr],
    queryFn: async () => {
      if (!profile) return null;
      // Simulate a small delay for cinematic feel if needed, 
      // but Query will handle the loading state
      return getDailyInsights(profile, date);
    },
    enabled: !!profile,
    staleTime: 1000 * 60 * 60, // 1 hour (celestial data doesn't change that fast)
  });
}

export function useChartData(p) {
  return useQuery({
    queryKey: ['chartData', p?.id],
    queryFn: async () => {
      if (!p) return null;
      
      const timeWithSeconds = p.dob_time.split(':').length === 2 ? `${p.dob_time}:00` : p.dob_time;
      const dobISO = `${p.dob_date}T${timeWithSeconds}Z`;
      const birthDate = new Date(dobISO);

      birthDate.setMinutes(birthDate.getMinutes() - (p.timezone_offset * 60));

      const positions = getPlanetaryPositions(birthDate, p.latitude, p.longitude);
      const ascendant = getAscendant(birthDate, p.latitude, p.longitude);

      const planetData = {};
      Object.entries(positions).forEach(([name, lon]) => {
        planetData[name] = {
          sign: getZodiacSign(lon),
          longitude: lon,
          retrograde: false // Placeholder
        };
      });

      const mahaDashas = getMahaDasha(positions.Moon, birthDate);
      const current = getCurrentDasha(mahaDashas, new Date());

      const currentMahaIdx = mahaDashas.findIndex(d => d.planet === current?.maha.planet);
      const dashaTimeline = mahaDashas.slice(Math.max(0, currentMahaIdx - 1), currentMahaIdx + 5);

      return {
        positions: planetData,
        ascendant,
        dashaTimeline,
        currentDasha: current
      };
    },
    enabled: !!p,
    staleTime: Infinity, // Birth data never changes
  });
}

