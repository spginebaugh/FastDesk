import { RunnableSequence } from '@langchain/core/runnables'
import { supabase } from '@/config/supabase/client'
import type { GenerationContext, UserContext, NotesContext } from '../../types'
import type { Json } from '@/types/database'
import { getTicketMessages } from '@/features/tickets/services'

interface InfoGathererInput {
  userId: string
  organizationId: string
}

async function getUserInfo(userId: string): Promise<UserContext> {
  const { data: user, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, company, created_at')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user info:', error)
    throw new Error('Failed to fetch user information')
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    company: user.company,
    createdAt: user.created_at,
  }
}

async function getUserTicketMessages(userId: string): Promise<string> {
  // Get all tickets created by the user
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('id, title, ticket_status')
    .eq('user_id', userId)

  if (ticketsError) {
    console.error('Error fetching user tickets:', ticketsError)
    return ''
  }

  if (!tickets || tickets.length === 0) {
    return ''
  }

  // Get messages from all tickets
  const messagePromises = tickets.map(async ticket => {
    const messages = await getTicketMessages({ ticketId: ticket.id })
    
    // Format all messages with sender type and content
    const formattedMessages = messages.map(msg => {
      if (!msg.content) return ''
      
      const content = typeof msg.content === 'string' 
        ? msg.content 
        : typeof msg.content === 'object' && msg.content !== null && 'plaintext' in msg.content
          ? String(msg.content.plaintext)
          : JSON.stringify(msg.content)
      
      const senderType = msg.sender_type === 'customer' ? 'Customer' : 'Agent'
      const senderName = msg.sender?.full_name || 'Unknown'
          
      return `[${senderType} - ${senderName}] ${content}`
    })
    .filter(Boolean)
    .join('\n')

    // Capitalize and format ticket status
    const formattedStatus = ticket.ticket_status.charAt(0).toUpperCase() + ticket.ticket_status.slice(1)
    return `[Ticket: ${ticket.title} - Status: ${formattedStatus}]\n${formattedMessages}`
  })

  const messageResults = await Promise.all(messagePromises)
  return messageResults.filter(Boolean).join('\n\n')
}

async function getNotesContext(userId: string, organizationId: string): Promise<NotesContext> {
  const { data: userNotes, error } = await supabase
    .from('user_notes')
    .select('user_notes, user_tags')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No notes found
      return {
        existingNotes: '',
        existingTags: [],
        ticketMessages: '',
      }
    }
    console.error('Error fetching user notes:', error)
    throw new Error('Failed to fetch user notes')
  }

  console.log('[InfoGatherer] Raw user notes from DB:', userNotes.user_notes)

  // Extract plaintext from the notes structure
  let plaintext = ''
  if (Array.isArray(userNotes.user_notes) && userNotes.user_notes.length > 0) {
    const note = userNotes.user_notes[0]
    if (typeof note === 'object' && note !== null && 'plaintext' in note) {
      plaintext = note.plaintext as string
    }
  }

  console.log('[InfoGatherer] Extracted plaintext:', plaintext)

  // Get ticket messages
  const ticketMessages = await getUserTicketMessages(userId)
  console.log('[InfoGatherer] Extracted ticket messages:', ticketMessages)

  // Transform user_tags from Json to the correct type
  const tags = userNotes.user_tags as Json[] || []
  const transformedTags = tags.map(tag => {
    if (typeof tag === 'object' && tag !== null && 'id' in tag && 'name' in tag) {
      return {
        id: String(tag.id),
        name: String(tag.name)
      }
    }
    return null
  }).filter((tag): tag is { id: string; name: string } => tag !== null)

  return {
    existingNotes: plaintext,
    existingTags: transformedTags,
    ticketMessages,
  }
}

export const createInfoGathererChain = () => {
  const gatherInfo = async (input: InfoGathererInput): Promise<GenerationContext> => {
    const userContext = await getUserInfo(input.userId)
    const notesContext = await getNotesContext(input.userId, input.organizationId)
    
    return {
      user: userContext,
      notes: notesContext,
    }
  }

  return RunnableSequence.from([
    {
      gather: gatherInfo,
    },
    async (input: { gather: GenerationContext }) => input.gather,
  ])
}

export type InfoGathererChain = ReturnType<typeof createInfoGathererChain> 