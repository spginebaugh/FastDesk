import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TicketStatus, TicketPriority } from '../types'
import { TicketReplyBox } from '../components/TicketReplyBox'
import { TicketMessage } from '../components/TicketMessage'
import { TicketStatusSelect } from '@/components/shared/TicketStatusSelect'
import { TicketPrioritySelect } from '@/components/shared/TicketPrioritySelect'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { useTicketDetail } from '../hooks/useTicketDetail'
import { BotIcon, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { openAIService } from '@/services/openai-service'

interface AIReplyBoxProps {
  isGenerating: boolean
  onGenerateResponse: () => void
  onGenerateCustomResponse: (prompt: string) => void
  onGeneratePromptWithContext: (prompt: string) => void
  onEditResponse: (prompt: string) => void
  onEditResponseWithContext: (prompt: string) => void
  generatedContent: string
  setGeneratedContent: (content: string) => void
  onUseResponse: () => void
}

function AIReplyBox({ 
  isGenerating, 
  onGenerateResponse, 
  onGenerateCustomResponse,
  onGeneratePromptWithContext,
  onEditResponse,
  onEditResponseWithContext,
  generatedContent,
  setGeneratedContent,
  onUseResponse 
}: AIReplyBoxProps) {
  const [prompt, setPrompt] = useState('')

  return (
    <div className="w-[36rem] border-r border-border/50 bg-background p-6 flex flex-col">
      <div className="flex items-center mb-4">
        <h2 className="text-lg font-semibold">AI Reply Assistant</h2>
      </div>
      
      <div className="flex-1 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Custom Prompt</label>
          <Textarea 
            className="min-h-[100px]"
            placeholder="Enter a custom prompt to guide the AI response..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Generated Response</label>
          <Textarea 
            className="min-h-[300px] mb-2"
            placeholder={isGenerating ? "AI is generating a response..." : "Generated response will appear here. You can edit it after generation."}
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
          />
          <div className="flex justify-between items-center gap-2">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={onGenerateResponse}
                disabled={isGenerating}
                className={cn(
                  "border-border/50 text-foreground",
                  "hover:bg-primary/10 hover:text-primary",
                  "focus:ring-primary",
                  "bg-background-alt",
                  isGenerating && "opacity-50"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Auto Generate Response'
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isGenerating || !prompt.trim()}
                    className={cn(
                      "border-border/50 text-foreground",
                      "hover:bg-primary/10 hover:text-primary",
                      "focus:ring-primary",
                      "bg-background-alt",
                      (isGenerating || !prompt.trim()) && "opacity-50"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Response from Prompt
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onGenerateCustomResponse(prompt)}
                    disabled={isGenerating || !prompt.trim()}
                  >
                    Without Message Context
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onGeneratePromptWithContext(prompt)}
                    disabled={isGenerating || !prompt.trim()}
                  >
                    With Message Context
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isGenerating || !prompt.trim() || !generatedContent.trim()}
                    className={cn(
                      "border-border/50 text-foreground",
                      "hover:bg-primary/10 hover:text-primary",
                      "focus:ring-primary",
                      "bg-background-alt",
                      (isGenerating || !prompt.trim() || !generatedContent.trim()) && "opacity-50"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Edit Generated Response from Prompt
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onEditResponse(prompt)}
                    disabled={isGenerating || !prompt.trim() || !generatedContent.trim()}
                  >
                    Without Message Context
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onEditResponseWithContext(prompt)}
                    disabled={isGenerating || !prompt.trim() || !generatedContent.trim()}
                  >
                    With Message Context
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <Button 
          onClick={onUseResponse}
          disabled={!generatedContent || isGenerating}
        >
          Use Response
        </Button>
      </div>
    </div>
  )
}

export function TicketDetailPage() {
  const { ticketId } = useParams()
  const { user } = useAuthStore()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [isAIReplyOpen, setIsAIReplyOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [pendingChanges, setPendingChanges] = useState<{
    ticket_status?: TicketStatus;
    ticket_priority?: TicketPriority;
    assignee?: string;
  }>({})

  const {
    ticket,
    messages,
    currentAssignment,
    availableWorkers,
    isLoading,
    mutations: { updateTicket, updateTicketAssignment }
  } = useTicketDetail({ ticketId: ticketId! })

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
            {/* Left Section - Ticket Controls */}
            <div className="w-64 border-r border-border/50 bg-background p-4 flex flex-col">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <TicketStatusSelect
                    value={pendingChanges.ticket_status || ticket.ticket_status}
                    onValueChange={handleTicketStatusChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assignee</label>
                  <Select
                    value={pendingChanges.assignee || (currentAssignment ? currentAssignment.id : 'unassigned')}
                    onValueChange={handleAssigneeChange}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue>
                        {currentAssignment ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={currentAssignment.avatar_url || undefined} />
                              <AvatarFallback>
                                {currentAssignment.full_name?.[0]?.toUpperCase() || currentAssignment.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{currentAssignment.full_name || currentAssignment.email}</span>
                          </div>
                        ) : (
                          'Unassigned'
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <span className="text-muted-foreground">Unassigned</span>
                      </SelectItem>
                      {availableWorkers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={worker.avatar_url || undefined} />
                              <AvatarFallback>
                                {worker.full_name?.[0]?.toUpperCase() || worker.email?.[0]?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{worker.full_name || worker.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <TicketPrioritySelect
                    value={pendingChanges.ticket_priority || ticket.ticket_priority}
                    onValueChange={handleTicketPriorityChange}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 mt-4">
                <Button 
                  className="w-full"
                  onClick={handleSaveChanges}
                  disabled={!hasChanges}
                >
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Middle Section - Ticket Creator Profile */}
            <div className="w-80 border-r border-border/50 bg-background p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={ticket.user.avatar_url || undefined} />
                    <AvatarFallback>
                      {ticket.user.full_name?.split(' ').map((n: string) => n[0]).join('') || ticket.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {ticket.user.full_name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{ticket.user.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">Company</h4>
                    <p className="text-sm">{ticket.user.company || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Status</h4>
                    <div className="mt-1">
                      <UserStatusBadge status={ticket.user.user_status || 'offline'} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Created</h4>
                    <p className="text-sm">
                      {ticket.user.created_at 
                        ? format(new Date(ticket.user.created_at), 'MMM d, yyyy')
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <AIReplyBox 
            isGenerating={isGenerating}
            generatedContent={generatedContent}
            setGeneratedContent={setGeneratedContent}
            onGenerateResponse={async () => {
              try {
                setIsGenerating(true)
                const response = await openAIService.generateTicketResponse({
                  ticketTitle: ticket.title,
                  ticketContent: messages[0]?.content || '',
                  originalSenderFullName: ticket.user.full_name || ticket.user.email,
                  currentWorkerFullName: user?.user_metadata?.full_name,
                  previousMessages: messages.map(msg => ({
                    content: msg.content,
                    role: msg.sender_type === 'customer' ? 'user' : 'worker',
                    senderFullName: msg.sender_type === 'customer' 
                      ? (ticket.user.full_name || ticket.user.email)
                      : (msg.sender?.full_name || 'Support Worker')
                  }))
                })
                setGeneratedContent(response)
              } catch (error) {
                console.error('Failed to generate AI response:', error)
                // TODO: Show error toast
              } finally {
                setIsGenerating(false)
              }
            }}
            onGenerateCustomResponse={async (prompt) => {
              try {
                setIsGenerating(true)
                const response = await openAIService.generateCustomResponse({
                  prompt
                })
                setGeneratedContent(response)
              } catch (error) {
                console.error('Failed to generate custom AI response:', error)
                // TODO: Show error toast
              } finally {
                setIsGenerating(false)
              }
            }}
            onGeneratePromptWithContext={async (prompt) => {
              try {
                setIsGenerating(true)
                const response = await openAIService.generatePromptWithContext({
                  ticketTitle: ticket.title,
                  ticketContent: messages[0]?.content || '',
                  originalSenderFullName: ticket.user.full_name || ticket.user.email,
                  currentWorkerFullName: user?.user_metadata?.full_name,
                  previousMessages: messages.map(msg => ({
                    content: msg.content,
                    role: msg.sender_type === 'customer' ? 'user' : 'worker',
                    senderFullName: msg.sender_type === 'customer' 
                      ? (ticket.user.full_name || ticket.user.email)
                      : (msg.sender?.full_name || 'Support Worker')
                  })),
                  prompt
                })
                setGeneratedContent(response)
              } catch (error) {
                console.error('Failed to generate AI response with prompt:', error)
                // TODO: Show error toast
              } finally {
                setIsGenerating(false)
              }
            }}
            onEditResponse={async (prompt) => {
              try {
                setIsGenerating(true)
                const response = await openAIService.editResponse({
                  prompt,
                  currentResponse: generatedContent
                })
                setGeneratedContent(response)
              } catch (error) {
                console.error('Failed to edit response:', error)
                // TODO: Show error toast
              } finally {
                setIsGenerating(false)
              }
            }}
            onEditResponseWithContext={async (prompt) => {
              try {
                setIsGenerating(true)
                const response = await openAIService.editResponseWithContext({
                  ticketTitle: ticket.title,
                  ticketContent: messages[0]?.content || '',
                  originalSenderFullName: ticket.user.full_name || ticket.user.email,
                  currentWorkerFullName: user?.user_metadata?.full_name,
                  previousMessages: messages.map(msg => ({
                    content: msg.content,
                    role: msg.sender_type === 'customer' ? 'user' : 'worker',
                    senderFullName: msg.sender_type === 'customer' 
                      ? (ticket.user.full_name || ticket.user.email)
                      : (msg.sender?.full_name || 'Support Worker')
                  })),
                  prompt,
                  currentResponse: generatedContent
                })
                setGeneratedContent(response)
              } catch (error) {
                console.error('Failed to edit response with context:', error)
                // TODO: Show error toast
              } finally {
                setIsGenerating(false)
              }
            }}
            onUseResponse={() => {
              setReplyContent(generatedContent)
              setIsAIReplyOpen(false)
            }}
          />
        )}

        {/* Right Section - Messages */}
        <div className="flex-1 flex flex-col min-w-0 max-w-[calc(100%-36rem)] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <TicketMessage 
                key={message.id} 
                message={message}
                isInitialMessage={index === 0}
                user={message.sender_type === 'customer' ? ticket.user : message.sender}
                ticketCreatorId={ticket.user_id}
                currentUserId={user?.id || ''}
              />
            ))}
          </div>
          <div className="relative">
            <TicketReplyBox 
              ticketId={ticketId!} 
              ticketTitle={ticket.title}
              ticketContent={messages[0]?.content || ''}
              originalSenderFullName={ticket.user.full_name || ticket.user.email}
              currentWorkerFullName={user?.user_metadata?.full_name}
              previousMessages={messages.map(msg => ({
                content: msg.content,
                role: msg.sender_type === 'customer' ? 'user' : 'worker',
                senderFullName: msg.sender_type === 'customer' 
                  ? (ticket.user.full_name || ticket.user.email)
                  : (msg.sender?.full_name || 'Support Worker')
              }))}
              initialContent={replyContent}
              onSetContent={setReplyContent}
              rightElement={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 ml-2",
                    isAIReplyOpen && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsAIReplyOpen(!isAIReplyOpen)
                  }}
                  type="button"
                >
                  <BotIcon className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
} 