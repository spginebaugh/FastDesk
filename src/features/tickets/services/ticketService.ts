import { supabase } from '../../../config/supabase/client'
import { TicketWithCustomer, TicketStatus, TicketMessage, TicketMessageJoinResult, Profile, Customer, MessageSender } from '../types'
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
    // First get all messages
    const { data: messages, error: messagesError } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (messagesError) throw messagesError

    // Then get all unique sender IDs grouped by type
    const agentIds = messages
      .filter(m => m.sender_type === 'agent')
      .map(m => m.sender_id)
      .filter((id): id is string => id !== null)
    
    const customerIds = messages
      .filter(m => m.sender_type === 'customer')
      .map(m => m.sender_id)
      .filter((id): id is string => id !== null)

    // Fetch profiles and customers in parallel if needed
    const [profilesResponse, customersResponse] = await Promise.all([
      agentIds.length > 0
        ? supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', agentIds)
        : Promise.resolve({ data: [], error: null }),
      customerIds.length > 0
        ? supabase
            .from('customers')
            .select('id, full_name, email')
            .in('id', customerIds)
        : Promise.resolve({ data: [], error: null })
    ])

    if (profilesResponse.error) throw profilesResponse.error
    if (customersResponse.error) throw customersResponse.error

    // Create lookup maps
    const profilesMap = new Map(profilesResponse.data.map(p => [p.id, p]))
    const customersMap = new Map(customersResponse.data.map(c => [c.id, c]))

    // Map messages with their senders
    return messages.map(message => ({
      ...message,
      sender: message.sender_type === 'agent' && message.sender_id
        ? {
            full_name: profilesMap.get(message.sender_id)?.full_name ?? 'Unknown Agent',
            avatar_url: profilesMap.get(message.sender_id)?.avatar_url ?? null
          }
        : message.sender_type === 'customer' && message.sender_id
          ? {
              full_name: customersMap.get(message.sender_id)?.full_name ?? customersMap.get(message.sender_id)?.email ?? 'Unknown Customer',
              avatar_url: null
            }
          : undefined
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
          customer_id: customerId,
          created_by_type: 'customer',
          created_by_id: customerId,
          source: 'customer_portal'
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
      .from('profiles')
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

  async updateTicket(ticketId: string, updates: Partial<{ title: string; status: TicketStatus }>) {
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
    // Get or create the sample customer
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select()
      .eq('email', 'sample@customer.com')
      .single()

    let sampleCustomer
    if (existingCustomer) {
      sampleCustomer = existingCustomer
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([
          {
            email: 'sample@customer.com',
            full_name: 'The Customer'
          }
        ])
        .select()
        .single()

      if (customerError) throw customerError
      sampleCustomer = newCustomer
    }

    // Create the sample ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          title: 'SAMPLE TICKET: Meet the ticket',
          status: 'new',
          priority: 'medium',
          customer_id: sampleCustomer.id,
          created_by_type: 'customer',
          created_by_id: sampleCustomer.id,
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
          sender_id: sampleCustomer.id,
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