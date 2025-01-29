import { supabase } from '@/config/supabase/client'
import { TicketStatus, TicketPriority } from '../types'

interface UpdateTicketParams {
  ticketId: string
  updates: Partial<{ 
    title: string
    ticket_status: TicketStatus
    ticket_priority: TicketPriority
  }>
}

export async function updateTicket({ ticketId, updates }: UpdateTicketParams) {
  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single()

  if (error) throw error
  return data
} 