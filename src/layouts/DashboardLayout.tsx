import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, NotebookText, Book, Users, Building, BarChart3, Settings, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/authStore'
import { useTabStore } from '@/store/tabStore'
import { TabBar } from '@/components/TabBar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/config/supabase/client'
import { Database } from '../../types/database'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ticketService } from '@/features/tickets/services/ticketService'

type UserStatus = Database['public']['Enums']['user_status']

export function DashboardLayout() {
  const { user, signOut } = useAuthStore()
  const [status, setStatus] = useState<UserStatus>('offline')
  const location = useLocation()
  const { addTab, hasTab } = useTabStore()
  
  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.id) return
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('status')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching status:', error)
        return
      }
      
      if (data?.status) {
        setStatus(data.status as UserStatus)
      }
    }
    
    fetchStatus()
  }, [user?.id])
  
  const updateStatus = useCallback(async (newStatus: UserStatus) => {
    if (!user?.id) return
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ status: newStatus })
      .eq('id', user.id)
    
    if (error) {
      console.error('Error updating status:', error)
      return
    }
    
    setStatus(newStatus)
  }, [user?.id])

  const handleSignOut = useCallback(async () => {
    if (!user?.id) return
    
    // Update status to offline before signing out
    await updateStatus('offline')
    await signOut()
  }, [signOut, updateStatus, user?.id])

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'transfers_only':
        return 'bg-blue-500'
      case 'offline':
        return 'bg-gray-500'
    }
  }

  const getStatusRingColor = (status: UserStatus) => {
    switch (status) {
      case 'online':
        return 'ring-green-500'
      case 'away':
        return 'ring-yellow-500'
      case 'transfers_only':
        return 'ring-blue-500'
      case 'offline':
        return 'ring-gray-500'
    }
  }

  const getStatusLabel = (status: UserStatus) => {
    switch (status) {
      case 'transfers_only':
        return 'Transfers only'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  // Handle tab creation for specific routes
  useEffect(() => {
    const path = location.pathname
    
    // List of paths that should not create tabs
    const excludedPaths = [
      '/tickets',
      '/tickets/unassigned',
      '/tickets/all',
      '/tickets/recently-updated'
    ]
    
    // Only create tabs for specific routes
    const shouldCreateTab = 
      (!excludedPaths.includes(path) && path.startsWith('/tickets/')) || // Individual tickets
      path === '/profile' || // Profile settings
      path === '/settings' // Other settings pages
    
    if (!shouldCreateTab) {
      return
    }
    
    // If we're not already tracking this path as a tab
    if (!hasTab(path)) {
      const createTab = async () => {
        let title = 'New Tab'
        
        if (path.startsWith('/tickets/')) {
          if (path === '/tickets/new') {
            title = 'New Ticket'
          } else {
            const ticketId = path.split('/').pop()
            try {
              const ticket = await ticketService.getTicket(ticketId!)
              title = ticket.title
            } catch (error) {
              console.error('Failed to fetch ticket:', error)
            }
          }
        } else if (path === '/profile') {
          title = 'Profile'
        } else if (path === '/settings') {
          title = 'Settings'
        }
        
        addTab({
          title,
          path,
        })
      }
      
      createTab()
    }
  }, [location.pathname, addTab, hasTab])

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex">
      {/* Sidebar */}
      <aside className="w-16 border-r bg-gray-50">
        <nav className="h-full overflow-y-auto">
          <div className="flex flex-col items-center py-4 space-y-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/dashboard">
                      <Home className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/views">
                      <NotebookText className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Views</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/knowledge-base">
                      <Book className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Knowledge Base</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/customers">
                      <Users className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Customers</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/organizations">
                      <Building className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Organizations</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/data">
                      <BarChart3 className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Data</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/admin">
                      <Settings className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Admin</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="border-b bg-white h-14">
          <div className="flex h-full items-center">
            <div className="flex-1 flex items-center overflow-hidden">
              <TabBar />
              <Button variant="ghost" size="sm" asChild className="ml-2 shrink-0">
                <Link to="/tickets/new">
                  <Plus className="h-4 w-4 mr-2 text-gray-700" />
                  Add
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 px-4">
              <div className="w-64 relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="h-9 pl-8"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0">
                    <Avatar className={`ring-2 ${getStatusRingColor(status)}`}>
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/10">
                        {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground flex items-center">
                        <span className={`h-2 w-2 rounded-full mr-1 ${getStatusColor(status)}`} />
                        {getStatusLabel(status)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={status} onValueChange={(value) => updateStatus(value as UserStatus)}>
                    <DropdownMenuRadioItem value="online" className="cursor-pointer">
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                        Online
                      </span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="away" className="cursor-pointer">
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                        Away
                      </span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="transfers_only" className="cursor-pointer">
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
                        Transfers only
                      </span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="offline" className="cursor-pointer">
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-gray-500 mr-2" />
                        Offline
                      </span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">View profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/help" className="cursor-pointer">Help</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  )
} 