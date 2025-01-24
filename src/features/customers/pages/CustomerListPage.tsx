import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useTabStore } from '@/store/tabStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { cn } from '@/lib/utils'

export function CustomerListPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const tabStore = useTabStore()

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers()
  })

  const filteredCustomers = customers.filter((customer: Customer) => {
    const organizationNames = customer.organizations?.map(org => org.organization.name.toLowerCase()).join(' ') || ''
    return customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      organizationNames.includes(searchQuery.toLowerCase())
  })

  const handleRowClick = (customer: Customer) => {
    const path = `/customers/${customer.id}/tickets`
    
    // Add tab if it doesn't exist
    if (!tabStore.hasTab(path)) {
      tabStore.addTab({
        title: customer.full_name || customer.email,
        path,
      })
    }
    
    navigate(path)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-foreground">Loading...</div>
  }

  return (
    <div className="h-full flex">
      {/* Lists Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-background-alt">
        <nav className="h-full overflow-y-auto">
          <div className="space-y-1 p-4">
            <div className="py-2">
              <h2 className="px-2 text-lg font-semibold text-foreground">Customer lists</h2>
              <div className="space-y-1 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "w-full justify-start",
                    "bg-primary/20 text-primary hover:bg-primary/30"
                  )}
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
        <div className="border-b border-border/50 bg-background-raised px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">All customers</h1>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-8 bg-background border-border/50 text-foreground",
                    "placeholder:text-muted-foreground",
                    "focus-visible:ring-primary"
                  )}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-background">
          <div className="min-w-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background-raised">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Email</TableHead>
                  <TableHead className="text-foreground">Organization</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer: Customer) => (
                  <TableRow 
                    key={customer.id}
                    className="cursor-pointer border-border/50 hover:bg-primary/5"
                    onClick={() => handleRowClick(customer)}
                  >
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                          <AvatarImage src={customer.avatar_url || undefined} />
                          <AvatarFallback className="bg-background-accent text-foreground">
                            {customer.full_name?.[0]?.toUpperCase() || customer.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{customer.full_name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.organizations?.map(org => org.organization.name).join(', ') || '-'}
                    </TableCell>
                    <TableCell>
                      <UserStatusBadge status={customer.user_status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
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