import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ticketService } from '../services/ticketService'
import { TicketWithUser } from '../types'

type TicketView = 'assigned' | 'unassigned' | 'all' | 'recent'

interface UseTicketListOptions {
  view?: TicketView
  userId?: string
}

// Sub-hook for fetching tickets based on view type
function useTicketViews({ view = 'assigned', userId }: UseTicketListOptions) {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', userId, view],
    queryFn: () => {
      switch (view) {
        case 'assigned':
          return ticketService.getTickets({ 
            userId,
            status: ['new', 'open', 'pending']
          })
        case 'unassigned':
          return ticketService.getTickets({ 
            status: ['new', 'open', 'pending'],
            unassigned: true
          })
        case 'all':
          return ticketService.getTickets({ 
            status: ['new', 'open', 'pending']
          })
        case 'recent':
          return ticketService.getTickets({ 
            status: ['new', 'open', 'pending'],
            recentlyUpdated: true
          })
        default:
          return ticketService.getTickets({ 
            userId,
            status: ['new', 'open', 'pending']
          })
      }
    },
    enabled: !!userId
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
export function useTicketList({ view = 'assigned', userId }: UseTicketListOptions) {
  const { tickets, isLoading } = useTicketViews({ view, userId })
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