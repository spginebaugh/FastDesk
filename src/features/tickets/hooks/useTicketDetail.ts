import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useCallback } from 'react'
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
  // Fetch ticket details with proper caching settings
  const { data: ticket, isLoading: isLoadingTicket } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicket({ ticketId }),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 3600000, // Cache for 1 hour
    enabled: !!ticketId
  })

  // Fetch ticket messages with proper caching
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: () => getTicketMessages({ ticketId }),
    staleTime: 30000,
    gcTime: 3600000,
    enabled: !!ticketId
  })

  // Fetch current assignment with proper caching
  const { data: currentAssignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ['ticket-assignment', ticketId],
    queryFn: () => getTicketAssignment(ticketId),
    staleTime: 30000,
    gcTime: 3600000,
    enabled: !!ticketId
  })

  // Memoize the return value
  return useMemo(() => ({
    ticket,
    messages,
    currentAssignment,
    isLoading: isLoadingTicket || isLoadingMessages || isLoadingAssignment
  }), [
    ticket,
    messages,
    currentAssignment,
    isLoadingTicket,
    isLoadingMessages,
    isLoadingAssignment
  ])
}

// Sub-hook for fetching available workers
function useAvailableWorkers(organizationId: string | null | undefined) {
  const { data: availableWorkers = [], isLoading: isLoadingWorkers } = useQuery({
    queryKey: ['organization-workers', organizationId],
    queryFn: () => {
      if (!organizationId) return []
      return getOrganizationWorkers(organizationId)
    },
    staleTime: 30000,
    gcTime: 3600000,
    enabled: !!organizationId
  })

  return useMemo(() => ({
    availableWorkers,
    isLoadingWorkers
  }), [availableWorkers, isLoadingWorkers])
}

// Sub-hook for ticket mutations
function useTicketMutations(ticketId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutateAsync: updateTicketMutation } = useMutation({
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
        description: 'Failed to update ticket settings.',
        variant: 'destructive'
      })
    }
  })

  const { mutateAsync: updateAssignmentMutation } = useMutation({
    mutationFn: (workerId: string | null) => updateTicketAssignment({ ticketId, workerId }),
    onSuccess: () => {
      // Invalidate both ticket and assignment queries
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['ticket-assignment', ticketId] })
      toast({
        title: 'Assignment updated',
        description: 'Ticket assignment has been updated successfully.'
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update ticket assignment.',
        variant: 'destructive'
      })
    }
  })

  return useMemo(() => ({
    updateTicket: updateTicketMutation,
    updateTicketAssignment: updateAssignmentMutation
  }), [updateTicketMutation, updateAssignmentMutation])
}

// Main hook that composes the sub-hooks
export function useTicketDetail({ ticketId }: UseTicketDetailOptions) {
  const ticketData = useTicketData({ ticketId })
  const availableWorkersData = useAvailableWorkers(ticketData.ticket?.organization_id)
  const mutations = useTicketMutations(ticketId)

  return useMemo(() => ({
    ...ticketData,
    ...availableWorkersData,
    mutations
  }), [ticketData, availableWorkersData, mutations])
} 