import { ChatOpenAI } from '@langchain/openai';

// Constants for OpenAI configuration
export const OPENAI_CONFIG = {
  DEFAULT_MODEL: 'gpt-4-turbo-preview',
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

// Initialize shared ChatOpenAI instance
function createChatModel() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('OpenAI API key is not configured');
    throw new OpenAIConfigError('OpenAI API key is not configured. Please check your environment variables.');
  }

  try {
    return new ChatOpenAI({
      modelName: OPENAI_CONFIG.DEFAULT_MODEL,
      temperature: OPENAI_CONFIG.DEFAULT_TEMPERATURE,
      maxTokens: OPENAI_CONFIG.DEFAULT_MAX_TOKENS,
      openAIApiKey: apiKey,
    });
  } catch (error) {
    console.error('Failed to initialize ChatOpenAI:', error);
    throw new OpenAIConfigError('Failed to initialize OpenAI client. Please check your configuration.');
  }
}

// Lazy-loaded instances
let _chatModel: ChatOpenAI | null = null;
let _parserModel: ChatOpenAI | null = null;

// Export getter functions for models
export function getChatModel() {
  if (!_chatModel) {
    _chatModel = createChatModel();
  }
  return _chatModel;
}

export function getParserModel() {
  if (!_parserModel) {
    _parserModel = new ChatOpenAI({
      modelName: OPENAI_CONFIG.DEFAULT_MODEL,
      temperature: 0,
      maxTokens: OPENAI_CONFIG.DEFAULT_MAX_TOKENS,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _parserModel;
}

// Export type for OpenAI response
export type OpenAIResponse = Awaited<ReturnType<typeof getChatModel>>; 