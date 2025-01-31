import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/config/api/client'
import { useToast } from '@/components/ui/use-toast'
import { type Json } from '@/types/database'
import { type TiptapContent, createTiptapContent, extractPlainText } from '@/lib/tiptap'

interface UserNotes {
  content: TiptapContent
  content_format: 'tiptap' | 'plain'
  plaintext: string
  created_at: string
  updated_at: string
  updated_by?: {
    full_name: string
    email: string
  }
}

interface UserTag {
  id: string
  name: string
  color?: string
}

interface UseUserNotesOptions {
  userId: string
  organizationId: string
}

export function useUserNotes({ userId, organizationId }: UseUserNotesOptions) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: userNotes, isLoading } = useQuery({
    queryKey: ['user-notes', userId, organizationId],
    queryFn: async () => {
      const { data: notes, error } = await api
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)

      if (error) throw error

      const now = new Date().toISOString()
      const emptyNote: UserNotes = {
        content: createTiptapContent(''),
        content_format: 'tiptap',
        plaintext: '',
        created_at: now,
        updated_at: now
      }

      // If no record exists yet, return empty data
      if (!notes?.[0]) {
        return {
          notes: emptyNote,
          tags: []
        }
      }

      const note = notes[0]

      // Safely cast the JSON data to our expected types
      const notesArray = Array.isArray(note.user_notes) 
        ? (note.user_notes as unknown as UserNotes[]) 
        : []
      
      const noteData = notesArray[0] || {
        ...emptyNote,
        updated_at: note.updated_at,
        updated_by: note.updated_by
      }

      // Ensure notes.content is a valid TiptapContent
      if (!noteData.content || typeof noteData.content !== 'object' || !('type' in noteData.content)) {
        noteData.content = createTiptapContent(noteData.plaintext || '')
      }

      const tags = Array.isArray(note.user_tags) 
        ? (note.user_tags as unknown as UserTag[]) 
        : []

      return {
        notes: noteData,
        tags
      }
    },
    enabled: !!userId && !!organizationId
  })

  const updateNotesMutation = useMutation({
    mutationFn: async (content: TiptapContent) => {
      const { data: existingNotes, error: selectError } = await api
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)

      if (selectError) throw selectError

      const now = new Date().toISOString()
      const noteData: UserNotes = {
        content,
        content_format: 'tiptap',
        plaintext: extractPlainText(content),
        created_at: now,
        updated_at: now
      }

      // Wrap the note data in an array to satisfy the JSON array constraint
      const notesArray = [noteData] as unknown as Json

      if (existingNotes?.[0]) {
        // Update existing record
        const { error: updateError } = await api
          .from('user_notes')
          .update({ user_notes: notesArray })
          .eq('user_id', userId)
          .eq('organization_id', organizationId)

        if (updateError) throw updateError
      } else {
        // Create new record
        const { error: insertError } = await api
          .from('user_notes')
          .insert({
            user_id: userId,
            organization_id: organizationId,
            user_notes: notesArray
          })

        if (insertError) throw insertError
      }

      return noteData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notes', userId, organizationId] })
      toast({
        title: 'Notes updated',
        description: 'The notes have been updated successfully.',
        duration: 2000 // Auto dismiss after 2 seconds
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update notes. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const updateTagsMutation = useMutation({
    mutationFn: async (tags: UserTag[]) => {
      const { data: existingNotes, error: selectError } = await api
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)

      if (selectError) throw selectError

      const tagsJson = tags as unknown as Json

      if (existingNotes?.[0]) {
        // Update existing record
        const { error: updateError } = await api
          .from('user_notes')
          .update({ user_tags: tagsJson })
          .eq('user_id', userId)
          .eq('organization_id', organizationId)

        if (updateError) throw updateError
      } else {
        // Create new record
        const { error: insertError } = await api
          .from('user_notes')
          .insert({
            user_id: userId,
            organization_id: organizationId,
            user_tags: tagsJson
          })

        if (insertError) throw insertError
      }

      return tags
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notes', userId, organizationId] })
      toast({
        title: 'Tags updated',
        description: 'The tags have been updated successfully.',
        duration: 2000 // Auto dismiss after 2 seconds
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update tags. Please try again.',
        variant: 'destructive'
      })
    }
  })

  return {
    notes: userNotes?.notes || {
      content: createTiptapContent(''),
      content_format: 'tiptap',
      plaintext: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    tags: userNotes?.tags || [],
    isLoading,
    updateNotes: updateNotesMutation.mutate,
    updateTags: updateTagsMutation.mutate,
    isUpdatingNotes: updateNotesMutation.isPending,
    isUpdatingTags: updateTagsMutation.isPending
  }
} 
