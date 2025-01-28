import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Database } from '@/types/database'

type DbJson = Database['public']['Tables']['user_notes']['Row']['user_notes']

interface UserNotes {
  content: string
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
      const { data, error } = await supabase
        .from('user_notes')
        .select(`
          id,
          user_notes,
          user_tags,
          updated_at,
          updated_by:updated_by(full_name, email)
        `)
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .maybeSingle()

      if (error) throw error

      // If no record exists yet, return empty data
      if (!data) {
        return {
          notes: { content: '', updated_at: new Date().toISOString() },
          tags: []
        }
      }

      // Safely cast the JSON data to our expected types
      const notesArray = ((data.user_notes as DbJson) || []) as unknown as UserNotes[]
      const notes = notesArray[0] || { 
        content: '', 
        updated_at: data.updated_at,
        updated_by: data.updated_by
      }
      const tags = ((data.user_tags as DbJson) || []) as unknown as UserTag[]

      return {
        notes,
        tags
      }
    },
    enabled: !!userId && !!organizationId
  })

  const updateNotesMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: existingData, error: fetchError } = await supabase
        .from('user_notes')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .maybeSingle()

      if (fetchError) throw fetchError

      const noteData: UserNotes = {
        content,
        updated_at: new Date().toISOString()
      }

      // Wrap the note data in an array to satisfy the JSON array constraint
      const notesArray = [noteData]

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('user_notes')
          .update({
            user_notes: notesArray as unknown as DbJson
          })
          .eq('user_id', userId)
          .eq('organization_id', organizationId)

        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_notes')
          .insert({
            user_id: userId,
            organization_id: organizationId,
            user_notes: notesArray as unknown as DbJson
          })

        if (error) throw error
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
      const { data: existingData, error: fetchError } = await supabase
        .from('user_notes')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('user_notes')
          .update({ 
            user_tags: tags as unknown as DbJson
          })
          .eq('user_id', userId)
          .eq('organization_id', organizationId)

        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_notes')
          .insert({
            user_id: userId,
            organization_id: organizationId,
            user_tags: tags as unknown as DbJson
          })

        if (error) throw error
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
    notes: userNotes?.notes || { content: '', updated_at: new Date().toISOString() },
    tags: userNotes?.tags || [],
    isLoading,
    updateNotes: updateNotesMutation.mutate,
    updateTags: updateTagsMutation.mutate,
    isUpdatingNotes: updateNotesMutation.isPending,
    isUpdatingTags: updateTagsMutation.isPending
  }
} 
