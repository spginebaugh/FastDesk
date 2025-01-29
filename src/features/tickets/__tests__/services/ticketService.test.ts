import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTicket, getTickets, getTicket, createTicketMessage } from '../../services'
import { supabase } from '@/config/supabase/client'

// Mock Supabase client
vi.mock('@/config/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}))

describe('Ticket Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTickets', () => {
    it('should fetch tickets with correct parameters', async () => {
      const mockUser = { user: { id: 'user123', email: 'test@example.com' } }
      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as any)
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: [], error: null })
      } as any)

      await getTickets({})

      expect(supabase.from).toHaveBeenCalledWith('tickets')
      expect(supabase.auth.getUser).toHaveBeenCalled()
    })
  })

  describe('getTicket', () => {
    it('should fetch a single ticket', async () => {
      const mockUser = { user: { id: 'user123', email: 'test@example.com' } }
      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as any)
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'ticket123' }, error: null })
      } as any)

      const result = await getTicket({ ticketId: 'ticket123' })

      expect(result).toEqual({ id: 'ticket123' })
      expect(supabase.from).toHaveBeenCalledWith('tickets')
    })
  })

  describe('createTicket', () => {
    it('should create a ticket with correct data', async () => {
      const mockUser = { user: { id: 'user123', email: 'test@example.com' } }
      const mockProfile = { id: 'profile123', user_type: 'worker' }
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as any)
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockProfile, error: null })
          .mockResolvedValueOnce({ data: { id: 'ticket123' }, error: null })
      } as any)

      const result = await createTicket({ 
        title: 'Test Ticket',
        priority: 'low'
      })

      expect(result).toEqual({ id: 'ticket123' })
      expect(supabase.from).toHaveBeenCalledWith('tickets')
    })
  })

  describe('createTicketMessage', () => {
    it('should create a ticket message', async () => {
      const mockUser = { user: { id: 'user123', email: 'test@example.com' } }
      vi.mocked(supabase.auth.getUser).mockResolvedValue(mockUser as any)
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'message123' }, error: null })
      } as any)

      const result = await createTicketMessage({ 
        ticketId: 'ticket123',
        content: { type: 'doc', content: [] },
        isInternal: false
      })

      expect(result).toEqual({ id: 'message123' })
      expect(supabase.from).toHaveBeenCalledWith('ticket_messages')
    })
  })
}) 