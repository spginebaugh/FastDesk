import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getTicket, 
  getTicketMessages, 
  updateTicket, 
  getTicketAssignment, 
  getOrganizationWorkers,
  updateTicketAssignment 
} from '../services'
import { TicketStatus, TicketPriority } from '../types'
import { useToast } from '@/components/ui/use-toast'

interface UseTicketDetailOptions {
  ticketId: string
}

// Sub-hook for fetching ticket data
function useTicketData({ ticketId }: UseTicketDetailOptions) {
  // Fetch ticket details
  const { data: ticket, isLoading: isLoadingTicket } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicket({ ticketId })
  })

  // Fetch ticket messages
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: () => getTicketMessages({ ticketId })
  })

  // Fetch current assignment
  const { data: currentAssignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ['ticket-assignment', ticketId],
    queryFn: () => getTicketAssignment(ticketId)
  })

  return {
    ticket,
    messages,
    currentAssignment,
    isLoading: isLoadingTicket || isLoadingMessages || isLoadingAssignment
  }
}

// Sub-hook for fetching available workers
function useAvailableWorkers(organizationId: string | null | undefined) {
  const { data: availableWorkers = [], isLoading: isLoadingWorkers } = useQuery({
    queryKey: ['organization-workers', organizationId],
    queryFn: () => {
      if (!organizationId) return []
      return getOrganizationWorkers(organizationId)
    },
    enabled: !!organizationId
  })

  return {
    availableWorkers,
    isLoadingWorkers
  }
}

// Sub-hook for ticket mutations
function useTicketMutations(ticketId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Update ticket mutation
  const { mutate: updateTicketDetails } = useMutation({
    mutationFn: (updates: Partial<{ 
      title: string
      ticket_status: TicketStatus
      ticket_priority: TicketPriority 
    }>) => updateTicket({ ticketId, updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      toast({
        title: 'Ticket updated',
        description: 'Ticket settings have been updated successfully.'
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update ticket settings. Please try again.',
        variant: 'destructive'
      })
    }
  })

  // Update assignment mutation
  const { mutate: assignTicket } = useMutation({
    mutationFn: (workerId: string | null) => updateTicketAssignment({ ticketId, workerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-assignment', ticketId] })
      toast({
        title: 'Assignment updated',
        description: 'Ticket assignment has been updated successfully.'
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update ticket assignment. Please try again.',
        variant: 'destructive'
      })
    }
  })

  return {
    updateTicketDetails,
    assignTicket
  }
}

// Main hook that composes the sub-hooks
export function useTicketDetail({ ticketId }: UseTicketDetailOptions) {
  const {
    ticket,
    messages,
    currentAssignment,
    isLoading: isLoadingTicketData
  } = useTicketData({ ticketId })

  const {
    availableWorkers,
    isLoadingWorkers
  } = useAvailableWorkers(ticket?.organization_id)

  const mutations = useTicketMutations(ticketId)

  return {
    ticket,
    messages,
    currentAssignment,
    availableWorkers,
    isLoading: isLoadingTicketData || isLoadingWorkers,
    mutations
  }
} 