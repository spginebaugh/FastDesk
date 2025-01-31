import { supabase } from '@/config/supabase/client';
import { openAIClient } from '@/config/api/openai';
import { getTicketMessages } from './ticket-messages.service';
import { type Database, type Json } from '@/types/database';

type Ticket = Database['public']['Tables']['tickets']['Row'];

interface GenerateTicketSummaryParams {
  ticketId: string;
  ticketTitle: string;
}

interface TicketCustomFields {
  [key: string]: string | undefined;
  ai_summary?: string;
  summary_generated_at?: string;
}

export async function generateTicketSummary({ 
  ticketId,
  ticketTitle 
}: GenerateTicketSummaryParams): Promise<string> {
  try {
    // Get all messages for the ticket
    const messages = await getTicketMessages({ ticketId });

    // Format messages for the AI
    const formattedMessages = messages.map(msg => {
      const role = msg.sender_type === 'customer' ? 'Customer' : 'Support Worker';
      const name = msg.sender?.full_name || 'Unknown';
      const content = typeof msg.content === 'string' 
        ? msg.content 
        : JSON.stringify(msg.content);
      
      return `${role} (${name}): ${content}`;
    }).join('\n\n');

    // Create AI messages
    const systemPrompt = `You are a support ticket summarization assistant. Your task is to create a concise and to-the-point summary of a support ticket conversation. 
      Focus on:
      1. The main issue or request
      2. Key points of the conversation
      3. Resolution or outcome
      Keep the summary professional and factual. Avoid any subjective interpretations. Do not mention the names of the customer of service agents.`;

    const userPrompt = `Please summarize the following support ticket conversation.\n\nTicket Title: ${ticketTitle}\n\nConversation:\n${formattedMessages}`;

    // Generate summary
    const response = await openAIClient.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const summary = response.content;

    // Update ticket with summary
    const customFields: TicketCustomFields = {
      ai_summary: summary,
      summary_generated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('tickets')
      .update({ 
        custom_fields: customFields as Json
      } satisfies Partial<Ticket>)
      .eq('id', ticketId);

    if (error) throw error;

    return summary;
  } catch (error) {
    console.error('Error generating ticket summary:', error);
    throw new Error('Failed to generate ticket summary');
  }
} 