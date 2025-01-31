import { supabase } from '@/config/supabase/client'
import { TicketStatus, TicketPriority } from '../types'
import { generateTicketSummary } from './ticket-summary.service'
import { type Database } from '@/types/database'

type Ticket = Database['public']['Tables']['tickets']['Row']

interface UpdateTicketParams {
  ticketId: string
  updates: Partial<{ 
    title: string
    ticket_status: TicketStatus
    ticket_priority: TicketPriority
  }>
}

export async function updateTicket({ ticketId, updates }: UpdateTicketParams): Promise<Ticket> {
  // Get current ticket data if we're updating status
  let currentTicket: Ticket | undefined
  if (updates.ticket_status) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()
    
    if (error) throw error
    currentTicket = data
  }

  // Update the ticket
  const { data: tickets, error: updateError } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()

  if (updateError) throw updateError
  if (!tickets?.[0]) throw new Error('Failed to update ticket')
  const updatedTicket = tickets[0]

  // Generate summary if status is changing to closed or resolved
  if (updates.ticket_status && 
      ['closed', 'resolved'].includes(updates.ticket_status) && 
      currentTicket?.ticket_status !== updates.ticket_status) {
    try {
      await generateTicketSummary({ 
        ticketId, 
        ticketTitle: updatedTicket.title 
      })
    } catch (summaryError) {
      console.error('Failed to generate ticket summary:', summaryError)
      // Don't throw error here as the ticket update was successful
    }
  }

  return updatedTicket
} 