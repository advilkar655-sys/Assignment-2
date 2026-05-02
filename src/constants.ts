/**
 * @fileoverview Application-wide constants for DemocracyAI.
 * Centralizing these values improves maintainability and testability.
 */

import type { Message } from './types';

/** Maximum number of characters allowed in the chat input. */
export const MAX_INPUT_LENGTH = 500;

/** The Gemini model to use for generating responses. */
export const GEMINI_MODEL = 'gemini-2.5-flash';

/** Base URL for the Gemini API. */
export const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/** System instruction sent to the AI on every request. */
export const SYSTEM_INSTRUCTION =
  'You are DemocracyAI, an interactive and easy-to-follow assistant that educates users ' +
  'about the election process. Provide clear explanations of election timelines, key steps, ' +
  'and relevant information. Keep answers under 150 words and use markdown for readability. ' +
  'Focus on explaining the process factually.';

/** The welcome message shown when the user first opens the app. */
export const INITIAL_MESSAGE: Message = {
  id: 'msg-1',
  sender: 'bot',
  text: 'Hello! I am your Election Process Assistant. I can help you understand how elections work, starting with voter registration all the way to how votes are counted. What would you like to learn about?',
  timestamp: new Date(),
  options: ['Indian Election Process', 'General Voting Steps', 'Test my knowledge (Quiz)'],
};

/** Google Calendar link for upcoming Indian election dates. */
export const GOOGLE_CALENDAR_URL =
  'https://calendar.google.com/calendar/r?cid=en.indian%23holiday%40group.v.calendar.google.com';

/** Google Feedback Form URL. */
export const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfLEE3CJi4tf1-hhq6A-GFF-z3bYFasAmJFJyXBjm0dW7ntDQ/viewform';

/** Google Maps embed URL for Election Commission of India headquarters. */
export const ELECTION_OFFICE_MAPS_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.8999!2d77.2090!3d28.6353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sElection%20Commission%20of%20India!5e0!3m2!1sen!2sin!4v1620000000000';
