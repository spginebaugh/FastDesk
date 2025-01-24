import { Badge } from '@/components/ui/badge'
import { USER_STATUS_MAP, UserStatus } from '@/features/organizations/types'

interface UserStatusBadgeProps {
  status: UserStatus
  className?: string
}

export function UserStatusBadge({ status, className = '' }: UserStatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${USER_STATUS_MAP[status].color} bg-opacity-10 text-black capitalize ${className}`}
    >
      <span className={`mr-1.5 h-2 w-2 inline-block rounded-full ${USER_STATUS_MAP[status].color}`} />
      {USER_STATUS_MAP[status].label}
    </Badge>
  )
} 