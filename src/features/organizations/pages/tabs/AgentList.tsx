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

interface AgentListProps {
  organizationId: string
}

export function AgentList({ organizationId }: AgentListProps) {
  const navigate = useNavigate()
  const tabStore = useTabStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['organization-agents', organizationId],
    queryFn: () => organizationService.getOrganizationMembers(organizationId, 'agent')
  })

  const filteredAgents = agents
    .filter((agent): agent is typeof agent & { profile: NonNullable<typeof agent.profile> } => 
      agent && agent.profile !== null && agent.profile !== undefined
    )
    .filter((agent) =>
      (agent.profile.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      agent.profile.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleRowClick = (agent: typeof agents[0]) => {
    const path = `/organizations/${organizationId}/agents/${agent.profile_id}`
    
    // Add tab if it doesn't exist
    if (!tabStore.hasTab(path)) {
      tabStore.addTab({
        title: agent.profile.full_name || agent.profile.email,
        path,
      })
    }
    
    navigate(path)
  }

  if (isLoading) {
    return <div className="p-4 text-foreground">Loading agents...</div>
  }

  if (!Array.isArray(agents)) {
    return <div className="p-4 text-foreground">Error loading agents</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 bg-background">
        <div className="flex justify-between items-start mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
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
            Add Agent
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.map((agent) => (
              <TableRow 
                key={agent.profile_id}
                className="cursor-pointer hover:bg-primary/5"
                onClick={() => handleRowClick(agent)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src={agent.profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-background-accent">
                        {agent.profile.full_name?.[0]?.toUpperCase() || agent.profile.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{agent.profile.full_name || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {agent.profile.email}
                </TableCell>
                <TableCell>
                  <OrganizationRoleBadge role={agent.organization_role} />
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={agent.profile.user_status} />
                </TableCell>
                <TableCell>
                  {agent.created_at && format(new Date(agent.created_at), 'MMM d, yyyy')}
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
        memberType="agent"
      />
    </div>
  )
} 