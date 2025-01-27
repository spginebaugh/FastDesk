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
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { useTabStore } from '@/store/tabStore'

interface CustomerListProps {
  organizationId: string
}

export function CustomerList({ organizationId }: CustomerListProps) {
  const navigate = useNavigate()
  const tabStore = useTabStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['organization-customers', organizationId],
    queryFn: () => organizationService.getOrganizationMembers(organizationId, 'customer')
  })

  const filteredCustomers = customers.filter((customer) =>
    customer.profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.profile.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRowClick = (customer: typeof customers[0]) => {
    const path = `/customers/${customer.profile_id}/tickets`
    
    // Add tab if it doesn't exist
    if (!tabStore.hasTab(path)) {
      tabStore.addTab({
        title: customer.profile.full_name || customer.profile.email,
        path,
      })
    }
    
    navigate(path)
  }

  if (isLoading) {
    return <div className="p-4 text-foreground">Loading customers...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50 bg-background">
        <div className="flex justify-between items-start mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
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
            Add Customer
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow 
                key={customer.profile_id}
                className="cursor-pointer hover:bg-primary/5"
                onClick={() => handleRowClick(customer)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src={customer.profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-background-accent">
                        {customer.profile.full_name?.[0]?.toUpperCase() || customer.profile.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{customer.profile.full_name || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {customer.profile.email}
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={customer.profile.user_status} />
                </TableCell>
                <TableCell>
                  {customer.created_at && format(new Date(customer.created_at), 'MMM d, yyyy')}
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
        memberType="customer"
      />
    </div>
  )
} 