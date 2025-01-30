import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { useUserNotes } from '../hooks/useUserNotes'
import { Loader2, Plus, X } from 'lucide-react'
import { TiptapEditor } from '@/components/ui/tiptap-editor'
import { type TiptapContent, createTiptapContent } from '@/lib/tiptap'

interface UserNotesProps {
  userId: string
  organizationId: string
  renderButton?: boolean
  onUpdate?: () => void
  onUpdateNotes?: (updateFn: () => void, hasChanges: boolean) => void
}

export interface UserNotesRef {
  setNoteContent: (content: TiptapContent) => void
}

export const UserNotes = forwardRef<UserNotesRef, UserNotesProps>(function UserNotes(
  { userId, organizationId, renderButton = true, onUpdate, onUpdateNotes },
  ref
) {
  const [noteContent, setNoteContent] = useState<TiptapContent>(createTiptapContent(''))
  const [newTag, setNewTag] = useState('')
  const {
    notes,
    tags,
    isLoading,
    updateNotes,
    updateTags,
    isUpdatingNotes,
    isUpdatingTags
  } = useUserNotes({ userId, organizationId })

  const currentContent = noteContent
  const serverContent = notes?.content || createTiptapContent('')

  // Initialize note content from the server data
  useEffect(() => {
    if (notes?.content && JSON.stringify(notes.content) !== JSON.stringify(noteContent)) {
      setNoteContent(notes.content)
    }
  }, [notes?.content])

  const handleUpdateNotes = () => {
    if (JSON.stringify(currentContent) === JSON.stringify(serverContent)) return
    updateNotes(currentContent)
    onUpdate?.()
  }

  // Expose handleUpdateNotes to parent
  useEffect(() => {
    if (onUpdateNotes) {
      const hasChanges = JSON.stringify(currentContent) !== JSON.stringify(serverContent)
      onUpdateNotes(handleUpdateNotes, hasChanges)
    }
  }, [onUpdateNotes, noteContent, notes?.content, currentContent, serverContent])

  // Expose setNoteContent to parent through ref
  useImperativeHandle(ref, () => ({
    setNoteContent: (content: TiptapContent) => {
      setNoteContent(content)
    }
  }), [])

  const handleAddTag = () => {
    if (!newTag.trim()) return
    const newTagObj = {
      id: crypto.randomUUID(),
      name: newTag.trim(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
    }
    updateTags([...tags, newTagObj])
    setNewTag('')
  }

  const handleRemoveTag = (tagId: string) => {
    updateTags(tags.filter(tag => tag.id !== tagId))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4" data-user-notes={userId}>
      {/* Tags Section */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium">Tags</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <Badge
              key={tag.id}
              variant="outline"
              style={{ backgroundColor: tag.color + '20' }}
              className="group relative"
            >
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="border-secondary dark:border-secondary-dark"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddTag}
            disabled={!newTag.trim() || isUpdatingTags}
            className="hover:bg-primary/10 hover:text-primary focus:ring-primary border-secondary dark:border-secondary-dark"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Notes</h4>
        <TiptapEditor
          content={noteContent}
          onChange={setNoteContent}
          placeholder="Add notes about this user..."
          className="min-h-[200px] border-secondary dark:border-secondary-dark"
          disabled={isUpdatingNotes}
        />
        {notes?.updated_by && (
          <p className="text-xs text-muted-foreground">
            Last updated by {notes.updated_by.full_name || notes.updated_by.email} on {format(new Date(notes.updated_at), 'MMM d, yyyy h:mm a')}
          </p>
        )}
      </div>

      {renderButton && (
        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleUpdateNotes}
            disabled={JSON.stringify(currentContent) === JSON.stringify(serverContent) || isUpdatingNotes}
            className="w-full"
          >
            {isUpdatingNotes ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Notes'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}) 