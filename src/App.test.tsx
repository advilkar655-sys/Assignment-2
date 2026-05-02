/**
 * @fileoverview Integration tests for the main App component.
 * Tests cover rendering, user interaction, accessibility, and security.
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

// Must be at module top-level so Vitest hoists it correctly
vi.mock('./firebase', () => ({
  signInDemoUser: vi.fn().mockResolvedValue(true),
}));

vi.mock('./hooks/useGemini', () => ({
  useGemini: () => ({
    isLoading: false,
    error: null,
    sendMessage: vi.fn().mockResolvedValue('This is a mocked bot response.'),
  }),
}));

vi.stubEnv('VITE_GEMINI_API_KEY', 'test_key');

// --- Tests ---

describe('DemocracyAI App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the main header with app name and tagline', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'DemocracyAI' })).toBeInTheDocument();
    expect(screen.getByText(/Your interactive election guide/i)).toBeInTheDocument();
  });

  it('renders the initial bot welcome message', () => {
    render(<App />);
    expect(
      screen.getByText(/Hello! I am your Election Process Assistant/i)
    ).toBeInTheDocument();
  });

  it('renders the quick reply options in the initial message', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Quick reply: Indian Election Process/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quick reply: General Voting Steps/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quick reply: Test my knowledge/i })).toBeInTheDocument();
  });

  it('renders all Google Service integrations', async () => {
    render(<App />);
    expect(await screen.findByText('📅 Election Calendar')).toBeInTheDocument();
    expect(await screen.findByText('🗺️ Election Commission')).toBeInTheDocument();
    expect(await screen.findByText('💬 Feedback')).toBeInTheDocument();
    expect(screen.getByTitle('Election Commission of India on Google Maps')).toBeInTheDocument();
  });

  // ── Accessibility ──────────────────────────────────────────────────────────

  it('has a visually-hidden live region for screen reader announcements', () => {
    render(<App />);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('has the correct aria-label on the chat input', () => {
    render(<App />);
    expect(screen.getByLabelText(/Ask a question about elections/i)).toBeInTheDocument();
  });

  it('high contrast toggle button has aria-pressed attribute', () => {
    render(<App />);
    const contrastBtn = screen.getByRole('button', { name: /Toggle High Contrast Mode/i });
    expect(contrastBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles high contrast mode when the contrast button is clicked', () => {
    render(<App />);
    const contrastBtn = screen.getByRole('button', { name: /Toggle High Contrast Mode/i });
    fireEvent.click(contrastBtn);
    expect(contrastBtn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(contrastBtn);
    expect(contrastBtn).toHaveAttribute('aria-pressed', 'false');
  });

  // ── User Interaction ───────────────────────────────────────────────────────

  it('send button is disabled when the input is empty', () => {
    render(<App />);
    const sendBtn = screen.getByRole('button', { name: /Send message/i });
    expect(sendBtn).toBeDisabled();
  });

  it('send button becomes enabled when the user types in the input', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about the election process/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(screen.getByRole('button', { name: /Send message/i })).not.toBeDisabled();
  });

  it('adds the user message to the chat when the form is submitted', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about the election process/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'How does voting work?' } });
      fireEvent.submit(input.closest('form')!);
    });
    expect(screen.getByText('How does voting work?')).toBeInTheDocument();
  });

  it('clears the input field after a message is sent', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about the election process/i) as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Clear this' } });
      fireEvent.submit(input.closest('form')!);
    });
    expect(input.value).toBe('');
  });

  it('shows the bot response in the chat after sending', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about the election process/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'How does the primary work?' } });
      fireEvent.submit(input.closest('form')!);
    });
    expect(await screen.findByText('This is a mocked bot response.')).toBeInTheDocument();
  });

  // ── Security ───────────────────────────────────────────────────────────────

  it('enforces maxLength on the chat input', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about the election process/i);
    expect(input).toHaveAttribute('maxLength', '500');
  });

  it('renders lazy modules in the side panel', async () => {
    render(<App />);
    expect(await screen.findByText('Election Timeline', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByText('Knowledge Quiz', {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
