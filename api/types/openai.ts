import { z } from 'zod';

export const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
});

export const parseRequestSchema = z.object({
  content: z.string(),
  schema: z.record(z.any()).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ParseRequest = z.infer<typeof parseRequestSchema>;

export interface ChatResponse {
  content: string;
  role: 'assistant';
}

export interface ParseResponse<T = any> {
  parsed: T;
}

export interface ErrorResponse {
  error: string;
  code: string;
} 