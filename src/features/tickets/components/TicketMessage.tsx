import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { TicketMessage as TicketMessageType, UserProfile, MessageSender } from '../types'

interface TicketMessageProps {
  message: TicketMessageType
  isInitialMessage?: boolean
  user: UserProfile | MessageSender | undefined
}

export function TicketMessage({ message, isInitialMessage, user }: TicketMessageProps) {
  if (!user) {
    user = { full_name: 'Unknown User', avatar_url: null }
  }

  const sender = {
    full_name: user.full_name || ('email' in user ? user.email : 'Unknown User'),
    avatar_url: user.avatar_url
  }

  const initials = sender.full_name?.split(' ').map((n: string) => n[0]).join('') || '??'

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${
      !isInitialMessage && message.is_internal ? 'border-l-4 border-yellow-400' : ''
    }`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={sender.avatar_url || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900 truncate">
                {sender.full_name}
                {!isInitialMessage && message.is_internal && (
                  <span className="ml-2 text-xs text-yellow-600 font-normal">
                    Internal Note
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500">
                {message.created_at ? format(new Date(message.created_at), 'PPp') : 'Unknown date'}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-all overflow-hidden max-w-full">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  )
} 