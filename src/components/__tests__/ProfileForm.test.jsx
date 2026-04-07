import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileForm from '../ProfileForm';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ProfileForm Component Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Mock dependencies that require Providers
vi.mock('../../lib/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

vi.mock('../../lib/animations', () => ({
  StaggerParent: ({ children }) => <div>{children}</div>,
  StaggerChild: ({ children }) => <div>{children}</div>,
}));

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

const EXISTING_PROFILE = {
  id: 'p-edit',
  name: 'Existing User',
  dob_date: '1995-06-15',
  dob_time: '14:30',
  latitude: 28.6139,
  longitude: 77.209,
  timezone_offset: 5.5,
};

describe('ProfileForm', () => {
  it('renders all required fields', () => {
    render(<ProfileForm userId="user-1" />);
    expect(screen.getByLabelText(/Identity Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arrival Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arrival Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Origin City/i)).toBeInTheDocument();
  });

  it('submit button is disabled when lat/lon are not set', () => {
    render(<ProfileForm userId="user-1" />);
    const submitBtn = screen.getByRole('button', { name: /Create Record/i });
    expect(submitBtn).toBeDisabled();
  });

  it('pre-fills fields when editing an existing profile', () => {
    render(<ProfileForm userId="user-1" profile={EXISTING_PROFILE} />);
    const nameInput = screen.getByLabelText(/Identity Name/i);
    expect(nameInput.value).toBe('Existing User');
  });

  it('shows "Update Record" text when editing', () => {
    render(<ProfileForm userId="user-1" profile={EXISTING_PROFILE} />);
    expect(screen.getByText(/Update Record/i)).toBeInTheDocument();
  });
});
