import { Client } from 'langsmith';

// Initialize the LangSmith client
export const langsmithClient = new Client({
  apiUrl: process.env.LANGSMITH_API_URL,
  apiKey: process.env.LANGSMITH_API_KEY,
});

// Project name for tracing
export const LANGSMITH_PROJECT = process.env.LANGSMITH_PROJECT || 'fastdesk-ai-notes';

// Enable tracing in development/staging environments
export const ENABLE_TRACING = process.env.ENABLE_LANGSMITH_TRACING === 'true'; 