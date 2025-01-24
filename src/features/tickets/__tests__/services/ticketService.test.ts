import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ticketService } from '../../services/ticketService'
import { supabase } from '@/config/supabase/client'

// Mock Supabase client
vi.mock('@/config/supabase/client', () => {
  function createMockQuery(returnValue: any) {
    let finalValue = returnValue
    let isSingle = false
    let isMaybeSingle = false

    const chainMethods = {
      eq: vi.fn(() => chainMethods),
      neq: vi.fn(() => chainMethods),
      gt: vi.fn(() => chainMethods),
      gte: vi.fn(() => chainMethods),
      lt: vi.fn(() => chainMethods),
      lte: vi.fn(() => chainMethods),
      like: vi.fn(() => chainMethods),
      ilike: vi.fn(() => chainMethods),
      is: vi.fn(() => chainMethods),
      in: vi.fn(() => chainMethods),
      contains: vi.fn(() => chainMethods),
      containedBy: vi.fn(() => chainMethods),
      range: vi.fn(() => chainMethods),
      textSearch: vi.fn(() => chainMethods),
      filter: vi.fn(() => chainMethods),
      not: vi.fn(() => chainMethods),
      or: vi.fn(() => chainMethods),
      and: vi.fn(() => chainMethods),
      order: vi.fn(() => chainMethods),
      limit: vi.fn(() => chainMethods),
      select: vi.fn(() => chainMethods),
      update: vi.fn((data) => {
        finalValue = { ...finalValue, ...data }
        return chainMethods
      }),
      insert: vi.fn((data) => {
        const dataWithId = Array.isArray(data) 
          ? data.map(item => ({ ...item, id: 'new-ticket-123' }))
          : { ...data, id: 'new-ticket-123' }
        finalValue = dataWithId
        return chainMethods
      }),
      delete: vi.fn(() => chainMethods),
      single: vi.fn(() => {
        isSingle = true
        return chainMethods
      }),
      maybeSingle: vi.fn(() => {
        isMaybeSingle = true
        return chainMethods
      }),
      // Implement a proper thenable interface
      then(onFulfilled?: (value: any) => any, onRejected?: (error: any) => any) {
        let result = finalValue
        if ((isSingle || isMaybeSingle) && Array.isArray(result)) {
          result = result[0]
        }
        return Promise.resolve({ data: result, error: null }).then(
          onFulfilled,
          onRejected
        )
      }
    }

    return chainMethods
  }

  // Define mock data inside the mock implementation
  const mockTicket = {
    id: 'ticket123',
    ticket_status: 'open',
    ticket_priority: 'high',
    user: {
      id: 'user123',
      email: 'test@example.com'
    }
  }

  const mockUserProfile = {
    id: 'user123', // Match this with the auth user id
    email: 'test@example.com',
    user_type: 'agent',
    full_name: 'Test User'
  }

  type MockTables = {
    tickets: typeof mockTicket[];
    organization_members: { organization_id: string; profile_id: string }[];
    user_profiles: typeof mockUserProfile[];
    ticket_assignments: any[];
  }

  const mockTables: MockTables = {
    tickets: [mockTicket],
    organization_members: [{ organization_id: 'org123', profile_id: 'user123' }],
    user_profiles: [mockUserProfile],
    ticket_assignments: []
  }

  return {
    supabase: {
      from: vi.fn((table: keyof MockTables) => createMockQuery(mockTables[table] || null)),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user123', email: 'test@example.com' } },
          error: null
        })
      }
    }
  }
})

describe('ticketService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTickets', () => {
    it('fetches tickets successfully', async () => {
      const result = await ticketService.getTickets()
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('id', 'ticket123')
      expect(supabase.from).toHaveBeenCalledWith('tickets')
    })
  })

  describe('getTicket', () => {
    it('fetches a single ticket by id', async () => {
      const result = await ticketService.getTicket('ticket123')
      expect(result).toHaveProperty('id', 'ticket123')
      expect(supabase.from).toHaveBeenCalledWith('tickets')
    })
  })

  describe('createTicket', () => {
    it('creates a new ticket', async () => {
      const ticketData = {
        title: 'Test Ticket',
        priority: 'high' as const
      }

      const result = await ticketService.createTicket(ticketData)
      expect(result).toHaveProperty('id', 'new-ticket-123')
      expect(supabase.from).toHaveBeenCalledWith('tickets')
    })
  })

  describe('updateTicket', () => {
    it('updates an existing ticket', async () => {
      const ticketData = {
        ticket_status: 'closed' as const,
        ticket_priority: 'low' as const
      }

      const result = await ticketService.updateTicket('ticket123', ticketData)
      expect(result).toBeTruthy()
      expect(supabase.from).toHaveBeenCalledWith('tickets')
    })
  })
}) 