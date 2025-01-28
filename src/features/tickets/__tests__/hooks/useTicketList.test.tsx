import { renderHook, act, waitFor } from '@testing-library/react'
import { useTicketList } from '../../hooks/useTicketList'
import { ticketService } from '../../services/ticketService'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { TicketWithUser } from '../../types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock dependencies
vi.mock('../../services/ticketService')

// Create a wrapper component with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useTicketList', () => {
  const mockUserId = 'user-123'
  const mockTickets: TicketWithUser[] = [
    {
      id: 'ticket-1',
      title: 'Test Ticket 1',
      ticket_status: 'new',
      ticket_priority: 'low',
      user_id: 'user-1',
      organization_id: 'org-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by_id: 'user-1',
      created_by_type: 'customer',
      custom_fields: {},
      due_date: null,
      external_reference_id: null,
      first_response_at: null,
      integration_metadata: {},
      metadata: {},
      resolved_at: null,
      ticket_source: 'customer_portal',
      user: {
        id: 'user-1',
        full_name: 'Test User 1',
        email: 'user1@example.com',
        avatar_url: null,
        company: null,
        user_status: 'online',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        auth_provider: null,
        external_id: null,
        external_metadata: {},
        is_active: true,
        last_login_at: null,
        user_type: 'customer',
        login_count: 0,
        metadata: {},
        preferences: {}
      }
    },
    {
      id: 'ticket-2',
      title: 'Test Ticket 2',
      ticket_status: 'open',
      ticket_priority: 'high',
      user_id: 'user-2',
      organization_id: 'org-2',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      created_by_id: 'user-2',
      created_by_type: 'customer',
      custom_fields: {},
      due_date: null,
      external_reference_id: null,
      first_response_at: null,
      integration_metadata: {},
      metadata: {},
      resolved_at: null,
      ticket_source: 'customer_portal',
      user: {
        id: 'user-2',
        full_name: 'Test User 2',
        email: 'user2@example.com',
        avatar_url: null,
        company: null,
        user_status: 'offline',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        auth_provider: null,
        external_id: null,
        external_metadata: {},
        is_active: true,
        last_login_at: null,
        user_type: 'customer',
        login_count: 0,
        metadata: {},
        preferences: {}
      }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ticketService.getTickets).mockResolvedValue(mockTickets)
  })

  it('should fetch assigned tickets by default', () => {
    renderHook(() => useTicketList({ userId: mockUserId }), {
      wrapper: createWrapper()
    })

    expect(ticketService.getTickets).toHaveBeenCalledWith({
      userId: mockUserId,
      status: ['new', 'open', 'pending']
    })
  })

  it('should fetch unassigned tickets', () => {
    renderHook(() => useTicketList({ view: 'unassigned', userId: mockUserId }), {
      wrapper: createWrapper()
    })

    expect(ticketService.getTickets).toHaveBeenCalledWith({
      status: ['new', 'open', 'pending'],
      unassigned: true
    })
  })

  it('should fetch all tickets', () => {
    renderHook(() => useTicketList({ view: 'all', userId: mockUserId }), {
      wrapper: createWrapper()
    })

    expect(ticketService.getTickets).toHaveBeenCalledWith({
      status: ['new', 'open', 'pending']
    })
  })

  it('should fetch recent tickets', () => {
    renderHook(() => useTicketList({ view: 'recent', userId: mockUserId }), {
      wrapper: createWrapper()
    })

    expect(ticketService.getTickets).toHaveBeenCalledWith({
      status: ['new', 'open', 'pending'],
      recentlyUpdated: true
    })
  })

  it('should handle ticket selection', () => {
    const { result } = renderHook(() => useTicketList({ userId: mockUserId }), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.handleTicketSelection('ticket-1', true)
    })

    expect(result.current.selectedTickets).toContain('ticket-1')

    act(() => {
      result.current.handleTicketSelection('ticket-1', false)
    })

    expect(result.current.selectedTickets).not.toContain('ticket-1')
  })

  it('should handle select all', async () => {
    // Setup mock response
    vi.mocked(ticketService.getTickets).mockResolvedValue(mockTickets)

    const { result } = renderHook(() => useTicketList({ userId: mockUserId }), {
      wrapper: createWrapper()
    })

    // Wait for the initial data to be loaded
    await waitFor(() => {
      expect(result.current.tickets).toHaveLength(2)
    })

    // Select all tickets
    await act(async () => {
      result.current.handleSelectAll(true)
    })

    // Verify all tickets are selected
    await waitFor(() => {
      expect(result.current.selectedTickets).toEqual(['ticket-1', 'ticket-2'])
    })

    // Deselect all tickets
    await act(async () => {
      result.current.handleSelectAll(false)
    })

    // Verify no tickets are selected
    expect(result.current.selectedTickets).toEqual([])
  })
}) 