import { format } from 'date-fns'
import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { UserNotes, type UserNotesRef } from '@/features/users/components/UserNotes'
import { useAINotes } from '@/features/ai-notes/hooks/useAINotes'
import { useUserNotes } from '@/features/users/hooks/useUserNotes'
import type { Database } from '@/types/database'
import * as Popover from '@radix-ui/react-popover'
import { Loader2 } from 'lucide-react'
import { createTiptapContent } from '@/lib/tiptap'

type UserStatus = Database['public']['Enums']['user_status']

interface User {
  id: string
  full_name?: string | null
  email: string
  avatar_url?: string | null
  company?: string | null
  user_status?: UserStatus | null
  created_at?: string | null
}

interface TicketCreatorProfileProps {
  user: User
  organizationId?: string | null
  onUpdateNotes: (updateFn: () => void, hasChanges: boolean) => void
  onSaveNotes: () => void
  hasNoteChanges: boolean
}

export function TicketCreatorProfile({
  user,
  organizationId,
  onUpdateNotes,
  onSaveNotes,
  hasNoteChanges
}: TicketCreatorProfileProps) {
  const [prompt, setPrompt] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  
  // Reference to the UserNotes component
  const notesRef = useRef<UserNotesRef>(null)
  
  // Get access to the updateTags function
  const { updateTags } = useUserNotes({
    userId: user.id,
    organizationId: organizationId || ''
  })
  
  const { generate, isGenerating } = useAINotes({
    userId: user.id,
    organizationId: organizationId || '',
    onSuccess: (result) => {
      // Create Tiptap content from AI generated notes
      const content = createTiptapContent(result.data.notes || '')
      
      // Update the notes in the editor without saving to database
      notesRef.current?.setNoteContent(content)
      
      // Add the AI generated tags
      if (result.data.tags && result.data.tags.length > 0) {
        const newTags = result.data.tags.map(tagName => ({
          id: crypto.randomUUID(),
          name: tagName.trim(),
          color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
        }))
        updateTags(newTags)
      }
      
      setIsPopoverOpen(false)
      setPrompt('')
    },
    onError: (error) => {
      // TODO: Show error toast
      console.error('AI Generation Error:', error)
      setIsPopoverOpen(false)
    },
  })

  const handleGenerate = async () => {
    if (!prompt.trim() || !organizationId) return
    await generate(prompt)
  }

  return (
    <div className="w-80 border-r border-border/50 bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>
              {user.full_name?.split(' ').map((n: string) => n[0]).join('') || user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">
              {user.full_name || 'Unknown User'}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Company</h4>
            <p className="text-sm">{user.company || '-'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Status</h4>
            <div className="mt-1">
              <UserStatusBadge status={user.user_status || 'offline'} />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Created</h4>
            <p className="text-sm">
              {user.created_at 
                ? format(new Date(user.created_at), 'MMM d, yyyy')
                : '-'}
            </p>
          </div>
        </div>

        {/* User Notes Content Section */}
        {organizationId && (
          <div className="space-y-2">
            <UserNotes 
              ref={notesRef}
              userId={user.id} 
              organizationId={organizationId}
              renderButton={false}
              onUpdateNotes={onUpdateNotes}
            />
          </div>
        )}
      </div>

      {/* User Notes Button Section */}
      {organizationId && (
        <div className="p-4 border-t border-border/50 space-y-2">
          <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <Popover.Trigger asChild>
              <Button variant="outline" className="w-full">
                Generate AI Notes
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content 
                className="bg-popover text-popover-foreground p-4 rounded-md shadow-md w-[300px] z-50"
                sideOffset={5}
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Enter Prompt</h4>
                  <Input
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full"
                  />
                  <Button 
                    className="w-full" 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate'
                    )}
                  </Button>
                </div>
                <Popover.Arrow className="fill-popover" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <Button 
            className="w-full"
            onClick={onSaveNotes}
            disabled={!hasNoteChanges}
          >
            Update Notes
          </Button>
        </div>
      )}
    </div>
  )
} 
