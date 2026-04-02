import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ErrorBoundary Component Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Component that throws during render
function ThrowingChild({ shouldThrow }) {
  if (shouldThrow) throw new Error('Test explosion');
  return <div>Safe child content</div>;
}

describe('ErrorBoundary', () => {
  // Suppress React's console error output during intentional error testing
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe child content')).toBeInTheDocument();
  });

  it('catches error and shows fallback UI with error message', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Unexpected Cosmic Shift/i)).toBeInTheDocument();
    expect(screen.getByText('Test explosion')).toBeInTheDocument();
  });

  it('shows "Return to Base" button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>
    );
    const btn = screen.getByText(/Return to Base/i);
    expect(btn).toBeInTheDocument();
  });
});
