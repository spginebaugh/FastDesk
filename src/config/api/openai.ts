import { ChatRequest, ChatResponse, ParseRequest, ParseResponse } from '../../../api/types/openai';

const API_BASE_URL = '/api/ai';

class APIError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    throw new APIError(data.code, data.error);
  }
  return data;
}

export const openAIClient = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return handleResponse(response);
  },

  async parse<T = any>(request: ParseRequest): Promise<ParseResponse<T>> {
    const response = await fetch(`${API_BASE_URL}/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return handleResponse(response);
  },
}; 