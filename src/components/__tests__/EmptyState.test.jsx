import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EmptyState Component Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('EmptyState', () => {
  it('renders title and subtitle', () => {
    render(<EmptyState title="No Data" subtitle="Nothing to display here." />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('Nothing to display here.')).toBeInTheDocument();
  });

  it('renders action button and fires callback', () => {
    const onAction = vi.fn();
    render(<EmptyState title="Empty" actionLabel="Add Item" onAction={onAction} />);
    const btn = screen.getByText('Add Item');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when actionLabel is omitted', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
