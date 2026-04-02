import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Compare from '../Compare';
import { useProfile } from '../../lib/ProfileContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Fix IntersectionObserver for Framer Motion
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock animation components to just render children
vi.mock('../../lib/animations', () => ({
  PageTransition: ({ children }) => <div data-testid="page-transition">{children}</div>,
  FadeUp: ({ children }) => <div data-testid="fade-up">{children}</div>,
  SlideIn: ({ children }) => <div data-testid="slide-in">{children}</div>,
  StaggerParent: ({ children }) => <div data-testid="stagger-parent">{children}</div>,
  StaggerChild: ({ children }) => <div data-testid="stagger-child">{children}</div>,
}));

vi.mock('../../lib/ProfileContext', () => ({
    useProfile: vi.fn()
}));

// Mock framer-motion to avoid animation issues
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

vi.mock('../../hooks/useAstro', () => ({
  useProfiles: vi.fn(() => ({ data: [
    { id: '1', name: 'User A', dob_date: '1990-01-01', dob_time: '06:00' },
    { id: '2', name: 'User B', dob_date: '1995-10-01', dob_time: '12:00' }
  ], isLoading: false })),
  useChartData: vi.fn((p) => {
    if (p?.id === '1') {
      return { 
        data: {
          positions: { Sun: { longitude: 10, sign: 0 }, Moon: { longitude: 40, sign: 1 } },
          ascendant: { longitude: 5, sign: 0 },
          currentDasha: { maha: { planet: 'Sun' } }
        },
        isLoading: false 
      };
    }
    if (p?.id === '2') {
      return {
        data: {
          positions: { Sun: { longitude: 10, sign: 0 }, Moon: { longitude: 200, sign: 7 } },
          ascendant: { longitude: 50, sign: 1 },
          currentDasha: { maha: { planet: 'Moon' } }
        },
        isLoading: false
      };
    }
    return { data: null, isLoading: false };
  }),
  getChartData: vi.fn((p) => Promise.resolve({
    positions: { Sun: { longitude: 10, sign: 0 } },
    ascendant: { longitude: 5, sign: 0 },
    currentDasha: { maha: { planet: 'Sun' } }
  }))
}));

vi.mock('../../hooks/useTitle', () => ({ useTitle: vi.fn() }));

// 2. Mock larger child components to simplify
vi.mock('../../components/Chart/NorthChart', () => ({
  default: () => <div data-testid="north-chart">NorthChart</div>
}));

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      retry: false,
      staleTime: Infinity,
    } 
  }
});

const mockContext = {
  activeProfile: { id: '1', name: 'User A' },
  loading: false
};

describe('Compare Page', () => {
  beforeEach(() => {
    useProfile.mockReturnValue(mockContext);
    queryClient.setQueryData(['chartData', '1'], {
      positions: { Sun: { longitude: 10, sign: 0 }, Moon: { longitude: 40, sign: 1 } },
      ascendant: { longitude: 5, sign: 0 },
      currentDasha: { maha: { planet: 'Sun' } }
    });
    queryClient.setQueryData(['chartData', '2'], {
      positions: { Sun: { longitude: 10, sign: 0 }, Moon: { longitude: 200, sign: 7 } },
      ascendant: { longitude: 50, sign: 1 },
      currentDasha: { maha: { planet: 'Moon' } }
    });
  });

  it('renders dual selectors and charts', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Compare />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Cosmic Comparison')).toBeDefined();
    const charts = await screen.findAllByTestId('north-chart');
    expect(charts).toHaveLength(2);
    expect(screen.getAllByText('User A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('User B').length).toBeGreaterThan(0);
  });
});
