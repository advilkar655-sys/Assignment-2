import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

// Mock fetch for Gemini API
globalThis.fetch = vi.fn(() =>
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
  // Vitest 1.x allows vi.stubEnv to mock import.meta.env
  vi.stubEnv('VITE_GEMINI_API_KEY', 'test_key');
  
  // As a fallback for some Vite versions:
  Object.defineProperty(import.meta, 'env', {
    value: { VITE_GEMINI_API_KEY: 'test_key' },
    configurable: true
  });

  it('renders the main dashboard with header', () => {
    render(<App />);
    expect(screen.getByText('DemocracyAI')).toBeInTheDocument();
    expect(screen.getByText(/Your interactive election guide/i)).toBeInTheDocument();
  });

  it('renders the initial bot message', () => {
    render(<App />);
    expect(screen.getByText(/Hello! I am your Election Process Assistant/i)).toBeInTheDocument();
  });

  it('allows user to send a message and updates UI to loading state', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Ask about the election process...');
    const submitBtn = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: 'How does the primary work?' } });
    fireEvent.click(submitBtn);

    // After clicking send, the user message should appear in log
    expect(screen.getByText('How does the primary work?')).toBeInTheDocument();
  });

  it('renders Timeline and Quiz modules in side panel', async () => {
    render(<App />);
    expect(await screen.findByText('Election Timeline')).toBeInTheDocument();
    expect(await screen.findByText('Knowledge Quiz')).toBeInTheDocument();
  });
});
