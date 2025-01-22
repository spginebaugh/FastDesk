import { useState } from 'react'
import { Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { customerService } from '../services/customerService'
import { Customer } from '../types'
import { format } from 'date-fns'

export function CustomerListPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers()
  })

  const filteredCustomers = customers.filter((customer: Customer) => 
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="h-full flex">
      {/* Lists Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <nav className="h-full overflow-y-auto">
          <div className="space-y-1 p-4">
            <div className="py-2">
              <h2 className="px-2 text-lg font-semibold text-gray-900">Customer lists</h2>
              <div className="space-y-1 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start bg-gray-200 text-black"
                >
                  <Users className="mr-2 h-4 w-4" />
                  All customers
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">All customers</h1>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-black"
                />
              </div>
              <span className="text-sm text-black">
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black">Name</TableHead>
                  <TableHead className="text-black">Email</TableHead>
                  <TableHead className="text-black">Company</TableHead>
                  <TableHead className="text-black">Status</TableHead>
                  <TableHead className="text-black">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer: Customer) => (
                  <TableRow 
                    key={customer.id}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="text-black">
                      {customer.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-black">
                      {customer.email}
                    </TableCell>
                    <TableCell className="text-black">
                      {customer.company || '-'}
                    </TableCell>
                    <TableCell className="text-black">
                      {customer.status || '-'}
                    </TableCell>
                    <TableCell className="text-black">
                      {customer.created_at 
                        ? format(new Date(customer.created_at), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
} 