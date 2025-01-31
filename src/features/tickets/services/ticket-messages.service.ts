import { api } from '@/config/api/client'
import { TicketMessage } from '../types'
import { type TiptapContent } from '@/lib/tiptap'
import { type Database, type Json } from '@/types/database'
import { getAuthenticatedUser, updateTicketTimestamp } from './helper'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type TicketMessageRow = Database['public']['Tables']['ticket_messages']['Row']

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
  const { data: messages, error: messagesError } = await api
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (messagesError) throw messagesError
  if (!messages?.length) return []

  // Then get all unique sender IDs
  const senderIds = messages
    .map(m => m.sender_id)
    .filter((id): id is string => id !== null)

  if (!senderIds.length) {
    return messages.map((message): TicketMessage => ({
      ...message,
      content_format: 'tiptap',
      sender_type: message.sender_type as 'customer' | 'worker'
    }))
  }

  // Fetch all senders in one query
  const { data: senders, error: sendersError } = await api
    .from('user_profiles')
    .select('*')
    .in('id', senderIds)

  if (sendersError) throw sendersError

  // Create lookup map
  const sendersMap = new Map(senders?.map((p: UserProfile) => [p.id, p]) || [])

  // Map messages with their senders
  return messages.map((message): TicketMessage => ({
    ...message,
    content_format: 'tiptap',
    sender_type: message.sender_type as 'customer' | 'worker',
    sender: message.sender_id
      ? {
          full_name: sendersMap.get(message.sender_id)?.full_name ?? 'Unknown User',
          avatar_url: sendersMap.get(message.sender_id)?.avatar_url ?? null
        }
      : undefined
  }))
}

export async function createTicketMessage({ 
  ticketId, 
  content, 
  isInternal 
}: CreateTicketMessageParams): Promise<TicketMessage> {
  const user = await getAuthenticatedUser()

  // First create the message
  const { data: messages, error: createError } = await api
    .from('ticket_messages')
    .insert({
      ticket_id: ticketId,
      content: content as Json,
      content_format: 'tiptap' as const,
      is_internal: isInternal,
      sender_id: user.id,
      sender_type: 'worker' as const,
      updated_at: new Date().toISOString()
    } satisfies Omit<TicketMessageRow, 'id' | 'created_at'>)
    .select()

  if (createError) throw createError
  if (!messages?.[0]) throw new Error('Failed to create message')

  // Update the ticket's updated_at timestamp
  await updateTicketTimestamp(ticketId)

  return {
    ...messages[0],
    content_format: 'tiptap',
    sender_type: 'worker',
    sender: {
      full_name: user.user_metadata?.full_name || user.email || 'Unknown User',
      avatar_url: user.user_metadata?.avatar_url || null
    }
  }
} 