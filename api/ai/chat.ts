import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chatModel } from '../config/openai';
import { ChatRequest, chatRequestSchema, ChatResponse, ErrorResponse } from '../types/openai';
import type { ChatOpenAICallOptions } from '@langchain/openai';
import cors from 'cors';

// Initialize CORS middleware
const corsMiddleware = cors({
  methods: ['POST'],
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://fast-desk-psi.vercel.app'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
});

// Helper to wrap async route handlers
const asyncHandler = (fn: Function) => (req: VercelRequest, res: VercelResponse) => {
  Promise.resolve(fn(req, res)).catch((error) => {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    } as ErrorResponse);
  });
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  await new Promise((resolve) => corsMiddleware(req, res, resolve));

  // Validate HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed', 
      code: 'METHOD_NOT_ALLOWED' 
    } as ErrorResponse);
  }

  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const validatedData = chatRequestSchema.parse(req.body) as ChatRequest;

    // Call OpenAI with the validated messages
    const response = await chatModel.call(validatedData.messages, {
      temperature: validatedData.temperature,
      maxTokens: validatedData.maxTokens,
    } as ChatOpenAICallOptions);

    const chatResponse: ChatResponse = {
      content: response.content.toString(),
      role: 'assistant',
    };

    return res.status(200).json(chatResponse);
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    } as ErrorResponse);
  }
} 