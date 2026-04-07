import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicChart from '../PublicChart';
import { describe, it, expect, vi } from 'vitest';

// Fix IntersectionObserver for Framer Motion
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { name: 'Public User', dob_date: '1995-10-01', id: 'u1' }, 
            error: null 
          }))
        }))
      }))
    }))
  }
}));

// Mock Astro hook
vi.mock('../../hooks/useAstro', () => ({
  getChartData: vi.fn(() => Promise.resolve({
    positions: { Sun: { longitude: 10, sign: 0 } },
    ascendant: { longitude: 5, sign: 0 },
    currentDasha: { maha: { planet: 'Sun' } },
    yogas: []
  }))
}));

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: new Proxy({}, {
      get: (_, tag) => {
        return ({ children, ...props }) => {
          const Tag = typeof tag === 'string' ? tag : 'div';
          return <Tag {...props}>{children}</Tag>;
        };
      },
    }),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

describe('PublicChart Page', () => {
  it('loads and displays a shared chart', async () => {
    render(
      <MemoryRouter initialEntries={['/chart/test-slug']}>
        <Routes>
          <Route path="/chart/:slug" element={<PublicChart />} />
        </Routes>
      </MemoryRouter>
    );

    // Initial state
    expect(screen.getByText(/Synchronizing Public Archive/i)).toBeInTheDocument();

    // Async state after fetch
    const userName = await screen.findByText('Public User');
    expect(userName).toBeInTheDocument();
  });
});
