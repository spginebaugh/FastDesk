import { supabase } from '@/config/supabase/client'
import { TicketMessage } from '../types'
import { type TiptapContent } from '@/lib/tiptap'
import { type Json } from '@/types/database'
import { getAuthenticatedUser, updateTicketTimestamp } from './helper'

interface GetTicketMessagesParams {
  ticketId: string
}

interface CreateTicketMessageParams {
  ticketId: string
  content: TiptapContent
  isInternal: boolean
}

export async function getTicketMessages({ ticketId }: GetTicketMessagesParams): Promise<TicketMessage[]> {
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
    content_format: 'tiptap',
    sender_type: message.sender_type as 'customer' | 'worker',
    sender: message.sender_id
      ? {
          full_name: sendersMap.get(message.sender_id)?.full_name ?? 'Unknown User',
          avatar_url: sendersMap.get(message.sender_id)?.avatar_url ?? null
        }
      : undefined
  })) as TicketMessage[]
}

export async function createTicketMessage({ 
  ticketId, 
  content, 
  isInternal 
}: CreateTicketMessageParams): Promise<TicketMessage> {
  const user = await getAuthenticatedUser()

  // First create the message
  const { data: message, error: messageError } = await supabase
    .from('ticket_messages')
    .insert([
      {
        ticket_id: ticketId,
        content: content as Json,
        content_format: 'tiptap' as const,
        is_internal: isInternal,
        sender_id: user.id,
        sender_type: 'worker' as const
      }
    ])
    .select()
    .single()

  if (messageError) throw messageError

  // Update the ticket's updated_at timestamp
  await updateTicketTimestamp(ticketId)

  return {
    ...message,
    content_format: 'tiptap',
    sender_type: 'worker',
    sender: {
      full_name: user.user_metadata?.full_name || user.email,
      avatar_url: user.user_metadata?.avatar_url || null
    }
  } as TicketMessage
} 