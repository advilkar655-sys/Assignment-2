/**
 * @fileoverview Unit tests for the useGemini custom hook.
 * Tests cover successful responses, error handling, and loading states.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGemini } from './useGemini';

vi.stubEnv('VITE_GEMINI_API_KEY', 'test_api_key');

describe('useGemini hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with isLoading=false and error=null', () => {
    const { result } = renderHook(() => useGemini());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns sanitized bot text on a successful API call', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Great answer!' }] } }],
      }),
    }) as any;

    const { result } = renderHook(() => useGemini());
    let response = '';
    await act(async () => {
      response = await result.current.sendMessage([{ role: 'user', parts: [{ text: 'Hi' }] }]);
    });
    expect(response).toBe('Great answer!');
  });

  it('throws and sets error on a non-OK API response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    }) as any;

    const { result } = renderHook(() => useGemini());
    await act(async () => {
      await expect(
        result.current.sendMessage([{ role: 'user', parts: [{ text: 'Hi' }] }])
      ).rejects.toThrow('Gemini API Error: HTTP 403 Forbidden');
    });
    expect(result.current.error).toBe('Gemini API Error: HTTP 403 Forbidden');
  });

  it('throws when VITE_GEMINI_API_KEY is missing', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    const { result } = renderHook(() => useGemini());
    await act(async () => {
      await expect(
        result.current.sendMessage([])
      ).rejects.toThrow('Missing VITE_GEMINI_API_KEY');
    });
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test_api_key');
  });
});
