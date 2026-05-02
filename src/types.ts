/**
 * @fileoverview Shared TypeScript types for the DemocracyAI application.
 */

/** Represents a single message in the chat conversation. */
export interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  options?: string[]; // Quick reply suggestions
}

/** A single turn in the Gemini API conversation history. */
export interface ConversationTurn {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

/** The response structure returned by the Gemini API. */
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

/** Props for the ErrorBoundary component. */
export interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

/** State for the ErrorBoundary component. */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
