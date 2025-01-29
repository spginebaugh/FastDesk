import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { TicketMessage as TicketMessageType, UserProfile, MessageSender } from '../types'
import { cn } from '@/lib/utils'
import { TiptapViewer } from '@/components/ui/tiptap-viewer'
import { type TiptapContent } from '@/lib/tiptap'

interface TicketMessageProps {
  message: TicketMessageType
  isInitialMessage?: boolean
  user: UserProfile | MessageSender | undefined
  ticketCreatorId: string
  currentUserId: string
}

export function TicketMessage({ message, isInitialMessage, user, ticketCreatorId, currentUserId }: TicketMessageProps) {
  if (!user) {
    user = { full_name: 'Unknown User', avatar_url: null }
  }

  const sender = {
    full_name: user.full_name || ('email' in user ? user.email : 'Unknown User'),
    avatar_url: user.avatar_url
  }

  const initials = sender.full_name?.split(' ').map((n: string) => n[0]).join('') || '??'

  // Check if this message is from the ticket creator or current user
  const isTicketCreator = message.sender_id === ticketCreatorId
  const isCurrentUser = message.sender_id === currentUserId

  return (
    <div className={cn(
      "rounded-lg p-6 border border-border/50",
      "transition-all duration-200 hover:border-primary/20",
      isTicketCreator
        ? "bg-background-raised/50" 
        : "bg-primary/5",
      !isInitialMessage && message.is_internal && [
        "border-l-4 border-l-semantic-warning",
        "hover:shadow-[0_0_10px_rgba(249,200,14,0.1)]"
      ],
      isCurrentUser && [
        "border-r-4 border-r-primary",
        "hover:shadow-[0_0_10px_rgba(124,58,237,0.1)]"
      ]
    )}>
      <div className="flex items-start gap-4">
        <Avatar className={cn(
          "h-10 w-10 ring-2",
          isTicketCreator ? "ring-border/50" : "ring-primary/20"
        )}>
          <AvatarImage src={sender.avatar_url || undefined} />
          <AvatarFallback className={cn(
            "text-foreground",
            isTicketCreator ? "bg-background-accent" : "bg-primary/10"
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-foreground truncate">
                {sender.full_name}
                {!isInitialMessage && message.is_internal && (
                  <span className="ml-2 text-xs text-semantic-warning font-normal">
                    Internal Note
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                {message.created_at ? format(new Date(message.created_at), 'PPp') : 'Unknown date'}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-foreground overflow-hidden max-w-full">
            <TiptapViewer 
              content={message.content as TiptapContent} 
              className="prose dark:prose-invert prose-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 