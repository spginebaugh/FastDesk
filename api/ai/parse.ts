import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getParserModel } from '../config/openai';
import { ParseRequest, parseRequestSchema, ParseResponse, ErrorResponse } from '../types/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// Helper function to send error response
function sendError(res: VercelResponse, status: number, error: string, code: string) {
  return res.status(status).json({ error, code } as ErrorResponse);
}

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
    const validatedData = parseRequestSchema.parse(req.body) as ParseRequest;
    if (!validatedData.content) {
      return sendError(res, 400, 'Content cannot be empty', 'INVALID_REQUEST');
    }

    // Get the parser model instance
    const parserModel = getParserModel();

    // Create messages for the parser
    const messages = [
      new SystemMessage('You are a helpful assistant that parses and structures text according to the provided schema.'),
      new HumanMessage(validatedData.content)
    ];

    // Call OpenAI with the validated content
    const response = await parserModel.call(messages);

    if (!response || !response.content) {
      return sendError(res, 500, 'Invalid response from OpenAI', 'OPENAI_RESPONSE_ERROR');
    }

    let parsed: any;
    const contentString = response.content.toString();
    
    try {
      parsed = JSON.parse(contentString);
    } catch (error) {
      return sendError(res, 500, 'Failed to parse OpenAI response as JSON', 'PARSE_ERROR');
    }

    const parseResponse: ParseResponse = {
      parsed
    };

    return res.status(200).json(parseResponse);
  } catch (error) {
    console.error('Parse API Error:', error);
    
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