/**
 * @fileoverview Root application component for DemocracyAI Election Assistant.
 * Manages chat state, user authentication, and renders the main UI layout.
 */

import { useState, useCallback, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { signInDemoUser } from './firebase';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useGemini } from './hooks/useGemini';
import type { Message, ConversationTurn } from './types';
import {
  INITIAL_MESSAGE,
  MAX_INPUT_LENGTH,
  FEEDBACK_FORM_URL,
  GOOGLE_CALENDAR_URL,
  ELECTION_OFFICE_MAPS_URL,
} from './constants';

// Code-split side panel modules for optimal initial load performance
const TimelineWidget = lazy(() =>
  import('./components/TimelineWidget').then((m) => ({ default: m.TimelineWidget }))
);
const QuizModule = lazy(() =>
  import('./components/QuizModule').then((m) => ({ default: m.QuizModule }))
);

/**
 * Main application component. Handles the chat interface, message state,
 * accessibility announcements, and layout for the election assistant.
 */
function App() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [a11yAnnounce, setA11yAnnounce] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom hook abstracts all Gemini API communication
  const { isLoading: isTyping, sendMessage } = useGemini();

  /** Firebase anonymous sign-in on mount for Google Services integration. */
  useEffect(() => {
    signInDemoUser().catch(console.error);
  }, []);

  /**
   * Smoothly scrolls the chat window to the latest message.
   * Uses `block: 'nearest'` to avoid scrolling the outer page.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isTyping]);

  /**
   * Builds the Gemini-formatted conversation history from the local messages state.
   * Memoized to avoid recomputation on every unrelated render.
   */
  const conversationHistory = useMemo<ConversationTurn[]>(() =>
    messages.slice(1).map((m) => ({
      role: m.sender === 'bot' ? 'model' : 'user',
      parts: [{ text: m.text }],
    })),
    [messages]
  );

  /**
   * Handles sending a user message: sanitizes input, updates state, and
   * calls the Gemini API with full conversation context for memory.
   * @param rawText - The raw user input text to be sanitized and sent.
   */
  const handleSendMessage = useCallback(async (rawText: string) => {
    const text = DOMPurify.sanitize(rawText.trim());
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setA11yAnnounce('DemocracyAI is typing...');

    // Build history including the new user message for the API call
    const historyWithNewMsg: ConversationTurn[] = [
      ...conversationHistory,
      { role: 'user', parts: [{ text }] },
    ];

    try {
      const botText = await sendMessage(historyWithNewMsg);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setA11yAnnounce('DemocracyAI responded.');
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'Unknown error occurred.';
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `⚠️ Error: ${errorText}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setA11yAnnounce('An error occurred.');
    } finally {
      // Return focus to input without scrolling the page
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
    }
  }, [conversationHistory, sendMessage]);

  /** Handles the chat form submission event. */
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  }, [handleSendMessage, inputText]);

  return (
    <ErrorBoundary>
      <div className={`app-container ${isHighContrast ? 'high-contrast' : ''}`}>

        {/* Screen reader live region for dynamic announcements */}
        <div aria-live="polite" aria-atomic="true" className="visually-hidden" role="status">
          {a11yAnnounce}
        </div>

        {/* ── Header ── */}
        <header className="glass-panel main-header">
          <div className="header-content">
            <div className="logo-area">
              <h1>DemocracyAI</h1>
              <p>Your interactive election guide</p>
            </div>
            <div className="header-actions">
              <button
                className="btn btn-glass"
                aria-label="Toggle High Contrast Mode"
                onClick={() => setIsHighContrast((prev) => !prev)}
                aria-pressed={isHighContrast}
              >
                <span aria-hidden="true">🌓</span> Contrast
              </button>
              <div id="google_translate_element" aria-label="Google Translate" />
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="main-content">

          {/* Chat Interface */}
          <section className="chat-interface glass-panel" aria-label="Chat with DemocracyAI">
            <div className="chat-messages" role="log" aria-live="polite" aria-label="Conversation history">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                  <div className={`message-bubble animate-fade-in ${msg.sender}`}>
                    <p dangerouslySetInnerHTML={{ __html: msg.text }} />
                  </div>
                  {msg.sender === 'bot' && msg.options && (
                    <div className="quick-replies animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          className="btn btn-glass btn-sm"
                          onClick={() => handleSendMessage(opt)}
                          aria-label={`Quick reply: ${opt}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="message-wrapper bot" aria-label="Bot is typing">
                  <div className="message-bubble animate-fade-in typing-indicator">
                    <p>DemocracyAI is typing...</p>
                  </div>
                </div>
              )}
              {/* Scroll anchor — keeps the latest message in view */}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <form onSubmit={handleFormSubmit} className="input-form" noValidate>
                <label htmlFor="chatInput" className="visually-hidden">
                  Ask a question about elections
                </label>
                <input
                  id="chatInput"
                  ref={inputRef}
                  type="text"
                  className="input-field"
                  placeholder="Ask about the election process..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isTyping}
                  maxLength={MAX_INPUT_LENGTH}
                  aria-disabled={isTyping}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isTyping || !inputText.trim()}
                  aria-label="Send message"
                >
                  Send
                </button>
              </form>
            </div>
          </section>

          {/* Side Panel */}
          <aside className="side-panel glass-panel" aria-label="Interactive election modules">
            <h2>Interactive Modules</h2>

            <div className="module-card">
              <Suspense fallback={<div className="glass-panel" style={{ padding: '1rem' }}>Loading Timeline...</div>}>
                <TimelineWidget />
              </Suspense>
            </div>

            <div className="module-card">
              <Suspense fallback={<div className="glass-panel" style={{ padding: '1rem' }}>Loading Quiz...</div>}>
                <QuizModule />
              </Suspense>
            </div>

            {/* Google Calendar Integration */}
            <div className="module-card">
              <h3>📅 Election Calendar</h3>
              <p>Stay updated with upcoming election dates and deadlines.</p>
              <a
                href={GOOGLE_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass"
                aria-label="Open election calendar in Google Calendar"
              >
                Open in Google Calendar
              </a>
            </div>

            {/* Google Maps Integration */}
            <div className="module-card">
              <h3>🗺️ Election Commission</h3>
              <p>Find the Election Commission of India headquarters.</p>
              <iframe
                title="Election Commission of India on Google Maps"
                src={ELECTION_OFFICE_MAPS_URL}
                width="100%"
                height="180"
                style={{ border: 0, borderRadius: '8px', marginTop: '0.5rem' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Google Forms Feedback */}
            <div className="module-card">
              <h3>💬 Feedback</h3>
              <p>Help us improve DemocracyAI by sharing your thoughts.</p>
              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass"
                aria-label="Share feedback via Google Forms"
              >
                Share Feedback
              </a>
            </div>
          </aside>

        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
