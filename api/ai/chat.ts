import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getChatModel } from '../config/openai';
import { ChatRequest, chatRequestSchema, ChatResponse, ErrorResponse } from '../types/openai';
import type { ChatOpenAICallOptions } from '@langchain/openai';

// Helper function to send error response
function sendError(res: VercelResponse, status: number, error: string, code: string) {
  return res.status(status).json({ error, code } as ErrorResponse);
}

// Export the handler function directly
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production'
    ? 'https://fast-desk-psi.vercel.app'
    : 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate HTTP method
    if (req.method !== 'POST') {
      return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return sendError(res, 500, 'OpenAI API key is not configured', 'OPENAI_CONFIG_ERROR');
    }

    // Validate request body
    const validatedData = chatRequestSchema.parse(req.body) as ChatRequest;
    if (!validatedData.messages || validatedData.messages.length === 0) {
      return sendError(res, 400, 'Messages array cannot be empty', 'INVALID_REQUEST');
    }

    // Get the chat model instance
    const chatModel = getChatModel();

    // Call OpenAI with the validated messages
    const response = await chatModel.call(validatedData.messages, {
      temperature: validatedData.temperature ?? 0.7,
      maxTokens: validatedData.maxTokens ?? 500,
    } as ChatOpenAICallOptions);

    if (!response || !response.content) {
      return sendError(res, 500, 'Invalid response from OpenAI', 'OPENAI_RESPONSE_ERROR');
    }

    const chatResponse: ChatResponse = {
      content: response.content.toString(),
      role: 'assistant',
    };

    return res.status(200).json(chatResponse);
  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'ZodError') {
        return sendError(res, 400, 'Invalid request format', 'VALIDATION_ERROR');
      }
      if (error.name === 'OpenAIConfigError') {
        return sendError(res, 500, error.message, 'OPENAI_CONFIG_ERROR');
      }
      return sendError(res, 500, error.message, 'INTERNAL_SERVER_ERROR');
    }
    
    return sendError(res, 500, 'An unexpected error occurred', 'INTERNAL_SERVER_ERROR');
  }
} 