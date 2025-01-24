import { Badge } from '@/components/ui/badge'
import { ORGANIZATION_ROLE_MAP, OrganizationRole } from '@/features/organizations/types'
import { cn } from '@/lib/utils'

interface OrganizationRoleBadgeProps {
  role: OrganizationRole
  className?: string
}

const roleColorMap = {
  admin: 'text-semantic-success border-semantic-success/20 bg-semantic-success/10 dark:border-semantic-success/30 dark:bg-semantic-success/5',
  member: 'text-semantic-info border-semantic-info/20 bg-semantic-info/10 dark:border-semantic-info/30 dark:bg-semantic-info/5',
  customer: 'text-primary border-primary/20 bg-primary/10 dark:text-primary-light dark:border-primary-light/30 dark:bg-primary-light/5',
  nonmember: 'text-semantic-error border-semantic-error/20 bg-semantic-error/10 dark:border-semantic-error/30 dark:bg-semantic-error/5'
} as const

export function OrganizationRoleBadge({ role, className = '' }: OrganizationRoleBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium capitalize',
        roleColorMap[role],
        className
      )}
    >
      {ORGANIZATION_ROLE_MAP[role].label}
    </Badge>
  )
} 