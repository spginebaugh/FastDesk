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
  admin: { label: 'Admin', color: 'text-green-600 border-green-200' },
  member: { label: 'Member', color: 'text-blue-600 border-blue-200' },
  customer: { label: 'Customer', color: 'text-blue-600 border-blue-200' },
  nonmember: { label: 'Nonmember', color: 'text-red-600 border-red-200' }
} as const

export const USER_STATUS_MAP = {
  online: { label: 'Online', color: 'bg-green-500' },
  away: { label: 'Away', color: 'bg-yellow-500' },
  transfers_only: { label: 'Transfers only', color: 'bg-blue-500' },
  offline: { label: 'Offline', color: 'bg-gray-500' }
} as const 