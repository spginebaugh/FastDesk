import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { organizationService } from '../services/organizationService'
import { Organization } from '../types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TicketList } from './tabs/TicketList'
import { AgentList } from './tabs/AgentList'
import { CustomerList } from './tabs/CustomerList'
import { cn } from '@/lib/utils'
import { Building2 } from 'lucide-react'

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
      <div className="px-6 py-4 border-b border-border/50 bg-background">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold glow-text">{organization.name}</h1>
            {organization.description && (
              <p className="mt-1 text-sm text-muted-foreground">{organization.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-border/50">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start h-12 p-0 bg-background">
            <TabsTrigger
              value="tickets"
              className={cn(
                "px-4 h-12 rounded-none",
                "text-muted-foreground",
                "hover:text-primary hover:bg-primary/10 transition-colors duration-200",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "data-[state=active]:text-primary data-[state=active]:bg-primary/10"
              )}
            >
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className={cn(
                "px-4 h-12 rounded-none",
                "text-muted-foreground",
                "hover:text-primary hover:bg-primary/10 transition-colors duration-200",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "data-[state=active]:text-primary data-[state=active]:bg-primary/10"
              )}
            >
              Agents
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className={cn(
                "px-4 h-12 rounded-none",
                "text-muted-foreground",
                "hover:text-primary hover:bg-primary/10 transition-colors duration-200",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "data-[state=active]:text-primary data-[state=active]:bg-primary/10"
              )}
            >
              Customers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden bg-background">
        {activeTab === 'tickets' && <TicketList organizationId={organizationId!} />}
        {activeTab === 'agents' && <AgentList organizationId={organizationId!} />}
        {activeTab === 'customers' && <CustomerList organizationId={organizationId!} />}
      </div>
    </div>
  )
} 