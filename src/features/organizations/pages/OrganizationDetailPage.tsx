import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { organizationService } from '../services/organizationService'
import { Organization } from '../types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { TicketList } from './tabs/TicketList'
import { AgentList } from './tabs/AgentList'
import { CustomerList } from './tabs/CustomerList'

export function OrganizationDetailPage() {
  const { organizationId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const { data: organization, isLoading } = useQuery<Organization>({
    queryKey: ['organization', organizationId],
    queryFn: () => organizationService.getOrganization(organizationId!)
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!organization) {
    return <div className="flex items-center justify-center h-full">Organization not found</div>
  }

  // Get the active tab from the URL or default to tickets
  const activeTab = location.pathname.split('/').pop() || 'tickets'

  const handleTabChange = (value: string) => {
    navigate(`/organizations/${organizationId}/${value}`)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b">
        <h1 className="text-2xl font-semibold text-gray-900">{organization.name}</h1>
        {organization.description && (
          <p className="mt-1 text-sm text-gray-500">{organization.description}</p>
        )}
      </div>

      <div className="border-b">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start h-12 p-0 bg-transparent border-b">
            <TabsTrigger
              value="tickets"
              className="px-4 h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-black bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-gray-100"
            >
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className="px-4 h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-black bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-gray-100"
            >
              Agents
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="px-4 h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-black bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-gray-100"
            >
              Customers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'tickets' && <TicketList organizationId={organizationId!} />}
        {activeTab === 'agents' && <AgentList organizationId={organizationId!} />}
        {activeTab === 'customers' && <CustomerList organizationId={organizationId!} />}
      </div>
    </div>
  )
} 