import { renderHook, act } from '@testing-library/react'
import { useNewTicket } from '../../hooks/useNewTicket'
import { organizationService } from '@/features/organizations/services/organizationService'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Organization } from '@/features/organizations/types'
import type { Worker } from '../../types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTiptapContent } from '@/lib/tiptap'
import { createTicket, createTicketMessage, getOrganizationWorkers } from '../../services'

// Mock dependencies
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}))

// Mock the services
vi.mock('../../services', () => ({
  createTicket: vi.fn(),
  createTicketMessage: vi.fn(),
  getOrganizationWorkers: vi.fn()
}))

vi.mock('@/features/organizations/services/organizationService', () => ({
  getOrganizations: vi.fn()
}))

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

describe('useNewTicket', () => {
  const mockUserId = 'user-123'
  const mockOrganizations: Partial<Organization>[] = [
    { 
      id: 'org-1', 
      name: 'Org 1', 
      organization_members: [{
        organization_id: 'org-1',
        profile_id: 'user-1',
        organization_role: 'member',
        created_at: null,
        updated_at: null,
        profile: {
          id: 'user-1',
          full_name: 'Test User 1',
          email: 'user1@example.com',
          avatar_url: null,
          company: null,
          user_status: 'online',
          created_at: null,
          updated_at: null,
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
      }],
      created_at: null,
      updated_at: null,
      description: null
    },
    { 
      id: 'org-2', 
      name: 'Org 2', 
      organization_members: [{
        organization_id: 'org-2',
        profile_id: 'user-2',
        organization_role: 'member',
        created_at: null,
        updated_at: null,
        profile: {
          id: 'user-2',
          full_name: 'Test User 2',
          email: 'user2@example.com',
          avatar_url: null,
          company: null,
          user_status: 'online',
          created_at: null,
          updated_at: null,
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
      }],
      created_at: null,
      updated_at: null,
      description: null
    }
  ]
  const mockWorkers: Worker[] = [
    { id: 'worker-1', full_name: 'Worker 1', email: 'worker1@example.com', avatar_url: null },
    { id: 'worker-2', full_name: 'Worker 2', email: 'worker2@example.com', avatar_url: null }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    // Setup mock implementations
    vi.mocked(organizationService.getOrganizations).mockResolvedValue(mockOrganizations as Organization[])
    vi.mocked(getOrganizationWorkers).mockResolvedValue(mockWorkers)
    vi.mocked(createTicket).mockResolvedValue({ id: 'ticket-123' } as any)
    vi.mocked(createTicketMessage).mockResolvedValue({} as any)
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useNewTicket(mockUserId), {
      wrapper: createWrapper()
    })

    expect(result.current.title).toBe('')
    expect(result.current.content).toEqual({
      type: 'doc',
      content: []
    })
    expect(result.current.initialSettings).toEqual({
      ticket_priority: 'low',
      assignee: 'unassigned',
      organizationId: 'unassigned'
    })
  })

  it('should update title and content', () => {
    const { result } = renderHook(() => useNewTicket(mockUserId), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.setTitle('New Ticket')
      result.current.setContent(createTiptapContent('Ticket content'))
    })

    expect(result.current.title).toBe('New Ticket')
    expect(result.current.content).toEqual(createTiptapContent('Ticket content'))
  })

  it('should handle ticket priority change', () => {
    const { result } = renderHook(() => useNewTicket(mockUserId), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.handleTicketPriorityChange('high')
    })

    expect(result.current.initialSettings.ticket_priority).toBe('high')
  })

  it('should handle organization change and reset assignee', () => {
    const { result } = renderHook(() => useNewTicket(mockUserId), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.handleOrganizationChange('org-1')
    })

    expect(result.current.initialSettings.organizationId).toBe('org-1')
    expect(result.current.initialSettings.assignee).toBe('unassigned')
  })

  it('should handle assignee change', () => {
    const { result } = renderHook(() => useNewTicket(mockUserId), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.handleAssigneeChange('worker-1')
    })

    expect(result.current.initialSettings.assignee).toBe('worker-1')
  })

  it('should create ticket when form is submitted', async () => {
    const { result } = renderHook(() => useNewTicket(mockUserId), {
      wrapper: createWrapper()
    })
    const mockEvent = {
      preventDefault: vi.fn()
    } as unknown as React.FormEvent<HTMLFormElement>

    // Set form values
    act(() => {
      result.current.setTitle('Test Ticket')
      result.current.setContent(createTiptapContent('Test Content'))
      result.current.handleTicketPriorityChange('high')
    })

    // Submit form
    await act(async () => {
      await result.current.handleSubmit(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(createTicket).toHaveBeenCalledWith({
      title: 'Test Ticket',
      priority: 'high',
      assignee: mockUserId, // Auto-assigned to current user when org and assignee are unassigned
      organizationId: null
    })
    expect(createTicketMessage).toHaveBeenCalledWith({
      ticketId: 'ticket-123',
      content: createTiptapContent('Test Content'),
      isInternal: false
    })
  })

  it('should not create ticket when title or content is empty', async () => {
    const { result } = renderHook(() => useNewTicket(mockUserId), {
      wrapper: createWrapper()
    })
    const mockEvent = {
      preventDefault: vi.fn()
    } as unknown as React.FormEvent<HTMLFormElement>

    await act(async () => {
      await result.current.handleSubmit(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(createTicket).not.toHaveBeenCalled()
    expect(createTicketMessage).not.toHaveBeenCalled()
  })

  it('should create a ticket and message', async () => {
    // Mock implementation
    const mockTicket = { id: '123', title: 'Test Ticket' }
    const mockMessage = { id: '456', content: 'Test Message' }
    
    ;(createTicket as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockTicket)
    ;(createTicketMessage as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockMessage)
    ;(getOrganizationWorkers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(organizationService.getOrganizations as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([])

    // Test implementation
    const { result } = renderHook(() => useNewTicket('user123'))

    // Add your test assertions here
  })

  it('should handle form submission with valid data', async () => {
    const mockTicket = { id: '123', title: 'Test Ticket' }
    const mockMessage = { id: '456', content: 'Test Message' }

    ;(createTicket as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockTicket)
    ;(createTicketMessage as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockMessage)
    ;(getOrganizationWorkers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(organizationService.getOrganizations as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([])

    const { result } = renderHook(() => useNewTicket('user123'))

    // Set form values
    result.current.setTitle('Test Ticket')
    result.current.setContent({ 
      type: 'doc', 
      content: [{ 
        type: 'paragraph', 
        content: [{ type: 'text', text: 'Test content' }] 
      }]
    })

    // Submit form
    await result.current.handleSubmit(new Event('submit') as any)

    // Verify service calls
    expect(createTicket).toHaveBeenCalledWith({
      title: 'Test Ticket',
      priority: 'low',
      assignee: 'user123',
      organizationId: null
    })

    expect(createTicketMessage).toHaveBeenCalledWith({
      ticketId: '123',
      content: { 
        type: 'doc', 
        content: [{ 
          type: 'paragraph', 
          content: [{ type: 'text', text: 'Test content' }] 
        }]
      },
      isInternal: false
    })
  })

  it('should not submit with empty title', async () => {
    const { result } = renderHook(() => useNewTicket('user123'))

    // Submit form with empty title
    await result.current.handleSubmit(new Event('submit') as any)

    // Verify no service calls were made
    expect(createTicket).not.toHaveBeenCalled()
    expect(createTicketMessage).not.toHaveBeenCalled()
  })

  it('should not submit with empty content', async () => {
    const { result } = renderHook(() => useNewTicket('user123'))

    // Set only title
    result.current.setTitle('Test Ticket')

    // Submit form with empty content
    await result.current.handleSubmit(new Event('submit') as any)

    // Verify no service calls were made
    expect(createTicket).not.toHaveBeenCalled()
    expect(createTicketMessage).not.toHaveBeenCalled()
  })
}) 