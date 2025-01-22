import { X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { useTabStore } from '@/store/tabStore'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

export function TabBar() {
  const { tabs, activeTabId, removeTab, setActiveTab, setActiveTabByPath } = useTabStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Sync active tab with current location
  useEffect(() => {
    setActiveTabByPath(location.pathname)
  }, [location.pathname, setActiveTabByPath])

  if (tabs.length === 0) {
    return null
  }

  const handleTabClick = (id: string, path: string) => {
    setActiveTab(id)
    navigate(path)
  }

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const tab = tabs.find(t => t.id === id)
    const nextPath = removeTab(id)
    // Only navigate if we're currently on the tab being closed
    if (nextPath && location.pathname === tab?.path) {
      navigate(nextPath)
    }
  }

  return (
    <div className="flex h-14 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => handleTabClick(tab.id, tab.path)}
          className={cn(
            'group flex items-center min-w-[150px] max-w-[200px] h-14 px-4 border-r cursor-pointer',
            'hover:bg-gray-100 transition-colors text-gray-900',
            activeTabId === tab.id 
              ? 'bg-white border-b-2 border-b-primary font-medium' 
              : 'bg-gray-50 hover:bg-gray-100'
          )}
        >
          <span className="truncate flex-1">{tab.title}</span>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 ml-2 hover:bg-gray-200"
            onClick={(e) => handleCloseTab(e, tab.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
} 