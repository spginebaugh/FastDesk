import { Database } from '../../../types/database'

export interface Organization {
  id: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
  organization_members?: OrganizationMember[]
}

export interface OrganizationMember {
  organization_id: string | null
  profile_id: string | null
  organization_role: 'admin' | 'member' | 'customer'
  created_at: string | null
  updated_at: string | null
} 