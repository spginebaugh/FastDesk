import { Database } from '@/types/database'

export type Organization = Database['public']['Tables']['organizations']['Row'] & {
  organization_members?: OrganizationMember[]
}

export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'] & {
  profile: UserProfile
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type OrganizationRole = 'admin' | 'member' | 'customer' | 'nonmember'
export type UserStatus = 'online' | 'away' | 'transfers_only' | 'offline'

export const ORGANIZATION_ROLE_MAP = {
  admin: { label: 'Admin', color: 'text-semantic-success border-semantic-success/20' },
  member: { label: 'Member', color: 'text-primary border-primary/20' },
  customer: { label: 'Customer', color: 'text-accent border-accent/20' },
  nonmember: { label: 'Nonmember', color: 'text-destructive border-destructive/20' }
} as const

export const USER_STATUS_MAP = {
  online: { label: 'Online', color: 'bg-semantic-success' },
  away: { label: 'Away', color: 'bg-semantic-warning' },
  transfers_only: { label: 'Transfers only', color: 'bg-accent-blue' },
  offline: { label: 'Offline', color: 'bg-muted-foreground' }
} as const 