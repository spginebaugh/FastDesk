import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, Plus, ShieldCheck, Users, UserMinus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { organizationService } from '../services/organizationService'
import { Organization } from '../types'
import { format } from 'date-fns'
import { useTabStore } from '@/store/tabStore'
import { CreateOrganizationModal } from '../components/CreateOrganizationModal'
import { OrganizationRoleBadge } from '@/components/shared/OrganizationRoleBadge'

type FilterRole = 'all' | 'admin' | 'member' | 'nonmember'

const FILTER_OPTIONS: { 
  id: FilterRole
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'all', label: 'All organizations', icon: Building2 },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
  { id: 'member', label: 'Member', icon: Users },
  { id: 'nonmember', label: 'Nonmember', icon: UserMinus }
]

export function OrganizationListPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterRole>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const tabStore = useTabStore()

  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations()
  })

  const filteredOrganizations = organizations.filter((org) => {
    // First apply role filter
    if (selectedFilter !== 'all') {
      const member = org.organization_members?.[0]
      if (selectedFilter === 'nonmember') {
        if (member) return false
      } else {
        if (!member || member.organization_role !== selectedFilter) return false
      }
    }
    
    // Then apply search filter
    return (
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleRowClick = (organization: Organization) => {
    // Only allow navigation if user is a member
    if (!organization.organization_members || organization.organization_members.length === 0) {
      return
    }

    const path = `/organizations/${organization.id}/tickets`
    
    // Add tab if it doesn't exist
    if (!tabStore.hasTab(path)) {
      tabStore.addTab({
        title: organization.name,
        path,
      })
    }
    
    navigate(path)
  }

  const getRoleDisplay = (organization: Organization) => {
    const member = organization.organization_members?.[0]
    if (!member) {
      return 'nonmember' as const
    }
    return member.organization_role
  }

  const getRowClassName = (organization: Organization) => {
    const isMember = organization.organization_members && organization.organization_members.length > 0
    return `${isMember ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed bg-gray-50/50'}`
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="h-full flex">
      {/* Lists Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <nav className="h-full overflow-y-auto">
          <div className="space-y-1 p-4">
            <div className="py-2">
              <h2 className="px-2 text-lg font-semibold text-gray-900">Organization lists</h2>
              <div className="space-y-1 mt-2">
                {FILTER_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button 
                      key={option.id}
                      variant="ghost" 
                      size="sm" 
                      className={`w-full justify-start ${
                        selectedFilter === option.id 
                          ? 'bg-gray-200 text-black'
                          : 'text-white hover:bg-gray-100 hover:text-black'
                      }`}
                      onClick={() => setSelectedFilter(option.id)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {option.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {FILTER_OPTIONS.find(opt => opt.id === selectedFilter)?.label || 'All organizations'}
            </h1>
            <Button 
              className="ml-4"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-black"
                />
              </div>
              <span className="text-sm text-black">
                {filteredOrganizations.length} organization{filteredOrganizations.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black">Name</TableHead>
                  <TableHead className="text-black">Description</TableHead>
                  <TableHead className="text-black">Role</TableHead>
                  <TableHead className="text-black">Created</TableHead>
                  <TableHead className="text-black">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => {
                  const role = getRoleDisplay(org)
                  return (
                    <TableRow 
                      key={org.id}
                      className={getRowClassName(org)}
                      onClick={() => handleRowClick(org)}
                    >
                      <TableCell className="text-black font-medium">
                        {org.name}
                      </TableCell>
                      <TableCell className="text-black">
                        {org.description || '-'}
                      </TableCell>
                      <TableCell>
                        <OrganizationRoleBadge role={role} />
                      </TableCell>
                      <TableCell className="text-black">
                        {org.created_at 
                          ? format(new Date(org.created_at), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-black">
                        {org.updated_at
                          ? format(new Date(org.updated_at), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
} 