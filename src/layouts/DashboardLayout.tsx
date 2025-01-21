import { Outlet, Link } from 'react-router-dom'
import { Home, Ticket, Book, Users, Settings, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function DashboardLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      {/* Top Navigation */}
      <header className="border-b bg-white h-14">
        <div className="flex h-full items-center px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <Home className="h-5 w-5 text-gray-700" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="ml-2">
            <Link to="/tickets/new">
              <Plus className="h-4 w-4 mr-2 text-gray-700" />
              Add
            </Link>
          </Button>
          <div className="ml-auto flex items-center space-x-4">
            <div className="w-64 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="h-9 pl-8"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-gray-50">
          <nav className="h-full overflow-y-auto">
            <div className="space-y-1 p-4">
              <div className="py-2">
                <h2 className="px-2 text-lg font-semibold text-gray-900">Views</h2>
                <div className="space-y-1 mt-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/tickets">
                      <Ticket className="mr-2 h-4 w-4" />
                      Your unresolved tickets
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/tickets/unassigned">
                      <Ticket className="mr-2 h-4 w-4" />
                      Unassigned tickets
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/tickets/all">
                      <Ticket className="mr-2 h-4 w-4" />
                      All unsolved tickets
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/tickets/recently-updated">
                      <Ticket className="mr-2 h-4 w-4" />
                      Recently updated
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="py-2">
                <h2 className="px-2 text-lg font-semibold text-gray-900">Resources</h2>
                <div className="space-y-1 mt-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/knowledge-base">
                      <Book className="mr-2 h-4 w-4" />
                      Knowledge Base
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/users">
                      <Users className="mr-2 h-4 w-4" />
                      Users
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  )
} 