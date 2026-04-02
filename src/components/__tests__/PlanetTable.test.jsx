import React from 'react';
import { render, screen } from '@testing-library/react';
import PlanetTable from '../Chart/PlanetTable';
import { describe, it, expect, vi } from 'vitest';

// Fix IntersectionObserver for Framer Motion
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock the ephemeris module
vi.mock('../../lib/astro/ephemeris', () => ({
  getZodiacSign: vi.fn(() => 0),
  getNakshatra: vi.fn(() => ({ name: 'Ashwini', pada: 1 }))
}));

// Mock framer-motion to handle motion.create
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

describe('PlanetTable Component', () => {
  const mockPositions = {
    Sun: { longitude: 10, retrograde: false },
    Moon: { longitude: 40, retrograde: false }
  };
  const mockAscendant = { longitude: 5 };

  it('renders correctly in full mode by default', () => {
    render(<PlanetTable positions={mockPositions} ascendant={mockAscendant} />);
    
    expect(screen.getByText('Entity')).toBeDefined();
    expect(screen.getByText('Sign')).toBeDefined();
    expect(screen.getByText('Degrees')).toBeDefined();
    expect(screen.getByText('Nakshatra')).toBeDefined();
    expect(screen.getByText('Pada')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
  });

  it('hides Degrees, Pada, and Status in mini mode', () => {
    render(<PlanetTable positions={mockPositions} ascendant={mockAscendant} mini />);
    
    expect(screen.getByText('Entity')).toBeDefined();
    expect(screen.getByText('Sign')).toBeDefined();
    expect(screen.queryByText('Degrees')).toBeNull();
    expect(screen.getByText('Nakshatra')).toBeDefined();
    expect(screen.queryByText('Pada')).toBeNull();
    expect(screen.queryByText('Status')).toBeNull();
  });
});
