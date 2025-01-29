import { createTiptapContent } from '@/lib/tiptap';
import { openai, OPENAI_CONFIG } from '@/config/openai/client';
import {
  buildConversationThread,
  buildWorkerContext,
  createBaseSystemMessage,
  createEditResponseMessage,
  createEditResponseWithContextMessage
} from './helpers';
import {
  type EditResponseParams,
  type EditResponseWithContextParams
} from '../types';

export const responseEditingService = {
  async editResponse({ prompt, currentResponse }: EditResponseParams) {
    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful support worker. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone."
          },
          createEditResponseMessage({ currentResponse, prompt })
        ],
        temperature: OPENAI_CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: OPENAI_CONFIG.DEFAULT_MAX_TOKENS
      });

      return createTiptapContent(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error editing response:', error);
      throw new Error('Failed to edit response');
    }
  },

  async editResponseWithContext({ 
    ticketTitle,
    originalSenderFullName,
    currentWorkerFullName,
    previousMessages,
    prompt,
    currentResponse
  }: EditResponseWithContextParams) {
    try {
      const conversationThread = buildConversationThread(previousMessages);
      const workerContext = buildWorkerContext(currentWorkerFullName, previousMessages);

      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.DEFAULT_MODEL,
        messages: [
          createBaseSystemMessage({ ticketTitle, originalSenderFullName, currentWorkerFullName }),
          createEditResponseWithContextMessage({
            conversationThread,
            workerContext,
            currentResponse,
            prompt,
            originalSenderFullName
          })
        ],
        temperature: OPENAI_CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: OPENAI_CONFIG.DEFAULT_MAX_TOKENS
      });

      return createTiptapContent(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error editing response with context:', error);
      throw new Error('Failed to edit response with context');
    }
  }
}; 