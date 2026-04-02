import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileCard from '../ProfileCard';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ProfileCard Component Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MOCK_PROFILE = {
  id: 'p-1',
  name: 'Sanskar Sontakke',
  dob_date: '1990-01-01',
  dob_time: '06:00',
  latitude: 19.076,
  longitude: 72.877,
};

// Mock framer-motion to avoid animation issues in tests
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

describe('ProfileCard', () => {
  it('renders profile name and DOB', () => {
    render(<ProfileCard profile={MOCK_PROFILE} />);
    expect(screen.getByText('Sanskar Sontakke')).toBeInTheDocument();
    expect(screen.getByText('1990-01-01')).toBeInTheDocument();
  });

  it('renders initials in avatar', () => {
    render(<ProfileCard profile={MOCK_PROFILE} />);
    expect(screen.getByText('SA')).toBeInTheDocument();
  });

  it('renders null when profile is null', () => {
    const { container } = render(<ProfileCard profile={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<ProfileCard profile={MOCK_PROFILE} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Sanskar Sontakke'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('displays coordinates', () => {
    render(<ProfileCard profile={MOCK_PROFILE} />);
    expect(screen.getByText('19.08, 72.88')).toBeInTheDocument();
  });

  it('calls onExport when export button is clicked', () => {
    const onExport = vi.fn();
    render(<ProfileCard profile={MOCK_PROFILE} onExport={onExport} />);
    
    const exportBtn = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportBtn);
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('calls onShare when share button is clicked', () => {
    const onShare = vi.fn();
    render(<ProfileCard profile={MOCK_PROFILE} onShare={onShare} />);
    
    const shareBtn = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareBtn);
    expect(onShare).toHaveBeenCalledTimes(1);
  });
});
