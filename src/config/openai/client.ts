import OpenAI from 'openai';

// Constants for OpenAI configuration
export const OPENAI_CONFIG = {
  DEFAULT_MODEL: 'gpt-4o-mini',
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 500,
} as const;

// Error class for OpenAI configuration issues
export class OpenAIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIConfigError';
  }
}

// Initialize OpenAI client with error handling
function createOpenAIClient() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIConfigError('OpenAI API key is not configured. Please check your environment variables.');
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: This should be reconsidered for production
  });
}

// Export singleton instance
export const openai = createOpenAIClient();

// Export type for OpenAI response
export type OpenAIResponse = Awaited<ReturnType<typeof openai.chat.completions.create>>; 