import { type TiptapContent, extractPlainText } from '@/lib/tiptap';
import { type Json } from '@/types/database';
import type OpenAI from 'openai';
import {
  type Message,
  type BaseTicketContext,
  type CreateTicketResponseMessageParams,
  type CreatePromptWithContextMessageParams,
  type CreateEditResponseMessageParams,
  type CreateEditResponseWithContextMessageParams
} from '../types';

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export function buildConversationThread(messages: Message[]): string {
  return messages
    .map(msg => `${msg.senderFullName}\n\n${extractPlainText(msg.content)}\n\n###\n\n`)
    .join('');
}

export function buildWorkerContext(
  currentWorkerFullName: string | undefined,
  messages: Message[]
): string {
  const hasCurrentWorkerRespondedBefore = currentWorkerFullName && 
    messages.some(msg => 
      msg.role === 'worker' && 
      msg.senderFullName === currentWorkerFullName
    );

  return hasCurrentWorkerRespondedBefore
    ? `as if you are ${currentWorkerFullName}`
    : 'as if you are a new worker responding for the first time in this thread';
}

export function createBaseSystemMessage(context: BaseTicketContext): ChatMessage {
  return {
    role: "system",
    content: `You are a helpful support worker assisting a user named ${context.originalSenderFullName} on a ticket titled ${context.ticketTitle}. Write your responses as if you are the worker. Provide clear, concise, and technically accurate guidance. Avoid revealing internal notes. Respond in a professional tone.`
  };
}

export function createTicketResponseMessage(params: CreateTicketResponseMessageParams): ChatMessage {
  return {
    role: "user",
    content: `Below is the conversation thread so far:\n\n---\n${params.conversationThread}\n\nPlease draft the next message ${params.workerContext}. Address ${params.originalSenderFullName}'s concern about "${params.lastUserMessage}". Maintain a helpful and professional tone, but do not start the message with a salutation and do not end the message with a closing salutation.`
  };
}

export function createPromptWithContextMessage(params: CreatePromptWithContextMessageParams): ChatMessage {
  return {
    role: "user",
    content: `Below is the conversation thread so far:\n\n---\n${params.conversationThread}\n\nPlease draft the next message ${params.workerContext}, keeping in mind ${params.originalSenderFullName}'s concern about "${params.lastUserMessage}". Use the following prompt to guide your response:\n\n${params.prompt}\n\nMaintain a helpful and professional tone, but do not start the message with a salutation and do not end the message with a closing salutation.`
  };
}

export function createEditResponseMessage(params: CreateEditResponseMessageParams): ChatMessage {
  return {
    role: "user",
    content: `Here is my current response:\n\n${extractPlainText(params.currentResponse)}\n\nPlease edit this response according to the following prompt:\n\n${params.prompt}`
  };
}

export function createEditResponseWithContextMessage(params: CreateEditResponseWithContextMessageParams): ChatMessage {
  return {
    role: "user",
    content: `Below is the conversation thread so far:\n\n---\n${params.conversationThread}\n\nHere is my current response:\n\n${extractPlainText(params.currentResponse)}\n\nPlease edit this response ${params.workerContext} according to the following prompt:\n\n${params.prompt}\n\nKeep in mind ${params.originalSenderFullName}'s concerns, maintain a helpful and professional tone, but do not start the message with a salutation and do not end the message with a closing salutation.`
  };
}

export function getLastUserMessage(messages: Message[], ticketContent: Json): string {
  const lastMessage = messages
    .filter(msg => msg.role === 'user')
    .pop()?.content || ticketContent;
  
  return extractPlainText(lastMessage);
} 
