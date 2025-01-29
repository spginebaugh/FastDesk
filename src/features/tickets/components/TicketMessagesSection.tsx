import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BotIcon } from 'lucide-react'
import { type TiptapContent } from '@/lib/tiptap'
import { TicketMessage } from './TicketMessage'
import { TicketReplyBox } from './TicketReplyBox'
import { type Message } from '@/features/ai-bot/types'
import { type TicketMessage as TicketMessageType, type UserProfile } from '../types'

interface TicketMessagesProps {
  ticketId: string
  ticketTitle: string
  ticketCreatorId: string
  currentUserId: string
  messages: TicketMessageType[]
  ticketUser: UserProfile
  isAIReplyOpen: boolean
  replyContent: TiptapContent
  onSetReplyContent: (content: TiptapContent) => void
  onToggleAIReply: () => void
}

export function TicketMessagesSection({
  ticketId,
  ticketTitle,
  ticketCreatorId,
  currentUserId,
  messages,
  ticketUser,
  isAIReplyOpen,
  replyContent,
  onSetReplyContent,
  onToggleAIReply
}: TicketMessagesProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-[calc(100%-36rem)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <TicketMessage 
            key={message.id} 
            message={message}
            isInitialMessage={index === 0}
            user={message.sender_type === 'customer' ? ticketUser : message.sender}
            ticketCreatorId={ticketCreatorId}
            currentUserId={currentUserId}
          />
        ))}
      </div>
      <div className="relative">
        <TicketReplyBox 
          ticketId={ticketId} 
          ticketTitle={ticketTitle}
          ticketContent={messages[0].content}
          originalSenderFullName={ticketUser.full_name || ticketUser.email}
          previousMessages={messages.map(msg => ({
            content: msg.content,
            role: msg.sender_type as Message['role'],
            senderFullName: msg.sender?.full_name || 'Unknown User'
          }))}
          initialContent={replyContent}
          onSetContent={onSetReplyContent}
          rightElement={
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 ml-2",
                isAIReplyOpen && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleAIReply()
              }}
              type="button"
            >
              <BotIcon className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    </div>
  )
} 
