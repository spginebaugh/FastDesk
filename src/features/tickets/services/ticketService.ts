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
        customer:customers(*),
        assignments:ticket_assignments(
          agent_id,
          is_primary
        )
      `)
      .order('updated_at', { ascending: false })
    
    if (unassigned) {
      const { data: ticketsWithoutAssignments } = await supabase
        .from('tickets')
        .select('id')
        .not('id', 'in', (
          supabase
            .from('ticket_assignments')
            .select('ticket_id')
        ))
      
      const unassignedTicketIds = ticketsWithoutAssignments?.map(t => t.id).filter((id): id is string => id !== null) || []
      if (unassignedTicketIds.length > 0) {
        query = query.in('id', unassignedTicketIds)
      } else {
        // If no unassigned tickets, return empty array
        return []
      }
    } else if (userId) {
      const { data: assignedTickets } = await supabase
        .from('ticket_assignments')
        .select('ticket_id')
        .eq('agent_id', userId)
      
      const assignedTicketIds = assignedTickets?.map(t => t.ticket_id).filter((id): id is string => id !== null) || []
      if (assignedTicketIds.length > 0) {
        query = query.in('id', assignedTicketIds)
      } else {
        // If no assigned tickets, return empty array
        return []
      }
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

  async createTicket({ title }: { title: string }) {
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('User not authenticated')

    // First get or create a customer for the user
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select()
      .eq('email', userProfile.user.email!)
      .single()

    let customerId: string
    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([
          {
            email: userProfile.user.email!,
            full_name: userProfile.user.user_metadata?.full_name || userProfile.user.email!.split('@')[0]
          }
        ])
        .select()
        .single()

      if (customerError) throw customerError
      customerId = newCustomer.id
    }

    // Create the ticket
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        { 
          title,
          status: 'new',
          priority: 'medium',
          customer_id: customerId
        }
      ])
      .select(`
        *,
        customer:customers(*)
      `)
      .single()

    if (error) throw error
    return data as TicketWithCustomer
  },

  async createTicketMessage({ ticketId, content, isInternal }: { ticketId: string, content: string, isInternal: boolean }) {
    const { data: userProfile } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert([
        {
          ticket_id: ticketId,
          content,
          is_internal: isInternal,
          sender_id: userProfile.user?.id,
          sender_type: 'agent'
        }
      ])
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
      .single()

    if (error) throw error
    return data as TicketMessage
  },

  async updateTicket(ticketId: string, updates: Partial<{ title: string; status: TicketStatus }>) {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single()

    if (error) throw error
    return data
  }
} 