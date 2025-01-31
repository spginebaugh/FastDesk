import { ChatRequest, ChatResponse, ParseRequest, ParseResponse } from '../../../api/types/openai';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://fast-desk-psi.vercel.app/api/ai'
  : 'http://localhost:5174/api/ai';

class APIError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      error: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR'
    }));
    throw new APIError(errorData.code, errorData.error);
  }
  return response.json();
}

export const openAIClient = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      console.error('OpenAI Chat Error:', error);
      throw new APIError('OPENAI_ERROR', error instanceof Error ? error.message : 'Failed to communicate with OpenAI service');
    }
  },

  async parse<T = any>(request: ParseRequest): Promise<ParseResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include',
      });
      return handleResponse(response);
    } catch (error) {
      console.error('OpenAI Parse Error:', error);
      throw new APIError('OPENAI_ERROR', error instanceof Error ? error.message : 'Failed to communicate with OpenAI service');
    }
  },
}; 