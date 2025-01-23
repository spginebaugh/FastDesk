import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddMemberModal } from '../../components/AddMemberModal'

const STATUS_COLORS = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  transfers_only: 'bg-blue-500',
  offline: 'bg-gray-500'
} as const

const ROLE_COLORS = {
  admin: 'text-green-600',
  member: 'text-blue-600',
  customer: 'text-gray-600'
} as const

interface AgentListProps {
  organizationId: string
}

export function AgentList({ organizationId }: AgentListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['organization-agents', organizationId],
    queryFn: () => organizationService.getOrganizationMembers(organizationId, 'agent')
  })

  const filteredAgents = agents.filter((agent) =>
    agent.profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.profile.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: keyof typeof STATUS_COLORS) => {
    return `${STATUS_COLORS[status]} bg-opacity-10 text-black`
  }

  const getRoleColor = (role: keyof typeof ROLE_COLORS) => {
    return `${ROLE_COLORS[role]} border-${ROLE_COLORS[role].split('-')[1]}-200`
  }

  if (isLoading) {
    return <div className="p-4">Loading agents...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <div className="flex justify-between items-start mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-black"
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white">
            <TableRow>
              <TableHead className="text-black">Agent</TableHead>
              <TableHead className="text-black">Email</TableHead>
              <TableHead className="text-black">Role</TableHead>
              <TableHead className="text-black">Status</TableHead>
              <TableHead className="text-black">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.map((agent) => (
              <TableRow 
                key={agent.profile_id}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="text-black">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={agent.profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {agent.profile.full_name?.[0]?.toUpperCase() || agent.profile.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{agent.profile.full_name || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-black">
                  {agent.profile.email}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${getRoleColor(agent.organization_role)}`}
                  >
                    {agent.organization_role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(agent.profile.status)} capitalize`}
                  >
                    <span className={`mr-1.5 h-2 w-2 inline-block rounded-full ${STATUS_COLORS[agent.profile.status]}`} />
                    {agent.profile.status === 'transfers_only' ? 'Transfers only' : agent.profile.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-black">
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