import { supabase } from '../../../config/supabase/client'
import { TicketWithCustomer, TicketStatus, TicketMessage, TicketMessageJoinResult, UserProfile, MessageSender, TicketPriority } from '../types'
import { subDays } from 'date-fns'
import crypto from 'crypto'

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
        customer:user_profiles!tickets_customer_id_fkey(*),
        assignments:ticket_assignments(
          agent_id,
          is_primary
        )
      `)
      .order('updated_at', { ascending: false })
    
    if (unassigned) {
      const { data: assignedTicketIds } = await supabase
        .from('ticket_assignments')
        .select('ticket_id')
      
      const ticketIds = assignedTicketIds?.map(t => t.ticket_id) || []
      if (ticketIds.length > 0) {
        query = query.not('id', 'in', `(${ticketIds.map(id => `"${id}"`).join(',')})`)
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
        customer:user_profiles!tickets_customer_id_fkey(*)
      `)
      .eq('id', ticketId)
      .single()

    if (error) throw error
    return data as TicketWithCustomer
  },

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    // First get all messages
    const { data: messages, error: messagesError } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (messagesError) throw messagesError

    // Then get all unique sender IDs
    const senderIds = messages
      .map(m => m.sender_id)
      .filter((id): id is string => id !== null)

    // Fetch all senders in one query
    const { data: senders, error: sendersError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('id', senderIds)

    if (sendersError) throw sendersError

    // Create lookup map
    const sendersMap = new Map(senders.map(p => [p.id, p]))

    // Map messages with their senders
    return messages.map(message => ({
      ...message,
      sender: message.sender_id
        ? {
            full_name: sendersMap.get(message.sender_id)?.full_name ?? 'Unknown User',
            avatar_url: sendersMap.get(message.sender_id)?.avatar_url ?? null
          }
        : undefined
    }))
  },

  async createTicket({ title }: { title: string }) {
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('User not authenticated')

    // Get or create user profile
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select()
      .eq('email', userProfile.user.email!)
      .single()

    if (!existingProfile) {
      throw new Error('User profile not found')
    }

    // Create the ticket
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        { 
          title,
          status: 'new',
          priority: 'medium',
          customer_id: existingProfile.id,
          created_by_type: 'customer',
          created_by_id: existingProfile.id,
          source: 'customer_portal'
        }
      ])
      .select(`
        *,
        customer:user_profiles!tickets_customer_id_fkey(*)
      `)
      .single()

    if (error) throw error
    return data as TicketWithCustomer
  },

  async createTicketMessage({ ticketId, content, isInternal }: { ticketId: string, content: string, isInternal: boolean }) {
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('User not authenticated')

    // First create the message
    const { data: message, error: messageError } = await supabase
      .from('ticket_messages')
      .insert([
        {
          ticket_id: ticketId,
          content,
          is_internal: isInternal,
          sender_id: userProfile.user.id,
          sender_type: 'agent'
        }
      ])
      .select()
      .single()

    if (messageError) throw messageError

    // Then get the sender profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('full_name, avatar_url')
      .eq('id', userProfile.user.id)
      .single()

    if (profileError) throw profileError

    // Return combined data
    return {
      ...message,
      sender: {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      }
    } as TicketMessage
  },

  async updateTicket(ticketId: string, updates: Partial<{ 
    title: string; 
    status: TicketStatus;
    priority: TicketPriority;
  }>) {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createSampleTicket(userId: string) {
    // Get or create the sample user profile
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select()
      .eq('email', 'sample@customer.com')
      .single()

    let sampleUser
    if (existingProfile) {
      sampleUser = existingProfile
    } else {
      const sampleUserId = crypto.randomUUID()
      const { data: newProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: sampleUserId,
            email: 'sample@customer.com',
            full_name: 'Sample Customer',
            user_type: 'customer',
            status: 'offline'
          }
        ])
        .select()
        .single()

      if (profileError) throw profileError
      sampleUser = newProfile
    }

    // Create the sample ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          title: 'SAMPLE TICKET: Meet the ticket',
          status: 'new',
          priority: 'medium',
          customer_id: sampleUser.id,
          created_by_type: 'customer',
          created_by_id: sampleUser.id,
          source: 'system',
          team_id: null
        }
      ])
      .select()
      .single()

    if (ticketError) throw ticketError

    // Create the welcome message
    const { error: messageError } = await supabase
      .from('ticket_messages')
      .insert([
        {
          ticket_id: ticket.id,
          content: 'This is a ticket message!!! Welcome to the platform',
          sender_type: 'customer',
          sender_id: sampleUser.id,
          is_internal: false
        }
      ])

    if (messageError) throw messageError

    // Assign the ticket to the new user
    const { error: assignmentError } = await supabase
      .from('ticket_assignments')
      .insert([
        {
          ticket_id: ticket.id,
          agent_id: userId,
          is_primary: true
        }
      ])

    if (assignmentError) throw assignmentError

    return ticket
  }
} 