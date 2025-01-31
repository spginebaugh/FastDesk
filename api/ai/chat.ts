import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getChatModel } from '../config/openai';
import { ChatRequest, chatRequestSchema, ChatResponse, ErrorResponse } from '../types/openai';
import type { ChatOpenAICallOptions } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

// Helper function to send error response
function sendError(res: VercelResponse, status: number, error: string, code: string) {
  // Use Vercel's error reporting in production
  if (process.env.VERCEL) {
    console.error(new Error(`[${code}] ${error}`));
  } else {
    console.error(`[ERROR] ${code}: ${error}`);
  }
  return res.status(status).json({ error, code } as ErrorResponse);
}

// Convert our message format to LangChain format
function convertToLangChainMessages(messages: ChatRequest['messages']) {
  return messages.map(msg => {
    switch (msg.role) {
      case 'system':
        return new SystemMessage(msg.content);
      case 'user':
        return new HumanMessage(msg.content);
      case 'assistant':
        return new AIMessage(msg.content);
      default:
        throw new Error(`Unsupported message role: ${msg.role}`);
    }
  });
}

// Export the handler function directly
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('[INFO] Chat API request received:', {
    method: req.method,
    url: req.url,
    hasBody: !!req.body,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    }
  });

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
    console.log('[INFO] Handling OPTIONS request');
    return res.status(200).end();
  }

  try {
    // Validate HTTP method
    if (req.method !== 'POST') {
      return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('[ERROR] OpenAI API key missing in environment');
      return sendError(res, 500, 'OpenAI API key is not configured', 'OPENAI_CONFIG_ERROR');
    }

    console.log('[INFO] Validating request body');
    // Validate request body
    const validatedData = chatRequestSchema.parse(req.body) as ChatRequest;
    if (!validatedData.messages || validatedData.messages.length === 0) {
      return sendError(res, 400, 'Messages array cannot be empty', 'INVALID_REQUEST');
    }

    console.log('[INFO] Getting chat model instance');
    // Get the chat model instance
    const chatModel = getChatModel();

    console.log('[INFO] Converting messages');
    // Convert messages to LangChain format
    const langChainMessages = convertToLangChainMessages(validatedData.messages);

    console.log('[INFO] Calling OpenAI');
    // Call OpenAI with the validated messages
    const response = await chatModel.call(langChainMessages, {
      temperature: validatedData.temperature ?? 0.7,
      maxTokens: validatedData.maxTokens ?? 500,
    } as ChatOpenAICallOptions);

    if (!response || !response.content) {
      return sendError(res, 500, 'Invalid response from OpenAI', 'OPENAI_RESPONSE_ERROR');
    }

    console.log('[INFO] Processing response');
    const chatResponse: ChatResponse = {
      content: response.content.toString(),
      role: 'assistant',
    };

    console.log('[INFO] Sending successful response');
    return res.status(200).json(chatResponse);
  } catch (error) {
    console.error('[ERROR] Chat API Error:', error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'ZodError') {
        return sendError(res, 400, 'Invalid request format', 'VALIDATION_ERROR');
      }
      if (error.name === 'OpenAIConfigError') {
        return sendError(res, 500, error.message, 'OPENAI_CONFIG_ERROR');
      }
      // Log the full error details in production
      console.error('[ERROR] Full error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      return sendError(res, 500, error.message, 'INTERNAL_SERVER_ERROR');
    }
    
    return sendError(res, 500, 'An unexpected error occurred', 'INTERNAL_SERVER_ERROR');
  }
} 