import { createTiptapContent } from '@/lib/tiptap';
import { chatModel } from '@/config/openai/client';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
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
      const editMessage = createEditResponseMessage({ currentResponse, prompt });

      const messages = [
        new SystemMessage(
          "You are a helpful support worker. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone."
        ),
        new HumanMessage(editMessage.content?.toString() || '')
      ];

      const response = await chatModel.invoke(messages);
      return createTiptapContent(response.content.toString());
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

      const baseSystemMessage = createBaseSystemMessage({ ticketTitle, originalSenderFullName, currentWorkerFullName });
      const editMessage = createEditResponseWithContextMessage({
        conversationThread,
        workerContext,
        currentResponse,
        prompt,
        originalSenderFullName
      });

      const messages = [
        new SystemMessage(baseSystemMessage.content?.toString() || ''),
        new HumanMessage(editMessage.content?.toString() || '')
      ];

      const response = await chatModel.invoke(messages);
      return createTiptapContent(response.content.toString());
    } catch (error) {
      console.error('Error editing response with context:', error);
      throw new Error('Failed to edit response with context');
    }
  }
}; 