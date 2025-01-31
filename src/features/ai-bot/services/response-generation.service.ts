import { createTiptapContent } from '@/lib/tiptap';
import { openAIClient } from '@/config/api/openai';
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

      const baseSystemMessage = createBaseSystemMessage({ ticketTitle, originalSenderFullName, currentWorkerFullName });
      const ticketMessage = createTicketResponseMessage({
        conversationThread,
        workerContext,
        lastUserMessage,
        originalSenderFullName
      });

      const messages = [
        { role: 'system' as const, content: baseSystemMessage.content?.toString() || '' },
        { role: 'user' as const, content: ticketMessage.content?.toString() || '' }
      ];

      const response = await openAIClient.chat({ messages });
      return createTiptapContent(response.content);
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

      const baseSystemMessage = createBaseSystemMessage({ ticketTitle, originalSenderFullName, currentWorkerFullName });
      const contextMessage = createPromptWithContextMessage({
        conversationThread,
        workerContext,
        lastUserMessage,
        originalSenderFullName,
        prompt
      });

      const messages = [
        { role: 'system' as const, content: baseSystemMessage.content?.toString() || '' },
        { role: 'user' as const, content: contextMessage.content?.toString() || '' }
      ];

      const response = await openAIClient.chat({ messages });
      return createTiptapContent(response.content);
    } catch (error) {
      console.error('Error generating AI response with prompt:', error);
      throw new Error('Failed to generate AI response with prompt');
    }
  },

  async generateCustomResponse({ prompt }: GenerateCustomResponseParams) {
    try {
      const messages = [
        { 
          role: 'system' as const, 
          content: "You are a helpful support worker. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone."
        },
        { role: 'user' as const, content: prompt }
      ];

      const response = await openAIClient.chat({ messages });
      return createTiptapContent(response.content);
    } catch (error) {
      console.error('Error generating custom AI response:', error);
      throw new Error('Failed to generate custom AI response');
    }
  }
}; 