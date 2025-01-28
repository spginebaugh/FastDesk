import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TicketReplyBox } from '../../components/TicketReplyBox'
import { useMutation } from '@tanstack/react-query'
import '@testing-library/jest-dom/vitest'

// Mock dependencies
const mockMutate = vi.fn()
vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(() => ({
    mutate: mockMutate,
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
    isIdle: true,
    isPending: false,
    isPaused: false,
    status: 'idle',
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    reset: vi.fn(),
    context: undefined,
    variables: undefined,
    submittedAt: 0
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn()
  }))
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}))

vi.mock('../../services/ticketService', () => ({
  ticketService: {
    createTicketMessage: vi.fn()
  }
}))

// Mock Shadcn UI Select component
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div data-testid="select-root">
      <select 
        value={value} 
        onChange={(e) => onValueChange?.(e.target.value)}
        data-testid="select-input"
      >
        <option value="public">Public reply</option>
        <option value="internal">Internal note</option>
      </select>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ children }: any) => <span data-testid="select-value">{children}</span>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  )
}))

describe('TicketReplyBox', () => {
  const mockTicketId = 'ticket123'
  const mockProps = {
    ticketId: mockTicketId,
    ticketTitle: 'Test Ticket',
    ticketContent: 'Initial ticket content',
    originalSenderFullName: 'John Doe',
    currentWorkerFullName: 'Support Agent',
    previousMessages: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders reply form correctly', () => {
    render(<TicketReplyBox {...mockProps} />)
    expect(screen.getByPlaceholderText('Type your reply...')).toBeInTheDocument()
    expect(screen.getByText('Send Reply')).toBeInTheDocument()
  })

  it('handles empty content submission', () => {
    render(<TicketReplyBox {...mockProps} />)
    const submitButton = screen.getByText('Send Reply')
    fireEvent.click(submitButton)
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('handles content submission', async () => {
    render(<TicketReplyBox {...mockProps} />)
    const textarea = screen.getByPlaceholderText('Type your reply...')
    const submitButton = screen.getByText('Send Reply')

    fireEvent.change(textarea, { target: { value: 'Test reply' } })
    fireEvent.click(submitButton)

    expect(mockMutate).toHaveBeenCalledWith({
      ticketId: mockTicketId,
      content: 'Test reply',
      isInternal: false
    })
  })

  it('toggles between public and internal replies', async () => {
    render(<TicketReplyBox {...mockProps} />)
    const textarea = screen.getByPlaceholderText('Type your reply...')
    fireEvent.change(textarea, { target: { value: 'Test internal note' } })

    // Change select value using the mocked select
    const select = screen.getByTestId('select-input')
    fireEvent.change(select, { target: { value: 'internal' } })

    // Submit the form
    const submitButton = screen.getByText('Send Reply')
    fireEvent.click(submitButton)

    expect(mockMutate).toHaveBeenCalledWith({
      ticketId: mockTicketId,
      content: 'Test internal note',
      isInternal: true
    })
  })

  it('disables submit button when loading', () => {
    vi.mocked(useMutation).mockImplementation(() => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isLoading: true,
      isError: false,
      isSuccess: false,
      isIdle: false,
      isPending: true,
      isPaused: false,
      status: 'pending',
      data: undefined,
      error: null,
      failureCount: 0,
      failureReason: null,
      reset: vi.fn(),
      context: undefined,
      variables: undefined,
      submittedAt: Date.now()
    }))

    render(<TicketReplyBox {...mockProps} />)
    const submitButton = screen.getByText('Sending...')
    expect(submitButton).toBeDisabled()
  })
}) 