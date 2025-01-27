import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { organizationService } from '../services/organizationService'
import { AgentProfile } from './tabs/AgentProfile'

export function AgentProfilePage() {
  const { organizationId, agentId } = useParams<{ organizationId: string; agentId: string }>()

  const { data: agent, isLoading } = useQuery({
    queryKey: ['organization-agent', organizationId, agentId],
    queryFn: async () => {
      if (!organizationId || !agentId) throw new Error('Missing required parameters')
      const members = await organizationService.getOrganizationMembers(organizationId, 'agent')
      const agent = members.find(member => member.profile_id === agentId)
      if (!agent) throw new Error('Agent not found')
      return agent
    },
    enabled: !!organizationId && !!agentId
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!agent) {
    return <div className="flex items-center justify-center h-full">Agent not found</div>
  }

  return <AgentProfile agent={agent} />
} 