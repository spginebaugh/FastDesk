import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { createTicket as createTicketService, createTicketMessage, getOrganizationWorkers } from '../services'
import { organizationService } from '@/features/organizations/services/organizationService'
import { TicketPriority } from '../types'
import { useNavigate } from 'react-router-dom'
import { type TiptapContent } from '@/lib/tiptap'

const emptyTiptapContent: TiptapContent = {
  type: 'doc',
  content: []
}

interface InitialSettings {
  ticket_priority?: TicketPriority
  assignee?: string
  organizationId?: string
}

// Sub-hook for managing form state
function useTicketFormState() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<TiptapContent>(emptyTiptapContent)
  const [initialSettings, setInitialSettings] = useState<InitialSettings>({
    ticket_priority: 'low',
    assignee: 'unassigned',
    organizationId: 'unassigned'
  })

  const handleTicketPriorityChange = (ticket_priority: TicketPriority) => {
    setInitialSettings(prev => ({ ...prev, ticket_priority }))
  }

  const handleOrganizationChange = (organizationId: string) => {
    setInitialSettings(prev => ({ 
      ...prev, 
      organizationId,
      assignee: 'unassigned' // Reset assignee when organization changes
    }))
  }

  const handleAssigneeChange = (assignee: string) => {
    setInitialSettings(prev => ({ ...prev, assignee }))
  }

  return {
    title,
    content,
    initialSettings,
    setTitle,
    setContent,
    setInitialSettings,
    handleTicketPriorityChange,
    handleOrganizationChange,
    handleAssigneeChange
  }
}

// Sub-hook for fetching organizations and workers
function useTicketOrganizationsAndWorkers(organizationId: string) {
  // Get user's organizations
  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations()
  })

  // Filter out organizations where user is not a member
  const userOrganizations = organizations.filter(org => 
    org.organization_members && org.organization_members.length > 0
  )

  // Get workers for selected organization
  const { data: workers = [], isLoading: isLoadingWorkers } = useQuery({
    queryKey: ['organization-workers', organizationId],
    queryFn: async () => {
      if (!organizationId || organizationId === 'unassigned') {
        return []
      }
      return getOrganizationWorkers(organizationId)
    },
    enabled: !!organizationId && organizationId !== 'unassigned'
  })

  return {
    organizations: userOrganizations,
    workers,
    isLoadingWorkers
  }
}

// Sub-hook for ticket creation mutation
function useTicketCreation() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const { mutate: createTicket, isPending } = useMutation({
    mutationFn: async ({ title, content, initialSettings, userId }: {
      title: string
      content: TiptapContent
      initialSettings: InitialSettings
      userId?: string
    }) => {
      const ticket = await createTicketService({ 
        title,
        priority: initialSettings.ticket_priority,
        assignee: initialSettings.organizationId === 'unassigned' && initialSettings.assignee === 'unassigned' 
          ? userId  // Auto-assign to current user if both org and assignee are unassigned
          : initialSettings.assignee,
        organizationId: initialSettings.organizationId === 'unassigned' ? null : initialSettings.organizationId
      })
      await createTicketMessage({
        ticketId: ticket.id,
        content,
        isInternal: false
      })
      return ticket
    },
    onSuccess: (ticket) => {
      toast({
        title: 'Ticket created',
        description: 'Your ticket has been created successfully.'
      })
      navigate(`/tickets/${ticket.id}`)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create ticket. Please try again.',
        variant: 'destructive'
      })
    }
  })

  return {
    createTicket,
    isPending
  }
}

// Main hook that composes the sub-hooks
export function useNewTicket(userId: string | undefined) {
  const {
    title,
    content,
    initialSettings,
    setTitle,
    setContent,
    setInitialSettings,
    handleTicketPriorityChange,
    handleOrganizationChange,
    handleAssigneeChange
  } = useTicketFormState()

  const {
    organizations,
    workers,
    isLoadingWorkers
  } = useTicketOrganizationsAndWorkers(initialSettings.organizationId || '')

  const { createTicket, isPending } = useTicketCreation()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim() || !content.content.length) return
    createTicket({ title, content, initialSettings, userId })
  }

  return {
    // Form state
    title,
    content,
    initialSettings,
    setTitle,
    setContent,
    setInitialSettings,
    
    // Data
    organizations,
    workers,
    isLoadingWorkers,
    isPending,
    
    // Handlers
    handleSubmit,
    handleTicketPriorityChange,
    handleOrganizationChange,
    handleAssigneeChange
  }
} 