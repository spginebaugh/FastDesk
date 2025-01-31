import { supabase } from '@/config/supabase/client'
import crypto from 'crypto'
import { type Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type Ticket = Database['public']['Tables']['tickets']['Row']

interface CreateSampleTicketParams {
  userId: string
}

export async function createSampleTicket({ userId }: CreateSampleTicketParams): Promise<Ticket> {
  // Get or create the sample user profile
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', 'sample@customer.com')

  if (profilesError) throw profilesError

  let sampleUser: UserProfile
  if (profiles?.[0]) {
    sampleUser = profiles[0]
  } else {
    const sampleUserId = crypto.randomUUID()
    const { data: newProfiles, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        id: sampleUserId,
        email: 'sample@customer.com',
        full_name: 'Sample Customer',
        user_type: 'customer',
        user_status: 'offline',
        auth_provider: null,
        avatar_url: null,
        company: null,
        external_id: null,
        external_metadata: null,
        metadata: {},
        is_active: true,
        last_login_at: null,
        login_count: 0,
        preferences: {}
      } satisfies Omit<UserProfile, 'created_at' | 'updated_at'>)
      .select()

    if (createError) throw createError
    if (!newProfiles?.[0]) throw new Error('Failed to create sample user')
    sampleUser = newProfiles[0]
  }

  // Create the sample ticket
  const { data: tickets, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      title: 'SAMPLE TICKET: Meet the ticket',
      ticket_status: 'new',
      ticket_priority: 'medium',
      user_id: sampleUser.id,
      created_by_type: 'customer',
      created_by_id: sampleUser.id,
      ticket_source: 'system',
      organization_id: null
    } satisfies Partial<Ticket>)
    .select()

  if (ticketError) throw ticketError
  if (!tickets?.[0]) throw new Error('Failed to create sample ticket')
  const ticket = tickets[0]

  // Create the welcome message
  const { error: messageError } = await supabase
    .from('ticket_messages')
    .insert({
      ticket_id: ticket.id,
      content: 'This is a ticket message!!! Welcome to the platform',
      sender_type: 'customer',
      sender_id: sampleUser.id,
      is_internal: false
    })

  if (messageError) throw messageError

  // Assign the ticket to the new user
  const { error: assignmentError } = await supabase
    .from('ticket_assignments')
    .insert({
      ticket_id: ticket.id,
      worker_id: userId,
      is_primary: true
    })

  if (assignmentError) throw assignmentError

  return ticket
} 