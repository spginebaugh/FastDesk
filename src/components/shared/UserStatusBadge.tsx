import { Badge } from '@/components/ui/badge'
import { USER_STATUS_MAP, UserStatus } from '@/features/organizations/types'
import { cn } from '@/lib/utils'

interface UserStatusBadgeProps {
  status: UserStatus
  className?: string
}

const statusColorMap = {
  online: 'text-semantic-success border-semantic-success/20 dark:border-semantic-success/30',
  away: 'text-semantic-warning border-semantic-warning/20 dark:border-semantic-warning/30',
  transfers_only: 'text-semantic-info border-semantic-info/20 dark:border-semantic-info/30',
  offline: 'text-secondary-light border-secondary/20 dark:border-secondary-dark/30'
} as const

const statusDotColorMap = {
  online: 'bg-semantic-success',
  away: 'bg-semantic-warning',
  transfers_only: 'bg-semantic-info',
  offline: 'bg-secondary-light dark:bg-secondary'
} as const

export function UserStatusBadge({ status, className = '' }: UserStatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'bg-background-raised/50 dark:bg-background-raised/30',
        statusColorMap[status],
        className
      )}
    >
      <span className={cn(
        'mr-1.5 h-2 w-2 inline-block rounded-full animate-pulse',
        statusDotColorMap[status]
      )} />
      {USER_STATUS_MAP[status].label}
    </Badge>
  )
} 