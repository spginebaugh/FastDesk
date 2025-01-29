import { createTiptapContent } from '@/lib/tiptap';
import { openai, OPENAI_CONFIG } from '@/config/openai/client';
import {
  buildConversationThread,
  buildWorkerContext,
  createBaseSystemMessage,
  createTicketResponseMessage,
  createPromptWithContextMessage,
  getLastUserMessage
} from './helpers';
import {
  type GenerateTicketResponseParams,
  type GeneratePromptWithContextParams,
  type GenerateCustomResponseParams
} from '../types';

export const responseGenerationService = {
  async generateTicketResponse({ 
    ticketTitle,
    originalSenderFullName,
    currentWorkerFullName,
    ticketContent,
    previousMessages 
  }: GenerateTicketResponseParams) {
    try {
      const conversationThread = buildConversationThread(previousMessages);
      const workerContext = buildWorkerContext(currentWorkerFullName, previousMessages);
      const lastUserMessage = getLastUserMessage(previousMessages, ticketContent);

      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.DEFAULT_MODEL,
        messages: [
          createBaseSystemMessage({ ticketTitle, originalSenderFullName, currentWorkerFullName }),
          createTicketResponseMessage({
            conversationThread,
            workerContext,
            lastUserMessage,
            originalSenderFullName
          })
        ],
        temperature: OPENAI_CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: OPENAI_CONFIG.DEFAULT_MAX_TOKENS
      });

      return createTiptapContent(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  },

  async generatePromptWithContext({ 
    ticketTitle,
    originalSenderFullName,
    currentWorkerFullName,
    ticketContent,
    previousMessages,
    prompt 
  }: GeneratePromptWithContextParams) {
    try {
      const conversationThread = buildConversationThread(previousMessages);
      const workerContext = buildWorkerContext(currentWorkerFullName, previousMessages);
      const lastUserMessage = getLastUserMessage(previousMessages, ticketContent);

      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.DEFAULT_MODEL,
        messages: [
          createBaseSystemMessage({ ticketTitle, originalSenderFullName, currentWorkerFullName }),
          createPromptWithContextMessage({
            conversationThread,
            workerContext,
            lastUserMessage,
            originalSenderFullName,
            prompt
          })
        ],
        temperature: OPENAI_CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: OPENAI_CONFIG.DEFAULT_MAX_TOKENS
      });

      return createTiptapContent(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error generating AI response with prompt:', error);
      throw new Error('Failed to generate AI response with prompt');
    }
  },

  async generateCustomResponse({ prompt }: GenerateCustomResponseParams) {
    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_CONFIG.DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a helpful support worker. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: OPENAI_CONFIG.DEFAULT_TEMPERATURE,
        max_tokens: OPENAI_CONFIG.DEFAULT_MAX_TOKENS
      });

      return createTiptapContent(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error generating custom AI response:', error);
      throw new Error('Failed to generate custom AI response');
    }
  }
}; 