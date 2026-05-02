import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

// Mock fetch for Gemini API
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      candidates: [{
        content: {
          parts: [{ text: "This is a mocked bot response." }]
        }
      }]
    })
  })
) as any;

describe('DemocracyAI App', () => {
  it('renders the main dashboard with header', () => {
    render(<App />);
    expect(screen.getByText('DemocracyAI')).toBeInTheDocument();
    expect(screen.getByText(/Your interactive election guide/i)).toBeInTheDocument();
  });

  it('renders the initial bot message', () => {
    render(<App />);
    expect(screen.getByText(/Hello! I am your Election Process Assistant/i)).toBeInTheDocument();
  });

  it('allows user to send a message and receive bot response', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Ask about the election process...');
    const submitBtn = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: 'How does the primary work?' } });
    fireEvent.click(submitBtn);

    // After clicking send, the user message should appear in log
    expect(screen.getByText('How does the primary work?')).toBeInTheDocument();
    
    // Wait for the mocked bot response to appear
    await waitFor(() => {
      expect(screen.getByText('This is a mocked bot response.')).toBeInTheDocument();
    });
  });

  it('renders Timeline and Quiz modules in side panel', () => {
    render(<App />);
    expect(screen.getByText('Election Timeline')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Quiz')).toBeInTheDocument();
  });
});
