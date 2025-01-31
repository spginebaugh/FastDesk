import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parserModel } from '../config/openai';
import { ParseRequest, parseRequestSchema, ParseResponse, ErrorResponse } from '../types/openai';
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
    const validatedData = parseRequestSchema.parse(req.body) as ParseRequest;

    // Create messages for the parser
    const messages = [
      {
        role: 'system' as const,
        content: validatedData.schema
          ? `Extract information according to this schema: ${JSON.stringify(validatedData.schema)}`
          : 'Extract the key information from the following content in a structured format.'
      },
      { role: 'user' as const, content: validatedData.content }
    ];

    // Call OpenAI with zero temperature for consistent parsing
    const response = await parserModel.call(messages, {
      temperature: 0,
    } as ChatOpenAICallOptions);

    let parsed: any;
    try {
      parsed = JSON.parse(response.content.toString());
    } catch {
      parsed = response.content.toString();
    }

    const parseResponse: ParseResponse = {
      parsed,
    };

    return res.status(200).json(parseResponse);
  } catch (error) {
    console.error('Parse API Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    } as ErrorResponse);
  }
} 