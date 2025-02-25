import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, NotebookText, Users, Building, BarChart3, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Database } from '@/types/database'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useQueryClient } from '@tanstack/react-query'
import { getTicket } from '@/features/tickets/services'
import { TicketWithUser } from '@/features/tickets/types'

type UserStatus = Database['public']['Enums']['user_status']

export function DashboardLayout() {
  console.log('[DashboardLayout] Rendering')
  
  const { user, signOut } = useAuthStore()
  const [userStatus, setUserStatus] = useState<UserStatus>('offline')
  const location = useLocation()
  const { addTab, hasTab, updateTab } = useTabStore()
  const queryClient = useQueryClient()
  
  useEffect(() => {
    console.log('[DashboardLayout] Mount/Update')
    const fetchUserStatus = async () => {
      if (!user?.id) return
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_status')
        .eq('id', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching user status:', error)
        return
      }
      
      if (data) {
        setUserStatus(data.user_status as UserStatus)
      }
    }
    
    fetchUserStatus()
  }, [user?.id])
  
  const updateUserStatus = useCallback(async (newUserStatus: UserStatus) => {
    if (!user?.id) return
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ user_status: newUserStatus })
      .eq('id', user.id)
    
    if (error) {
      console.error('Error updating user status:', error)
      return
    }
    
    setUserStatus(newUserStatus)
  }, [user?.id])

  const handleSignOut = useCallback(async () => {
    if (!user?.id) return
    
    // Update status to offline before signing out
    await updateUserStatus('offline')
    await signOut()
  }, [signOut, updateUserStatus, user?.id])

  const getUserStatusColor = (user_status: UserStatus) => {
    switch (user_status) {
      case 'online':
        return 'bg-semantic-success'
      case 'away':
        return 'bg-semantic-warning'
      case 'transfers_only':
        return 'bg-accent-blue'
      case 'offline':
        return 'bg-muted-foreground'
    }
  }

  const getUserStatusRingColor = (user_status: UserStatus) => {
    switch (user_status) {
      case 'online':
        return 'ring-semantic-success'
      case 'away':
        return 'ring-semantic-warning'
      case 'transfers_only':
        return 'ring-accent-blue'
      case 'offline':
        return 'ring-muted-foreground'
    }
  }

  const getUserStatusLabel = (user_status: UserStatus) => {
      switch (user_status) {
      case 'transfers_only':
        return 'Transfers only'
      default:
        return user_status.charAt(0).toUpperCase() + user_status.slice(1)
    }
  }

  // Handle tab creation for specific routes
  useEffect(() => {
    const path = location.pathname
    console.log('[DashboardLayout] Tab effect running, path:', path)
    
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
    
    console.log('[DashboardLayout] Should create tab:', shouldCreateTab)
    
    if (!shouldCreateTab) {
      return
    }
    
    // If we're not already tracking this path as a tab
    const hasExistingTab = hasTab(path)
    console.log('[DashboardLayout] Has existing tab:', hasExistingTab)
    
    if (!hasExistingTab) {
      const createTab = () => {
        let title = 'New Tab'
        
        if (path.startsWith('/tickets/')) {
          if (path === '/tickets/new') {
            title = 'New Ticket'
          } else {
            const ticketId = path.split('/').pop()
            console.log('[DashboardLayout] Creating tab for ticket:', ticketId)
            
            // Try to get ticket from React Query cache
            const ticket = queryClient.getQueryData<TicketWithUser>(['ticket', ticketId])
            console.log('[DashboardLayout] Ticket from cache:', ticket?.title)
            
            title = ticket?.title || 'Loading...'
            
            // Update tab title when ticket data is available
            console.log('[DashboardLayout] Fetching ticket data for tab')
            queryClient.fetchQuery<TicketWithUser>({
              queryKey: ['ticket', ticketId],
              queryFn: () => getTicket({ ticketId: ticketId! })
            }).then(ticket => {
              console.log('[DashboardLayout] Fetched ticket for tab:', ticket?.title)
              if (ticket?.title && hasTab(path)) {
                console.log('[DashboardLayout] Updating tab title to:', ticket.title)
                updateTab(path, { title: ticket.title })
              }
            }).catch(() => {
              console.error('Failed to fetch ticket for tab')
            })
          }
        } else if (path === '/profile') {
          title = 'Profile'
        } else if (path === '/settings') {
          title = 'Settings'
        }
        
        console.log('[DashboardLayout] Adding initial tab with title:', title)
        addTab({
          title,
          path,
        })
      }
      
      if (!hasTab(location.pathname)) {
        createTab()
      }
    }
  }, [location.pathname, addTab, hasTab, queryClient, updateTab])

  useEffect(() => {
    return () => console.log('[DashboardLayout] Unmount')
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex">
      {/* Sidebar */}
      <aside className="w-16 border-r border-border/50 bg-background">
        <nav className="h-full overflow-y-auto">
          <div className="flex flex-col items-center py-4 space-y-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200" 
                    asChild
                  >
                    <Link to="/dashboard">
                      <Home className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-background-raised border-border/50">
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200" 
                    asChild
                  >
                    <Link to="/views">
                      <NotebookText className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-background-raised border-border/50">
                  <p>Views</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200" 
                    asChild
                  >
                    <Link to="/customers">
                      <Users className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-background-raised border-border/50">
                  <p>Customers</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200" 
                    asChild
                  >
                    <Link to="/organizations">
                      <Building className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-background-raised border-border/50">
                  <p>Organizations</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200" 
                    asChild
                  >
                    <Link to="/data">
                      <BarChart3 className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-background-raised border-border/50">
                  <p>Data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="border-b border-border/50 bg-background h-14">
          <div className="flex h-full items-center">
            <div className="flex-1 flex items-center overflow-hidden">
              <TabBar />
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="ml-2 shrink-0 text-foreground hover:text-primary hover:bg-primary/10"
              >
                <Link to="/tickets/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center px-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0">
                    <Avatar className={`ring-2 ${getUserStatusRingColor(userStatus)} transition-colors duration-200`}>
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-background-accent text-foreground">
                        {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-background-raised border-border/50"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">
                        {user?.user_metadata?.full_name || user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground flex items-center">
                        <span className={`h-2 w-2 rounded-full mr-1 ${getUserStatusColor(userStatus)}`} />
                        {getUserStatusLabel(userStatus)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuRadioGroup value={userStatus} onValueChange={(value) => updateUserStatus(value as UserStatus)}>
                    <DropdownMenuRadioItem value="online" className="cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary">
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-semantic-success mr-2" />
                        Online
                      </span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="away" className="cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary">
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-semantic-warning mr-2" />
                        Away
                      </span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="transfers_only" className="cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary">
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-accent-blue mr-2" />
                        Transfers only
                      </span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="offline" className="cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary">
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground mr-2" />
                        Offline
                      </span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary">
                      View profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/help" className="cursor-pointer text-foreground hover:bg-primary/10 hover:text-primary">
                      Help
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="cursor-pointer text-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
} 