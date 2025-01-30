import { createTiptapContent } from '@/lib/tiptap';
import { chatModel } from '@/config/openai/client';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
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
        new SystemMessage(baseSystemMessage.content?.toString() || ''),
        new HumanMessage(ticketMessage.content?.toString() || '')
      ];

      const response = await chatModel.invoke(messages);
      return createTiptapContent(response.content.toString());
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
        new SystemMessage(baseSystemMessage.content?.toString() || ''),
        new HumanMessage(contextMessage.content?.toString() || '')
      ];

      const response = await chatModel.invoke(messages);
      return createTiptapContent(response.content.toString());
    } catch (error) {
      console.error('Error generating AI response with prompt:', error);
      throw new Error('Failed to generate AI response with prompt');
    }
  },

  async generateCustomResponse({ prompt }: GenerateCustomResponseParams) {
    try {
      const messages = [
        new SystemMessage(
          "You are a helpful support worker. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone."
        ),
        new HumanMessage(prompt)
      ];

      const response = await chatModel.invoke(messages);
      return createTiptapContent(response.content.toString());
    } catch (error) {
      console.error('Error generating custom AI response:', error);
      throw new Error('Failed to generate custom AI response');
    }
  }
}; 