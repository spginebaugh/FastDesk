import { supabase } from '@/config/supabase/client';
import { chatModel } from '@/config/openai/client';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { TicketMessage } from '../types';
import { getTicketMessages } from './ticket-messages.service';

interface GenerateTicketSummaryParams {
  ticketId: string;
  ticketTitle: string;
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
    const systemMessage = new SystemMessage(
      `You are a support ticket summarization assistant. Your task is to create a concise and to-the-point summary of a support ticket conversation. 
      Focus on:
      1. The main issue or request
      2. Key points of the conversation
      3. Resolution or outcome
      Keep the summary professional and factual. Avoid any subjective interpretations. Do not mention the names of the customer of service agents.`
    );

    const humanMessage = new HumanMessage(
      `Please summarize the following support ticket conversation.\n\nTicket Title: ${ticketTitle}\n\nConversation:\n${formattedMessages}`
    );

    // Generate summary
    const response = await chatModel.invoke([systemMessage, humanMessage]);
    const summary = response.content.toString();

    // Update ticket with summary
    const { error } = await supabase
      .from('tickets')
      .update({ 
        custom_fields: {
          ai_summary: summary,
          summary_generated_at: new Date().toISOString()
        }
      })
      .eq('id', ticketId);

    if (error) throw error;

    return summary;
  } catch (error) {
    console.error('Error generating ticket summary:', error);
    throw new Error('Failed to generate ticket summary');
  }
} 