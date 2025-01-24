import { Badge } from '@/components/ui/badge'
import { ORGANIZATION_ROLE_MAP, OrganizationRole } from '@/features/organizations/types'

interface OrganizationRoleBadgeProps {
  role: OrganizationRole
  className?: string
}

export function OrganizationRoleBadge({ role, className = '' }: OrganizationRoleBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`capitalize ${ORGANIZATION_ROLE_MAP[role].color} ${className}`}
    >
      {ORGANIZATION_ROLE_MAP[role].label}
    </Badge>
  )
} 