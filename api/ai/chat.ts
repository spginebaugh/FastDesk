import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chatModel } from '../config/openai';
import { ChatRequest, chatRequestSchema, ChatResponse, ErrorResponse } from '../types/openai';
import type { ChatOpenAICallOptions } from '@langchain/openai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed', 
      code: 'METHOD_NOT_ALLOWED' 
    } as ErrorResponse);
  }

  try {
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