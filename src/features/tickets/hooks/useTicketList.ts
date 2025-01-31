import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTickets } from '../services'
import { TicketStatus } from '../types'
import { TicketWithUser } from '../types'

type TicketView = 'assigned' | 'unassigned' | 'all' | 'recent' | 'solved'

interface UseTicketListParams {
  userId?: string
  status?: TicketStatus[]
  unassigned?: boolean
  recentlyUpdated?: boolean
  organizationId?: string
  showAllOrganizationTickets?: boolean
}

// Sub-hook for fetching tickets based on view type
function useTicketViews({ 
  userId,
  status,
  unassigned,
  recentlyUpdated,
  organizationId,
  showAllOrganizationTickets
}: UseTicketListParams) {
  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ['tickets', { userId, status, unassigned, recentlyUpdated, organizationId, showAllOrganizationTickets }],
    queryFn: async () => {
      try {
        const result = await getTickets({ userId, status, unassigned, recentlyUpdated, organizationId, showAllOrganizationTickets })
        return result || []
      } catch (error) {
        console.error('Error fetching tickets:', error)
        return []
      }
    }
  })

  return {
    tickets,
    isLoading,
    error
  }
}

// Sub-hook for managing ticket selection state
function useTicketSelection(tickets: TicketWithUser[]) {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])

  const handleTicketSelection = (ticketId: string, checked: boolean) => {
    if (checked) {
      setSelectedTickets(prev => [...prev, ticketId])
    } else {
      setSelectedTickets(prev => prev.filter(id => id !== ticketId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(tickets.map(t => t.id))
    } else {
      setSelectedTickets([])
    }
  }

  return {
    selectedTickets,
    setSelectedTickets,
    handleTicketSelection,
    handleSelectAll
  }
}

// Main hook that composes the sub-hooks
export function useTicketList({ 
  userId,
  status = ['new', 'open', 'pending'],
  unassigned = false,
  recentlyUpdated = false,
  organizationId,
  view
}: UseTicketListParams & { view?: TicketView } = {}) {
  // Convert view to appropriate flags
  const effectiveParams = {
    userId,
    status: view === 'solved' 
      ? (['closed', 'resolved'] as TicketStatus[])
      : status,
    unassigned: view === 'unassigned' ? true : unassigned,
    recentlyUpdated: view === 'recent' ? true : recentlyUpdated,
    organizationId,
    // Show all organization tickets when view is 'all' or 'solved'
    showAllOrganizationTickets: view === 'all' || view === 'solved'
  }

  const { tickets, isLoading, error } = useTicketViews(effectiveParams)
  const {
    selectedTickets,
    setSelectedTickets,
    handleTicketSelection,
    handleSelectAll
  } = useTicketSelection(tickets)

  return {
    tickets,
    isLoading,
    error,
    selectedTickets,
    setSelectedTickets,
    handleTicketSelection,
    handleSelectAll
  }
} 