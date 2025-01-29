import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketMessage } from '../../components/TicketMessage'
import { format } from 'date-fns'
import type { TicketMessage as TicketMessageType } from '../../types'
import { createTiptapContent } from '@/lib/tiptap'
import '@testing-library/jest-dom/vitest'

describe('TicketMessage', () => {
  const mockMessage: TicketMessageType = {
    id: 'msg1',
    ticket_id: 'ticket1',
    content: createTiptapContent('Test message content'),
    content_format: 'tiptap',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_internal: false,
    sender_type: 'worker' as const,
    sender_id: 'user1'
  }

  const mockUser = {
    full_name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg'
  }

  const mockProps = {
    message: mockMessage,
    user: mockUser,
    ticketCreatorId: 'creator1',
    currentUserId: 'user2'
  }

  it('renders message content correctly', () => {
    render(<TicketMessage {...mockProps} />)
    expect(screen.getByText('Test message content')).toBeInTheDocument()
  })

  it('displays sender name correctly', () => {
    render(<TicketMessage {...mockProps} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows internal note label for internal messages', () => {
    const internalMessage = { ...mockMessage, is_internal: true }
    render(<TicketMessage {...mockProps} message={internalMessage} />)
    expect(screen.getByText('Internal Note')).toBeInTheDocument()
  })

  it('formats date correctly', () => {
    const date = new Date()
    const message = { ...mockMessage, created_at: date.toISOString() }
    render(<TicketMessage {...mockProps} message={message} />)
    expect(screen.getByText(format(date, 'PPp'))).toBeInTheDocument()
  })

  it('shows fallback for missing user name', () => {
    render(<TicketMessage {...mockProps} user={undefined} />)
    expect(screen.getByText('Unknown User')).toBeInTheDocument()
  })

  it('shows initials in avatar fallback', () => {
    render(<TicketMessage {...mockProps} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('applies internal message styling', () => {
    const internalMessage = { ...mockMessage, is_internal: true }
    const { container } = render(
      <TicketMessage {...mockProps} message={internalMessage} />
    )
    const messageDiv = container.firstChild as HTMLElement
    expect(messageDiv).toHaveClass('border-l-semantic-warning')
  })
}) 