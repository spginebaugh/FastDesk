import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { organizationService } from '../../services/organizationService'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddMemberModal } from '../../components/AddMemberModal'
import { OrganizationRoleBadge } from '@/components/shared/OrganizationRoleBadge'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { useTabStore } from '@/store/tabStore'

interface WorkerListProps {
  organizationId: string
}

export function WorkerList({ organizationId }: WorkerListProps) {
  const navigate = useNavigate()
  const tabStore = useTabStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { data: workers = [], isLoading } = useQuery({
    queryKey: ['organization-workers', organizationId],
    queryFn: () => organizationService.getOrganizationMembers(organizationId, 'worker')
  })

  const filteredWorkers = workers
    .filter((worker): worker is typeof worker & { profile: NonNullable<typeof worker.profile> } => 
      worker && worker.profile !== null && worker.profile !== undefined
    )
    .filter((worker) =>
      (worker.profile.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      worker.profile.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleRowClick = (worker: typeof workers[0]) => {
    const path = `/organizations/${organizationId}/workers/${worker.profile_id}`
    
    // Add tab if it doesn't exist
    if (!tabStore.hasTab(path)) {
      tabStore.addTab({
        title: worker.profile.full_name || worker.profile.email,
        path,
      })
    }
    
    navigate(path)
  }

  if (isLoading) {
    return <div className="p-4 text-foreground">Loading workers...</div>
  }

  if (!Array.isArray(workers)) {
    return <div className="p-4 text-foreground">Error loading workers</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 bg-background">
        <div className="flex justify-between items-start mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 bg-background-raised border-border/50 focus-visible:ring-primary placeholder:text-muted-foreground"
            />
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkers.map((worker) => (
              <TableRow 
                key={worker.profile_id}
                className="cursor-pointer hover:bg-primary/5"
                onClick={() => handleRowClick(worker)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src={worker.profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-background-accent">
                        {worker.profile.full_name?.[0]?.toUpperCase() || worker.profile.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{worker.profile.full_name || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {worker.profile.email}
                </TableCell>
                <TableCell>
                  <OrganizationRoleBadge role={worker.organization_role} />
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={worker.profile.user_status} />
                </TableCell>
                <TableCell>
                  {worker.created_at && format(new Date(worker.created_at), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        organizationId={organizationId}
        memberType="worker"
      />
    </div>
  )
} 