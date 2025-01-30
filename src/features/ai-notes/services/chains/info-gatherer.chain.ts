import { RunnableSequence } from '@langchain/core/runnables'
import { supabase } from '@/config/supabase/client'
import type { GenerationContext, UserContext, NotesContext } from '../../types'

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
      }
    }
    console.error('Error fetching user notes:', error)
    throw new Error('Failed to fetch user notes')
  }

  // Convert the JSON notes to plaintext using the database function
  const { data: plainNotes, error: notesError } = await supabase
    .rpc('user_notes_plaintext', {
      notes: userNotes.user_notes
    })

  if (notesError) {
    console.error('Error converting notes to plaintext:', notesError)
    throw new Error('Failed to convert notes to plaintext')
  }

  return {
    existingNotes: plainNotes || '',
    existingTags: userNotes.user_tags as string[] || [],
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