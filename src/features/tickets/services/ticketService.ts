import { supabase } from '@/config/supabase/client'
import { TicketWithUser, TicketStatus, TicketMessage, TicketPriority } from '../types'
import { subDays } from 'date-fns'
import crypto from 'crypto'

interface GetTicketsParams {
  userId?: string
  status?: TicketStatus[]
  unassigned?: boolean
  recentlyUpdated?: boolean
  organizationId?: string
}

interface Worker {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
}

export const ticketService = {
  async getTickets({ 
    userId, 
    status = ['new', 'open', 'pending'],
    unassigned = false,
    recentlyUpdated = false,
    organizationId
  }: GetTicketsParams = {}): Promise<TicketWithUser[]> {
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('Not authenticated')

    // First get the organizations the user is a member of
    const { data: userOrgs } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('profile_id', userProfile.user.id)

    const userOrgIds = organizationId ? [organizationId] : (userOrgs?.map(org => org.organization_id) || [])

    let query = supabase
      .from('tickets')
      .select(`
        *,
        user:user_profiles!tickets_user_id_fkey(*)
      `)
      .order('updated_at', { ascending: false })
      .in('organization_id', userOrgIds)
    
    if (unassigned) {
      const { data: assignedTicketIds } = await supabase
        .from('ticket_assignments')
        .select('ticket_id')
      
      const ticketIds = assignedTicketIds?.map(t => t.ticket_id) || []
      if (ticketIds.length > 0) {
        query = query.not('id', 'in', `(${ticketIds.map(id => `"${id}"`).join(',')})`)
      }
    } else if (userId) {
      // Check if the user is a customer or an worker
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', userId)
        .single()

      if (userProfile?.user_type === 'customer') {
        // For customers, show tickets they created
        query = query.eq('user_id', userId)
      } else {
        // For workers, show tickets assigned to them
        const { data: assignedTickets } = await supabase
          .from('ticket_assignments')
          .select('ticket_id')
          .eq('worker_id', userId)
        
        const assignedTicketIds = assignedTickets?.map(t => t.ticket_id).filter((id): id is string => id !== null) || []
        if (assignedTicketIds.length > 0) {
          query = query.in('id', assignedTicketIds)
        } else {
          // If no assigned tickets, return empty array
          return []
        }
      }
    }

    if (status.length > 0) {
      query = query.in('ticket_status', status)
    }

    if (recentlyUpdated) {
      const recentDate = subDays(new Date(), 7) // Last 7 days
      query = query.gte('updated_at', recentDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data as TicketWithUser[]
  },

  async getTicket(ticketId: string) {
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('Not authenticated')

    // First get the organizations the user is a member of
    const { data: userOrgs } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('profile_id', userProfile.user.id)

    const userOrgIds = userOrgs?.map(org => org.organization_id) || []

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        user:user_profiles!tickets_user_id_fkey(*)
      `)
      .eq('id', ticketId)
      .in('organization_id', userOrgIds)
      .single()

    if (error) throw error
    return data as TicketWithUser
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

  async createTicket({ 
    title, 
    priority = 'low',
    assignee = 'unassigned',
    organizationId = null
  }: { 
    title: string;
    priority?: TicketPriority;
    assignee?: string;
    organizationId?: string | null;
  }) {
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('User not authenticated')

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, email, user_type')
      .eq('email', userProfile.user.email!)
      .single()

    if (!profile?.id) {
      throw new Error('User profile not found')
    }

    const ticketData = {
      title,
      ticket_status: 'new' as const,
      ticket_priority: priority,
      user_id: profile.id,
      organization_id: organizationId,
      created_by_type: profile.user_type,
      created_by_id: profile.id,
      ticket_source: profile.user_type === 'worker' ? 'worker_portal' as const : 'customer_portal' as const
    } as const

    // Create the ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        user:user_profiles!tickets_user_id_fkey(*)
      `)
      .single()

    if (error) throw error

    // If no assignee specified and no organization, assign to creator
    const finalAssignee = assignee === 'unassigned' && !organizationId ? profile.id : assignee

    if (finalAssignee && finalAssignee !== 'unassigned') {
      const { error: assignmentError } = await supabase
        .from('ticket_assignments')
        .insert({
          ticket_id: ticket.id,
          worker_id: finalAssignee,
          organization_id: organizationId,
          is_primary: true
        })

      if (assignmentError) throw assignmentError
    }

    return ticket as TicketWithUser
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
          sender_type: 'worker'
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
    ticket_status: TicketStatus;
    ticket_priority: TicketPriority;
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
            user_status: 'offline'
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
          ticket_status: 'new',
          ticket_priority: 'medium',
          user_id: sampleUser.id,
          created_by_type: 'customer',
          created_by_id: sampleUser.id,
          ticket_source: 'system',
          organization_id: null
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
          worker_id: userId,
          is_primary: true
        }
      ])

    if (assignmentError) throw assignmentError

    return ticket
  },

  async getTicketAssignment(ticketId: string) {
    const { data, error } = await supabase
      .from('ticket_assignments')
      .select(`
        worker:user_profiles!ticket_assignments_worker_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('ticket_id', ticketId)
      .eq('is_primary', true)
      .maybeSingle()

    if (error) throw error
    return data?.worker as Worker | null
  },

  async getOrganizationWorkers(organizationId: string): Promise<Worker[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        profile:user_profiles!inner(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('organization_id', organizationId)
      .eq('profile.user_type', 'worker')

    if (error) throw error
    return data.map(d => d.profile) as Worker[]
  },

  async updateTicketAssignment(ticketId: string, workerId: string | null) {
    // First remove any existing primary assignments
    const { error: deleteError } = await supabase
      .from('ticket_assignments')
      .delete()
      .eq('ticket_id', ticketId)
      .eq('is_primary', true)

    if (deleteError) throw deleteError

    // If we have a new worker to assign, create the assignment
    if (workerId) {
      const { error: insertError } = await supabase
        .from('ticket_assignments')
        .insert({
          ticket_id: ticketId,
          worker_id: workerId,
          is_primary: true
        })

      if (insertError) throw insertError
    }
  },

  async getAllTicketAssignments(organizationId?: string) {
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('Not authenticated')

    // First get the organizations the user is a member of
    const { data: userOrgs } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('profile_id', userProfile.user.id)

    const userOrgIds = organizationId ? [organizationId] : (userOrgs?.map(org => org.organization_id) || [])

    // Get all tickets for the user's organizations
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id')
      .in('organization_id', userOrgIds)

    const ticketIds = tickets?.map(t => t.id) || []

    // Get all assignments for these tickets
    const { data: assignments, error } = await supabase
      .from('ticket_assignments')
      .select(`
        ticket_id,
        worker:worker_id(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .in('ticket_id', ticketIds)

    if (error) throw error
    return assignments
  }
} 