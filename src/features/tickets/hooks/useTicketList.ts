import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTickets } from '../services'
import { TicketStatus } from '../types'
import { TicketWithUser } from '../types'

type TicketView = 'assigned' | 'unassigned' | 'all' | 'recent'

interface UseTicketListOptions {
  view?: TicketView
  userId?: string
}

interface UseTicketListParams {
  userId?: string
  status?: TicketStatus[]
  unassigned?: boolean
  recentlyUpdated?: boolean
  organizationId?: string
}

// Sub-hook for fetching tickets based on view type
function useTicketViews({ view = 'assigned', userId }: UseTicketListOptions) {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', { userId, status: ['new', 'open', 'pending'], unassigned: false, recentlyUpdated: false, organizationId: undefined }],
    queryFn: () => getTickets({ userId, status: ['new', 'open', 'pending'], unassigned: false, recentlyUpdated: false, organizationId: undefined })
  })

  return {
    tickets,
    isLoading
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
  organizationId
}: UseTicketListParams = {}) {
  const { tickets, isLoading } = useTicketViews({ view: 'assigned', userId })
  const {
    selectedTickets,
    setSelectedTickets,
    handleTicketSelection,
    handleSelectAll
  } = useTicketSelection(tickets)

  return {
    tickets,
    isLoading,
    selectedTickets,
    setSelectedTickets,
    handleTicketSelection,
    handleSelectAll
  }
} 