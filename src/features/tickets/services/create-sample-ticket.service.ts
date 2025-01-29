import { supabase } from '@/config/supabase/client'
import crypto from 'crypto'

interface CreateSampleTicketParams {
  userId: string
}

export async function createSampleTicket({ userId }: CreateSampleTicketParams) {
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
} 