import { type TiptapContent } from '@/lib/tiptap';
import { type Json } from '@/types/database';

export interface Message {
  content: Json;
  role: 'user' | 'worker';
  senderFullName: string;
}

export interface BaseTicketContext {
  ticketTitle: string;
  originalSenderFullName: string;
  currentWorkerFullName?: string;
}

export interface GenerateTicketResponseParams {
  ticketTitle: string;
  originalSenderFullName: string;
  currentWorkerFullName?: string;
  ticketContent: Json;
  previousMessages: Message[];
}

export interface GenerateCustomResponseParams {
  prompt: string;
}

export interface EditResponseParams {
  prompt: string;
  currentResponse: TiptapContent;
}

export interface EditResponseWithContextParams extends GenerateTicketResponseParams {
  prompt: string;
  currentResponse: TiptapContent;
}

export interface GeneratePromptWithContextParams extends GenerateTicketResponseParams {
  prompt: string;
}

export interface CreateTicketResponseMessageParams {
  conversationThread: string;
  workerContext: string;
  lastUserMessage: string;
  originalSenderFullName: string;
}

export interface CreatePromptWithContextMessageParams extends CreateTicketResponseMessageParams {
  prompt: string;
}

export interface CreateEditResponseMessageParams {
  currentResponse: TiptapContent;
  prompt: string;
}

export interface CreateEditResponseWithContextMessageParams {
  conversationThread: string;
  workerContext: string;
  currentResponse: TiptapContent;
  prompt: string;
  originalSenderFullName: string;
} 