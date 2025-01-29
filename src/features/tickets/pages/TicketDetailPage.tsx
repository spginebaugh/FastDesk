import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { type TiptapContent } from '@/lib/tiptap'
import { AIReplyBox } from '../components/AIReplyBox'
import { useAIResponse } from '../hooks/useAIResponse'
import { TicketControls } from '../components/TicketControls'
import { TicketCreatorProfile } from '../components/TicketCreatorProfile'
import { TicketMessagesSection } from '../components/TicketMessagesSection'
import { TicketStatus, TicketPriority } from '../types'
import { useTicketDetail } from '../hooks/useTicketDetail'

const emptyTiptapContent: TiptapContent = {
  type: 'doc',
  content: []
}

type MessageRole = 'user' | 'worker'

export function TicketDetailPage() {
  const { ticketId } = useParams()
  const { user } = useAuthStore()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isAIReplyOpen, setIsAIReplyOpen] = useState(false)
  const [replyContent, setReplyContent] = useState<TiptapContent>(emptyTiptapContent)
  const [pendingChanges, setPendingChanges] = useState<{
    ticket_status?: TicketStatus;
    ticket_priority?: TicketPriority;
    assignee?: string;
  }>({})
  const [updateNotesFn, setUpdateNotesFn] = useState<(() => void) | null>(null)
  const [hasNoteChanges, setHasNoteChanges] = useState(false)

  const {
    ticket,
    messages,
    currentAssignment,
    availableWorkers,
    isLoading,
    mutations: { updateTicket, updateTicketAssignment }
  } = useTicketDetail({ ticketId: ticketId! })

  const {
    isGenerating,
    generatedContent,
    setGeneratedContent,
    handleGenerateResponse,
    handleGenerateCustomResponse,
    handleGeneratePromptWithContext,
    handleEditResponse,
    handleEditResponseWithContext
  } = useAIResponse({
    ticketTitle: ticket?.title || '',
    originalSenderFullName: ticket?.user.full_name || 'Unknown User',
    currentWorkerFullName: user?.user_metadata?.full_name,
    ticketContent: messages?.[0]?.content,
    previousMessages: messages?.map(msg => ({
      content: msg.content,
      role: msg.sender_type as MessageRole,
      senderFullName: msg.sender?.full_name || 'Unknown User'
    })) || []
  })

  const handleTitleClick = () => {
    if (!isEditingTitle) {
      setEditedTitle(ticket?.title || '')
      setIsEditingTitle(true)
    }
  }

  const handleTitleSubmit = async () => {
    if (!ticketId || !editedTitle.trim()) return
    
    try {
      await updateTicket({ title: editedTitle.trim() })
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Failed to update ticket title:', error)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit()
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false)
      setEditedTitle(ticket?.title || '')
    }
  }

  const handleTicketStatusChange = (ticket_status: TicketStatus) => {
    setPendingChanges(prev => ({ ...prev, ticket_status }))
  }

  const handleTicketPriorityChange = (ticket_priority: TicketPriority) => {
    setPendingChanges(prev => ({ ...prev, ticket_priority }))
  }

  const handleAssigneeChange = (assignee: string) => {
    setPendingChanges(prev => ({ ...prev, assignee }))
  }

  const handleSaveChanges = async () => {
    if (!ticketId || Object.keys(pendingChanges).length === 0) return

    const updates: any = { ...pendingChanges }
    const assignee = updates.assignee
    delete updates.assignee

    try {
      // Update ticket details if there are any changes
      if (Object.keys(updates).length > 0) {
        await updateTicket(updates)
      }

      // Update assignment if it changed
      if (assignee !== undefined) {
        await updateTicketAssignment(assignee === 'unassigned' ? null : assignee)
      }

      setPendingChanges({})
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }

  const handleUseResponse = () => {
    setReplyContent(generatedContent)
    setIsAIReplyOpen(false)
  }

  const hasChanges = Object.keys(pendingChanges).length > 0

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!ticket || !messages || !Array.isArray(messages)) {
    return <div className="flex items-center justify-center h-full">Loading ticket data...</div>
  }

  if (messages.length === 0) {
    return <div className="flex items-center justify-center h-full">Ticket not found</div>
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border/50 bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            {isEditingTitle ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                className="text-2xl font-semibold"
                autoFocus
              />
            ) : (
              <h1 
                className="text-2xl font-semibold cursor-pointer hover:text-primary/90"
                onClick={handleTitleClick}
              >
                {ticket.title}
              </h1>
            )}
            <div className="mt-1 text-sm text-muted-foreground">
              Opened by {ticket.user.full_name || ticket.user.email} · {format(new Date(ticket.created_at!), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {!isAIReplyOpen ? (
          <>
            <TicketControls
              ticketStatus={pendingChanges.ticket_status || ticket.ticket_status}
              ticketPriority={pendingChanges.ticket_priority || ticket.ticket_priority}
              currentAssignment={currentAssignment || null}
              availableWorkers={availableWorkers}
              onStatusChange={handleTicketStatusChange}
              onPriorityChange={handleTicketPriorityChange}
              onAssigneeChange={handleAssigneeChange}
              onSaveChanges={handleSaveChanges}
              hasChanges={hasChanges}
            />

            <TicketCreatorProfile
              user={ticket.user}
              organizationId={ticket.organization_id}
              onUpdateNotes={(updateFn, hasChanges) => {
                setUpdateNotesFn(() => updateFn)
                setHasNoteChanges(hasChanges)
              }}
              onSaveNotes={() => updateNotesFn?.()}
              hasNoteChanges={hasNoteChanges}
            />
          </>
        ) : (
          <AIReplyBox 
            isGenerating={isGenerating}
            generatedContent={generatedContent}
            setGeneratedContent={setGeneratedContent}
            onGenerateResponse={handleGenerateResponse}
            onGenerateCustomResponse={handleGenerateCustomResponse}
            onGeneratePromptWithContext={handleGeneratePromptWithContext}
            onEditResponse={handleEditResponse}
            onEditResponseWithContext={handleEditResponseWithContext}
            onUseResponse={handleUseResponse}
          />
        )}

        <TicketMessagesSection
          ticketId={ticketId!}
          ticketTitle={ticket.title}
          ticketCreatorId={ticket.user_id}
          currentUserId={user?.id || ''}
          messages={messages}
          ticketUser={ticket.user}
          isAIReplyOpen={isAIReplyOpen}
          replyContent={replyContent}
          onSetReplyContent={setReplyContent}
          onToggleAIReply={() => setIsAIReplyOpen(!isAIReplyOpen)}
        />
      </div>
    </div>
  )
} 