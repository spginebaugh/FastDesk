import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { customerService } from '../services/customerService'
import { Customer } from '../types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerTickets } from './tabs/CustomerTickets'
import { CustomerProfile } from './tabs/CustomerProfile'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function CustomerDetailPage() {
  const { customerId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getCustomer(customerId!)
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!customer) {
    return <div className="flex items-center justify-center h-full">Customer not found</div>
  }

  // Get the active tab from the URL or default to tickets
  const activeTab = location.pathname.split('/').pop() || 'tickets'

  const handleTabChange = (value: string) => {
    navigate(`/customers/${customerId}/${value}`)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border/50 bg-background">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={customer.avatar_url || undefined} />
            <AvatarFallback className="bg-background-accent">
              {customer.full_name?.[0]?.toUpperCase() || customer.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold glow-text">
              {customer.full_name || 'Unknown Customer'}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{customer.email}</span>
              <UserStatusBadge status={customer.user_status} />
            </div>
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
              value="profile"
              className={cn(
                "px-4 h-12 rounded-none",
                "text-muted-foreground",
                "hover:text-primary hover:bg-primary/10 transition-colors duration-200",
                "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                "data-[state=active]:text-primary data-[state=active]:bg-primary/10"
              )}
            >
              Profile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden bg-background">
        {activeTab === 'tickets' && <CustomerTickets customerId={customerId!} />}
        {activeTab === 'profile' && <CustomerProfile customer={customer} />}
      </div>
    </div>
  )
} 