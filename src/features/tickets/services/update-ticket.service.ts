import { supabase } from '@/config/supabase/client'
import { TicketStatus, TicketPriority } from '../types'
import { generateTicketSummary } from './ticket-summary.service'

interface UpdateTicketParams {
  ticketId: string
  updates: Partial<{ 
    title: string
    ticket_status: TicketStatus
    ticket_priority: TicketPriority
  }>
}

export async function updateTicket({ ticketId, updates }: UpdateTicketParams) {
  // Get current ticket data if we're updating status
  let currentTicket;
  if (updates.ticket_status) {
    const { data: ticket, error: getError } = await supabase
      .from('tickets')
      .select('ticket_status, title')
      .eq('id', ticketId)
      .single();
    
    if (getError) throw getError;
    currentTicket = ticket;
  }

  // Update the ticket
  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single()

  if (error) throw error;

  // Generate summary if status is changing to closed or resolved
  if (updates.ticket_status && 
      ['closed', 'resolved'].includes(updates.ticket_status) && 
      currentTicket?.ticket_status !== updates.ticket_status) {
    try {
      await generateTicketSummary({ 
        ticketId, 
        ticketTitle: data.title 
      });
    } catch (summaryError) {
      console.error('Failed to generate ticket summary:', summaryError);
      // Don't throw error here as the ticket update was successful
    }
  }

  return data
} 