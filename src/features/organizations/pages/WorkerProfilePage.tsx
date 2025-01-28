import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { organizationService } from '../services/organizationService'
import { WorkerProfile } from './tabs/WorkerProfile'

export function WorkerProfilePage() {
  const { organizationId, workerId } = useParams<{ organizationId: string; workerId: string }>()

  const { data: worker, isLoading } = useQuery({
    queryKey: ['organization-worker', organizationId, workerId],
    queryFn: async () => {
      if (!organizationId || !workerId) throw new Error('Missing required parameters')
      const members = await organizationService.getOrganizationMembers(organizationId, 'worker')
      const worker = members.find(member => member.profile_id === workerId)
      if (!worker) throw new Error('Worker not found')
      return worker
    },
    enabled: !!organizationId && !!workerId
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!worker) {
    return <div className="flex items-center justify-center h-full">Worker not found</div>
  }

  return <WorkerProfile worker={worker} />
} 