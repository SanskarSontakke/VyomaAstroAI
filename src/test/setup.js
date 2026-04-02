import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock CalculationContext to prevent provider errors in unit tests
vi.mock('../lib/CalculationContext', () => ({
  useCalculation: () => ({
    isCalculating: false,
    progress: 0,
    currentTask: '',
    startCalculation: vi.fn(),
    updateProgress: vi.fn(),
    endCalculation: vi.fn(),
  }),
  CalculationProvider: ({ children }) => children
}));

// Mock import.meta.env for Supabase
if (typeof import.meta.env === 'undefined') {
  global.import = { meta: { env: {} } };
}
import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  },
}));

// Mock Worker for tests
window.Worker = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  postMessage: vi.fn(),
  terminate: vi.fn(),
}));


