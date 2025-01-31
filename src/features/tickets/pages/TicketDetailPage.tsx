import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { useState, useMemo, useCallback } from 'react'
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
  
  console.log('[TicketDetailPage] Rendering with ticketId:', ticketId)

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
    mutations: { updateTicketDetails: updateTicket, assignTicket: updateTicketAssignment }
  } = useTicketDetail({ ticketId: ticketId! })

  console.log('[TicketDetailPage] Ticket data:', { 
    isLoading, 
    hasTicket: !!ticket, 
    messageCount: messages?.length 
  })

  // Memoize the AI response parameters with stable references
  const aiResponseParams = useMemo(() => {
    if (!ticket || !messages) {
      return {
        ticketTitle: '',
        originalSenderFullName: 'Unknown User',
        currentWorkerFullName: user?.user_metadata?.full_name,
        ticketContent: '',
        previousMessages: []
      }
    }

    return {
      ticketTitle: ticket.title,
      originalSenderFullName: ticket.user.full_name || 'Unknown User',
      currentWorkerFullName: user?.user_metadata?.full_name,
      ticketContent: messages[0]?.content || '',
      previousMessages: messages.map(msg => ({
        content: msg.content,
        role: msg.sender_type as MessageRole,
        senderFullName: msg.sender?.full_name || 'Unknown User'
      }))
    }
  }, [ticket?.title, ticket?.user.full_name, user?.user_metadata?.full_name, messages])

  const {
    isGenerating,
    generatedContent,
    setGeneratedContent,
    handleGenerateResponse,
    handleGenerateCustomResponse,
    handleGeneratePromptWithContext,
    handleEditResponse,
    handleEditResponseWithContext
  } = useAIResponse(aiResponseParams)

  // Memoize handlers
  const handleTitleClick = useCallback(() => {
    if (!isEditingTitle) {
      setEditedTitle(ticket?.title || '')
      setIsEditingTitle(true)
    }
  }, [isEditingTitle, ticket?.title])

  const handleTitleSubmit = useCallback(async () => {
    if (!ticketId || !editedTitle.trim()) return
    
    try {
      await updateTicket({ title: editedTitle.trim() })
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Failed to update ticket title:', error)
    }
  }, [ticketId, editedTitle, updateTicket])

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit()
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false)
      setEditedTitle(ticket?.title || '')
    }
  }, [handleTitleSubmit, ticket?.title])

  const handleTicketStatusChange = useCallback((ticket_status: TicketStatus) => {
    setPendingChanges(prev => ({ ...prev, ticket_status }))
  }, [])

  const handleTicketPriorityChange = useCallback((ticket_priority: TicketPriority) => {
    setPendingChanges(prev => ({ ...prev, ticket_priority }))
  }, [])

  const handleAssigneeChange = useCallback((assignee: string) => {
    setPendingChanges(prev => ({ ...prev, assignee }))
  }, [])

  const handleSaveChanges = useCallback(async () => {
    if (!ticketId || Object.keys(pendingChanges).length === 0) return

    const updates: any = { ...pendingChanges }
    const assignee = updates.assignee
    delete updates.assignee

    try {
      if (Object.keys(updates).length > 0) {
        await updateTicket(updates)
      }

      if (assignee !== undefined) {
        await updateTicketAssignment(assignee === 'unassigned' ? null : assignee)
      }

      setPendingChanges({})
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }, [ticketId, pendingChanges, updateTicket, updateTicketAssignment])

  const handleUseResponse = useCallback(() => {
    setReplyContent(generatedContent)
    setIsAIReplyOpen(false)
  }, [generatedContent])

  const handleToggleAIReply = useCallback(() => {
    setIsAIReplyOpen(prev => !prev)
  }, [])

  const handleUpdateNotes = useCallback((updateFn: () => void, hasChanges: boolean) => {
    setUpdateNotesFn(() => updateFn)
    setHasNoteChanges(hasChanges)
  }, [])

  const handleSaveNotes = useCallback(() => {
    updateNotesFn?.()
  }, [updateNotesFn])

  // Memoize computed values
  const hasChanges = useMemo(() => 
    Object.keys(pendingChanges).length > 0, 
    [pendingChanges]
  )

  // Memoize props for child components
  const ticketControlsProps = useMemo(() => ({
    ticketStatus: (pendingChanges.ticket_status || ticket?.ticket_status)!,
    ticketPriority: (pendingChanges.ticket_priority || ticket?.ticket_priority)!,
    currentAssignment: currentAssignment || null,
    availableWorkers,
    onStatusChange: handleTicketStatusChange,
    onPriorityChange: handleTicketPriorityChange,
    onAssigneeChange: handleAssigneeChange,
    onSaveChanges: handleSaveChanges,
    hasChanges
  }), [
    pendingChanges.ticket_status,
    pendingChanges.ticket_priority,
    ticket?.ticket_status,
    ticket?.ticket_priority,
    currentAssignment,
    availableWorkers,
    handleTicketStatusChange,
    handleTicketPriorityChange,
    handleAssigneeChange,
    handleSaveChanges,
    hasChanges
  ])

  const ticketCreatorProfileProps = useMemo(() => ({
    user: ticket?.user!,
    organizationId: ticket?.organization_id!,
    onUpdateNotes: handleUpdateNotes,
    onSaveNotes: handleSaveNotes,
    hasNoteChanges
  }), [
    ticket?.user,
    ticket?.organization_id,
    handleUpdateNotes,
    handleSaveNotes,
    hasNoteChanges
  ])

  const aiReplyBoxProps = useMemo(() => ({
    isGenerating,
    generatedContent,
    setGeneratedContent,
    onGenerateResponse: handleGenerateResponse,
    onGenerateCustomResponse: handleGenerateCustomResponse,
    onGeneratePromptWithContext: handleGeneratePromptWithContext,
    onEditResponse: handleEditResponse,
    onEditResponseWithContext: handleEditResponseWithContext,
    onUseResponse: handleUseResponse
  }), [
    isGenerating,
    generatedContent,
    handleGenerateResponse,
    handleGenerateCustomResponse,
    handleGeneratePromptWithContext,
    handleEditResponse,
    handleEditResponseWithContext,
    handleUseResponse
  ])

  const ticketMessagesSectionProps = useMemo(() => ({
    ticketId: ticketId!,
    ticketTitle: ticket?.title || '',
    ticketCreatorId: ticket?.user_id || '',
    currentUserId: user?.id || '',
    messages: messages || [],
    ticketUser: ticket?.user!,
    isAIReplyOpen,
    replyContent,
    onSetReplyContent: setReplyContent,
    onToggleAIReply: handleToggleAIReply
  }), [
    ticketId,
    ticket?.title,
    ticket?.user_id,
    ticket?.user,
    user?.id,
    messages,
    isAIReplyOpen,
    replyContent,
    handleToggleAIReply
  ])

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
            <TicketControls {...ticketControlsProps} />
            <TicketCreatorProfile {...ticketCreatorProfileProps} />
          </>
        ) : (
          <AIReplyBox {...aiReplyBoxProps} />
        )}

        <TicketMessagesSection {...ticketMessagesSectionProps} />
      </div>
    </div>
  )
} 