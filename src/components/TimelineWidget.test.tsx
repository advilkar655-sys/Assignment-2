import { render, screen } from '@testing-library/react';
import { TimelineWidget } from './TimelineWidget';
import { describe, it, expect } from 'vitest';

describe('TimelineWidget', () => {
  it('renders the timeline header', () => {
    render(<TimelineWidget />);
    expect(screen.getByText('Election Timeline')).toBeInTheDocument();
  });

  it('renders the specific stages', () => {
    render(<TimelineWidget />);
    expect(screen.getByText('Voter Registration')).toBeInTheDocument();
    expect(screen.getByText('Election Day')).toBeInTheDocument();
  });
});
