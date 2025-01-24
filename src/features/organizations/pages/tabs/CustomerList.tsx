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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddMemberModal } from '../../components/AddMemberModal'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'

interface CustomerListProps {
  organizationId: string
}

export function CustomerList({ organizationId }: CustomerListProps) {
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

  if (isLoading) {
    return <div className="p-4">Loading customers...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <div className="flex justify-between items-start mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-black"
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white">
            <TableRow>
              <TableHead className="text-black">Customer</TableHead>
              <TableHead className="text-black">Email</TableHead>
              <TableHead className="text-black">Status</TableHead>
              <TableHead className="text-black">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow 
                key={customer.profile_id}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="text-black">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={customer.profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {customer.profile.full_name?.[0]?.toUpperCase() || customer.profile.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{customer.profile.full_name || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-black">
                  {customer.profile.email}
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={customer.profile.user_status} />
                </TableCell>
                <TableCell className="text-black">
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