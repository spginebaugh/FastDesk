import { Client } from 'langsmith'

// Initialize the LangSmith client
export const langsmithClient = new Client({
  apiUrl: import.meta.env.VITE_LANGSMITH_API_URL,
  apiKey: import.meta.env.VITE_LANGSMITH_API_KEY,
})

// Project name for tracing
export const LANGSMITH_PROJECT = import.meta.env.VITE_LANGSMITH_PROJECT || 'fastdesk-ai-notes'

// Enable tracing in development/staging environments
export const ENABLE_TRACING = import.meta.env.VITE_ENABLE_LANGSMITH_TRACING === 'true' 