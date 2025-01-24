import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { customerService } from '../services/customerService'
import { Customer } from '../types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerTickets } from './tabs/CustomerTickets'
import { CustomerProfile } from './tabs/CustomerProfile'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'

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
      <div className="px-6 py-4 border-b">
        <h1 className="text-2xl font-semibold text-gray-900">
          {customer.full_name || 'Unknown Customer'}
        </h1>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-gray-500">{customer.email}</span>
          <UserStatusBadge status={customer.user_status} />
        </div>
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
              value="profile"
              className="px-4 h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none text-black bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-gray-100"
            >
              Profile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'tickets' && <CustomerTickets customerId={customerId!} />}
        {activeTab === 'profile' && <CustomerProfile customer={customer} />}
      </div>
    </div>
  )
} 