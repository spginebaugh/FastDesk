import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, Plus } from 'lucide-react'
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

export function OrganizationListPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const tabStore = useTabStore()

  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations()
  })

  const filteredOrganizations = organizations.filter((org) => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRowClick = (organization: Organization) => {
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start bg-gray-200 text-black"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  All organizations
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">All organizations</h1>
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
                {filteredOrganizations.map((org) => (
                  <TableRow 
                    key={org.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(org)}
                  >
                    <TableCell className="text-black font-medium">
                      {org.name}
                    </TableCell>
                    <TableCell className="text-black">
                      {org.description || '-'}
                    </TableCell>
                    <TableCell className="text-black">
                      {org.organization_members?.[0]?.organization_role || '-'}
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
                ))}
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