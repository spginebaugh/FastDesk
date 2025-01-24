import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { organizationService } from '../services/organizationService'
import { Organization } from '../types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TicketList } from './tabs/TicketList'
import { AgentList } from './tabs/AgentList'
import { CustomerList } from './tabs/CustomerList'
import { cn } from '@/lib/utils'

export function OrganizationDetailPage() {
  const { organizationId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const { data: organization, isLoading } = useQuery<Organization>({
    queryKey: ['organization', organizationId],
    queryFn: () => organizationService.getOrganization(organizationId!)
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-foreground">Loading...</div>
  }

  if (!organization) {
    return <div className="flex items-center justify-center h-full text-foreground">Organization not found</div>
  }

  // Get the active tab from the URL or default to tickets
  const activeTab = location.pathname.split('/').pop() || 'tickets'

  const handleTabChange = (value: string) => {
    navigate(`/organizations/${organizationId}/${value}`)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b border-border/50 bg-background-raised">
        <h1 className="text-2xl font-semibold text-foreground">{organization.name}</h1>
        {organization.description && (
          <p className="mt-1 text-sm text-muted-foreground">{organization.description}</p>
        )}
      </div>

      <div className="border-b border-border/50">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start h-12 p-0 bg-background-alt border-b border-border/50">
            <TabsTrigger
              value="tickets"
              className={cn(
                "px-4 h-12 rounded-none",
                "text-muted-foreground bg-background-alt",
                "hover:text-primary hover:bg-primary/10",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "data-[state=active]:text-primary data-[state=active]:bg-primary/20"
              )}
            >
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className={cn(
                "px-4 h-12 rounded-none",
                "text-muted-foreground bg-background-alt",
                "hover:text-primary hover:bg-primary/10",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "data-[state=active]:text-primary data-[state=active]:bg-primary/20"
              )}
            >
              Agents
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className={cn(
                "px-4 h-12 rounded-none",
                "text-muted-foreground bg-background-alt",
                "hover:text-primary hover:bg-primary/10",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "data-[state=active]:text-primary data-[state=active]:bg-primary/20"
              )}
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