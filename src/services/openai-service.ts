import OpenAI from 'openai';
import { type TiptapContent, createTiptapContent, extractPlainText } from '@/lib/tiptap';
import { type Json } from '@/types/database';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface Message {
  content: Json;
  role: 'user' | 'worker';
  senderFullName: string;
}

interface GenerateTicketResponseParams {
  ticketTitle: string;
  originalSenderFullName: string;
  currentWorkerFullName?: string;
  ticketContent: Json;
  previousMessages: Message[];
}

interface GenerateCustomResponseParams {
  prompt: string;
}

interface EditResponseParams {
  prompt: string;
  currentResponse: TiptapContent;
}

interface EditResponseWithContextParams extends GenerateTicketResponseParams {
  prompt: string;
  currentResponse: TiptapContent;
}

interface GeneratePromptWithContextParams extends GenerateTicketResponseParams {
  prompt: string;
}

export const openAIService = {
  async generateTicketResponse({ 
    ticketTitle,
    originalSenderFullName,
    currentWorkerFullName,
    ticketContent,
    previousMessages 
  }: GenerateTicketResponseParams) {
    try {
      // Convert TipTap content to plain text for OpenAI
      const conversationThread = previousMessages
        .map(msg => `${msg.senderFullName}\n\n${extractPlainText(msg.content)}\n\n###\n\n`)
        .join('');

      // Check if the currently logged-in worker has responded before
      const hasCurrentWorkerRespondedBefore = currentWorkerFullName && 
        previousMessages.some(msg => 
          msg.role === 'worker' && 
          msg.senderFullName === currentWorkerFullName
        );

      const workerContext = hasCurrentWorkerRespondedBefore
        ? `as if you are ${currentWorkerFullName}`
        : 'as if you are a new worker responding for the first time in this thread';

      const lastUserMessage = previousMessages
        .filter(msg => msg.role === 'user')
        .pop()?.content || ticketContent;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful support worker assisting a user named ${originalSenderFullName} on a ticket titled ${ticketTitle}. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone.`
          },
          {
            role: "user",
            content: `Below is the conversation thread so far:\n\n---\n${conversationThread}\n\nPlease draft the next message ${workerContext}. Address ${originalSenderFullName}'s concern about "${extractPlainText(lastUserMessage)}". Maintain a helpful and professional tone, but do not start the message with a salutation and do not end the message with a closing salutation.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      // Convert the plain text response to TipTap format
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
      // Convert TipTap content to plain text for OpenAI
      const conversationThread = previousMessages
        .map(msg => `${msg.senderFullName}\n\n${extractPlainText(msg.content)}\n\n###\n\n`)
        .join('');

      const hasCurrentWorkerRespondedBefore = currentWorkerFullName && 
        previousMessages.some(msg => 
          msg.role === 'worker' && 
          msg.senderFullName === currentWorkerFullName
        );

      const workerContext = hasCurrentWorkerRespondedBefore
        ? `as if you are ${currentWorkerFullName}`
        : 'as if you are a new worker responding for the first time in this thread';

      const lastUserMessage = previousMessages
        .filter(msg => msg.role === 'user')
        .pop()?.content || ticketContent;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful support worker assisting a user named ${originalSenderFullName} on a ticket titled ${ticketTitle}. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone.`
          },
          {
            role: "user",
            content: `Below is the conversation thread so far:\n\n---\n${conversationThread}\n\nPlease draft the next message ${workerContext}, keeping in mind ${originalSenderFullName}'s concern about "${extractPlainText(lastUserMessage)}". Use the following prompt to guide your response:\n\n${prompt}\n\nMaintain a helpful and professional tone, but do not start the message with a salutation and do not end the message with a closing salutation.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      // Convert the plain text response to TipTap format
      return createTiptapContent(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error generating AI response with prompt:', error);
      throw new Error('Failed to generate AI response with prompt');
    }
  },

  async generateCustomResponse({ prompt }: GenerateCustomResponseParams) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
        temperature: 0.7,
        max_tokens: 500
      });

      // Convert the plain text response to TipTap format
      return createTiptapContent(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error generating custom AI response:', error);
      throw new Error('Failed to generate custom AI response');
    }
  },

  async editResponse({ prompt, currentResponse }: EditResponseParams) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful support worker. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone."
          },
          {
            role: "user",
            content: `Here is my current response:\n\n${extractPlainText(currentResponse)}\n\nPlease edit this response according to the following prompt:\n\n${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      // Convert the plain text response to TipTap format
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
      const conversationThread = previousMessages
        .map(msg => `${msg.senderFullName}\n\n${extractPlainText(msg.content)}\n\n###\n\n`)
        .join('');

      const hasCurrentWorkerRespondedBefore = currentWorkerFullName && 
        previousMessages.some(msg => 
          msg.role === 'worker' && 
          msg.senderFullName === currentWorkerFullName
        );

      const workerContext = hasCurrentWorkerRespondedBefore
        ? `as if you are ${currentWorkerFullName}`
        : 'as if you are a new worker responding for the first time in this thread';

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful support worker assisting a user named ${originalSenderFullName} on a ticket titled ${ticketTitle}. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone.`
          },
          {
            role: "user",
            content: `Below is the conversation thread so far:\n\n---\n${conversationThread}\n\nHere is my current response:\n\n${extractPlainText(currentResponse)}\n\nPlease edit this response ${workerContext}  according to the following prompt:\n\n${prompt}\n\nKeep in mind ${originalSenderFullName}'s concerns, maintain a helpful and professional tone, but do not start the message with a salutation and do not end the message with a closing salutation.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      // Convert the plain text response to TipTap format
      return createTiptapContent(response.choices[0]?.message?.content || '');
    } catch (error) {
      console.error('Error editing response with context:', error);
      throw new Error('Failed to edit response with context');
    }
  }
}; 