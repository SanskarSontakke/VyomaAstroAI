import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import History from '../History';
import { useProfile } from '../../lib/ProfileContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Fix IntersectionObserver for Framer Motion
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock('../../lib/ProfileContext', () => ({
  useProfile: vi.fn()
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

// 1. Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user1' } } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [
              { id: 'r1', read_date: '2026-03-31', score: 4, title: 'Good', tithi: 'Shukla Navami', maha_dasha: 'Sun' }
            ], error: null }))
          }))
        }))
      }))
    }))
  }
}));

// 2. Mock hooks
vi.mock('../../hooks/useAstro', () => ({
  useProfiles: vi.fn(() => ({ data: [{ id: '1', name: 'User A' }], isLoading: false }))
}));

const queryClient = new QueryClient();

describe('History Page', () => {
  beforeEach(() => {
    useProfile.mockReturnValue({ activeProfile: { id: '1', name: 'User A' } });
  });

  it('renders history grid with aggregated analytics', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <History />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Reading History')).toBeInTheDocument();
    
    // Check for analytics labels
    const avgScore = await screen.findByText('4.0');
    expect(avgScore).toBeInTheDocument();
  });
});
