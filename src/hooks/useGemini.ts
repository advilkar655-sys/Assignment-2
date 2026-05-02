/**
 * @fileoverview Custom React hook for interacting with the Gemini generative AI API.
 * Encapsulates all API communication logic, keeping components clean.
 */

import { useState, useCallback } from 'react';
import DOMPurify from 'dompurify';
import type { ConversationTurn, GeminiResponse } from '../types';
import { GEMINI_API_BASE, GEMINI_MODEL, SYSTEM_INSTRUCTION } from '../constants';

interface UseGeminiResult {
  /** Whether the API is currently processing a request. */
  isLoading: boolean;
  /** The last error message, if any. */
  error: string | null;
  /** Sends a message and returns the sanitized bot response text. */
  sendMessage: (history: ConversationTurn[]) => Promise<string>;
}

/**
 * Custom hook to abstract all Gemini API calls.
 * @returns {UseGeminiResult} Loading state, error state, and sendMessage function.
 */
export function useGemini(): UseGeminiResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (history: ConversationTurn[]): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing VITE_GEMINI_API_KEY. Please configure the environment variable.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        system_instruction: { parts: { text: SYSTEM_INSTRUCTION } },
        contents: history,
      };

      const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: HTTP ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'I was unable to process that request.';

      // Sanitize the AI-generated output before returning it
      return DOMPurify.sanitize(rawText);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, sendMessage };
}
