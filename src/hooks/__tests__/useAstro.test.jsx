import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProfiles, useAstroData, useChartData } from '../useAstro';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useAstro Hook Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [
              {
                id: 'p1',
                name: 'Test User',
                dob_date: '1990-01-01',
                dob_time: '06:00',
                latitude: 19.076,
                longitude: 72.877,
                timezone_offset: 5.5,
                is_primary: true,
              }
            ],
            error: null,
          }),
        }),
      }),
    }),
  },
}));

// Mock chartCache to avoid indexedDB errors in Node atmosphere
vi.mock('../../lib/chartCache', () => ({
  getCachedChart: vi.fn(() => Promise.resolve(null)),
  setCachedChart: vi.fn(() => Promise.resolve()),
  getCachedInsights: vi.fn(() => Promise.resolve(null)),
  setCachedInsights: vi.fn(() => Promise.resolve()),
}));

// Mock Astro Worker
vi.mock('../../lib/astroWorker', () => ({
  sendWorkerMessage: vi.fn((type, payload) => {
    if (type === 'CALC_CHART') {
      return Promise.resolve({
        positions: { 
            Sun: { longitude: 10, sign: 0 },
            Moon: { longitude: 40, sign: 1 }
        },
        ascendant: { longitude: 5, sign: 0 },
        dashaTimeline: []
      });
    }
    if (type === 'CALC_INSIGHTS') {
      return Promise.resolve({
        dailyOutlook: "Today is positive",
        tithi: { name: 'Prathama' },
        yogini: { dasha: 'Siddha' }
      });
    }
    return Promise.resolve({});
  }),
}));

// Mock ProfileContext — hooks internally call useProfile()
vi.mock('../../lib/ProfileContext', () => ({
  useProfile: vi.fn(() => ({
    settings: { ayanamsaSystem: 'lahiri', houseSystem: 'whole_sign' },
    activeProfile: null,
    loading: false,
  })),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useProfiles', () => {
  it('returns empty array when userId is null', () => {
    const { result } = renderHook(() => useProfiles(null), {
      wrapper: createWrapper(),
    });
    // Should not fetch, enabled: false
    expect(result.current.data).toEqual(undefined);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns profiles when userId is provided', async () => {
    const { result } = renderHook(() => useProfiles('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].name).toBe('Test User');
  });
});

describe('useAstroData', () => {
  it('returns undefined when profile is null (disabled query)', () => {
    const { result } = renderHook(() => useAstroData(null), {
      wrapper: createWrapper(),
    });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('returns insights for a valid profile', async () => {
    const profile = {
      id: 'p1',
      dob_date: '1990-01-01',
      dob_time: '06:00',
      latitude: 19.076,
      longitude: 72.877,
      timezone_offset: 5.5,
    };

    const { result } = renderHook(
      () => useAstroData(profile, new Date('2026-03-20T12:00:00Z')),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data.dailyOutlook).toBeDefined();
    expect(result.current.data.tithi).toBeDefined();
  });
});

describe('useChartData', () => {
  it('returns undefined when profile is null', () => {
    const { result } = renderHook(() => useChartData(null), {
      wrapper: createWrapper(),
    });
    expect(result.current.data).toBeUndefined();
  });

  it('calculates chart data with valid planet positions', async () => {
    const profile = {
      id: 'p1',
      dob_date: '1990-01-01',
      dob_time: '06:00',
      latitude: 19.076,
      longitude: 72.877,
      timezone_offset: 5.5,
    };

    const { result } = renderHook(
      () => useChartData(profile),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const data = result.current.data;
    expect(data.positions).toBeDefined();
    expect(data.ascendant).toBeDefined();
    expect(data.dashaTimeline).toBeDefined();

    // All planet positions should have valid longitudes
    Object.values(data.positions).forEach(planet => {
      expect(planet.longitude).not.toBeNaN();
      expect(planet.sign).toBeGreaterThanOrEqual(0);
      expect(planet.sign).toBeLessThanOrEqual(11);
    });
  });
});
