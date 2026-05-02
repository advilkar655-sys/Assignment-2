import { useState, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import DOMPurify from 'dompurify';
import { signInDemoUser } from './firebase';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

const TimelineWidget = lazy(() => import('./components/TimelineWidget').then(module => ({ default: module.TimelineWidget })));
const QuizModule = lazy(() => import('./components/QuizModule').then(module => ({ default: module.QuizModule })));

// Type definitions for our conversational UI
type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  options?: string[]; // Quick replies
};

const INITIAL_MESSAGE: Message = {
  id: 'msg-1',
  sender: 'bot',
  text: 'Hello! I am your Election Process Assistant. I can help you understand how elections work, starting with voter registration all the way to how votes are counted. What would you like to learn about?',
  timestamp: new Date(),
  options: ['Indian Election Process', 'General Voting Steps', 'Test my knowledge (Quiz)'],
};

function App() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');

  const [isTyping, setIsTyping] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [a11yAnnounce, setA11yAnnounce] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Authenticate user anonymously for analytics/features
    signInDemoUser().catch(console.error);
  }, []);

  const handleSendMessage = useCallback(async (rawText: string) => {
    const text = DOMPurify.sanitize(rawText);
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
      setA11yAnnounce('DemocracyAI is typing...');

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("Missing VITE_GEMINI_API_KEY in environment variables. Please add it to your .env file.");
        }

        const systemInstruction = "You are DemocracyAI, an interactive and easy-to-follow assistant that educates users about the election process. Provide clear explanations of election timelines, key steps, and relevant information. Keep answers under 150 words and use markdown for readability. Focus on explaining the process factually.";
        
        // Map local messages to Gemini conversation history format, skipping initial welcome message
        const conversationHistory = prev.slice(1).map(m => ({
          role: m.sender === 'bot' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));
        
        // Add current user prompt
        conversationHistory.push({ role: "user", parts: [{ text }] });

        const payload = {
          system_instruction: { parts: { text: systemInstruction } },
          contents: conversationHistory
        };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
         throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const botResponseText = DOMPurify.sanitize(data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to process that request.");

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Error connecting to AI: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((curr) => [...curr, errorMsg]);
      setA11yAnnounce('Error connecting to AI');
    } finally {
      setIsTyping(false);
      // Auto-focus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className={`app-container ${isHighContrast ? 'high-contrast' : ''}`}>
        <div aria-live="polite" className="visually-hidden" role="status">
          {a11yAnnounce}
        </div>
      {/* Header Area */}
      <header className="glass-panel main-header">
        <div className="header-content">
          <div className="logo-area">
             <h1>DemocracyAI</h1>
             <p>Your interactive election guide</p>
          </div>
          <div className="header-actions">
            <button 
               className="btn btn-glass" 
               aria-label="Toggle High Contrast"
               onClick={() => setIsHighContrast(!isHighContrast)}
               aria-pressed={isHighContrast}
            >
               <span aria-hidden="true">🌓</span> Contrast
            </button>
            <div id="google_translate_element"></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
         
         {/* Chat Interface */}
         <section className="chat-interface glass-panel">
            <div className="chat-messages" role="log" aria-live="polite">
               {messages.map((msg) => (
                 <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                    <div className="message-bubble animate-fade-in">
                       <p dangerouslySetInnerHTML={{ __html: msg.text }}></p>
                    </div>
                    {msg.sender === 'bot' && msg.options && (
                      <div className="quick-replies animate-fade-in" style={{ animationDelay: '0.3s'}}>
                         {msg.options.map(opt => (
                           <button 
                             key={opt}
                             className="btn btn-glass btn-sm"
                             onClick={() => handleSendMessage(opt)}
                           >
                             {opt}
                           </button>
                         ))}
                      </div>
                    )}
                 </div>
               ))}
               {isTyping && (
                 <div className="message-wrapper bot">
                    <div className="message-bubble animate-fade-in" style={{ padding: '0.8rem', fontStyle: 'italic', background: 'transparent', border: 'none' }}>
                       <p>DemocracyAI is typing...</p>
                    </div>
                 </div>
               )}
            </div>

            <div className="chat-input-area">
               <form 
                 onSubmit={(e) => {
                   e.preventDefault();
                   handleSendMessage(inputText);
                 }}
                 className="input-form"
               >
                  <label htmlFor="chatInput" className="visually-hidden">Ask a question</label>
                  <input 
                    id="chatInput"
                    ref={inputRef}
                    type="text" 
                    className="input-field" 
                    placeholder="Ask about the election process..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isTyping}
                    maxLength={500}
                  />
                  <button type="submit" className="btn btn-primary" disabled={isTyping || !inputText.trim()}>
                    Send
                  </button>
               </form>
            </div>
         </section>

         {/* Side Panel for Timeline/Quiz */}
         <aside className="side-panel glass-panel">
            <h2>Interactive Modules</h2>
            <div className="module-card">
               <Suspense fallback={<div className="glass-panel" style={{padding: '1rem'}}>Loading Timeline...</div>}>
                 <TimelineWidget />
               </Suspense>
            </div>
            <div className="module-card">
               <Suspense fallback={<div className="glass-panel" style={{padding: '1rem'}}>Loading Quiz...</div>}>
                 <QuizModule />
               </Suspense>
            </div>
            <div className="module-card">
               <h3>Feedback</h3>
               <p>Help us improve DemocracyAI by sharing your thoughts.</p>
               <a href="https://docs.google.com/forms/d/e/1FAIpQLSfLEE3CJi4tf1-hhq6A-GFF-z3bYFasAmJFJyXBjm0dW7ntDQ/viewform" target="_blank" rel="noopener noreferrer" className="btn btn-glass">
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
