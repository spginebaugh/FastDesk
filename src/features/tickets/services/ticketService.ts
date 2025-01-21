import { supabase } from '../../../config/supabase/client'
import { TicketWithCustomer, TicketStatus, TicketMessage, Profile } from '../types'
import { subDays } from 'date-fns'

interface GetTicketsParams {
  userId?: string
  status?: TicketStatus[]
  unassigned?: boolean
  recentlyUpdated?: boolean
}

export const ticketService = {
  async getTickets({ 
    userId, 
    status = ['new', 'open', 'pending'],
    unassigned = false,
    recentlyUpdated = false
  }: GetTicketsParams = {}): Promise<TicketWithCustomer[]> {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('updated_at', { ascending: false })
    
    if (unassigned) {
      query = query.is('assigned_to', null)
    } else if (userId) {
      query = query.eq('assigned_to', userId)
    }

    if (status.length > 0) {
      query = query.in('status', status)
    }

    if (recentlyUpdated) {
      const recentDate = subDays(new Date(), 7) // Last 7 days
      query = query.gte('updated_at', recentDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data as TicketWithCustomer[]
  },

  async getTicket(ticketId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', ticketId)
      .single()

    if (error) throw error
    return data as TicketWithCustomer
  },

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select(`
        *,
        sender:profiles(
          id,
          full_name,
          avatar_url,
          role,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data.map(message => ({
      ...message,
      sender: message.sender ? message.sender as unknown as Profile : undefined
    }))
  },

  async createTicketMessage({ 
    ticketId, 
    content, 
    isInternal = false 
  }: { 
    ticketId: string
    content: string
    isInternal?: boolean
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        content,
        sender_type: 'agent',
        sender_id: user.id,
        is_internal: isInternal
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
} 