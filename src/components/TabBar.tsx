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
    <div className="flex h-14 overflow-x-auto bg-background-alt border-b border-border/50">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => handleTabClick(tab.id, tab.path)}
          className={cn(
            'group relative flex items-center min-w-[150px] max-w-[200px] h-14 px-4',
            'border-r border-border/50',
            'cursor-pointer transition-all duration-200',
            'hover:bg-primary/5',
            'text-muted-foreground',
            activeTabId === tab.id && [
              'bg-background',
              'text-primary font-medium',
              // Gradient border bottom
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]',
              'after:bg-gradient-to-r after:from-primary after:to-accent',
              // Glow effect
              'after:shadow-[0_0_8px_rgba(247,0,207,0.5)]',
              // Animation
              'after:animate-in after:fade-in-0 after:slide-in-from-left-full',
              // Hover effect
              'group-hover:after:opacity-100'
            ]
          )}
        >
          <span className="truncate flex-1">{tab.title}</span>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "opacity-0 group-hover:opacity-100 h-5 w-5 p-0 ml-2",
              "hover:bg-destructive/10 hover:text-destructive",
              "text-muted-foreground",
              "transition-all duration-200"
            )}
            onClick={(e) => handleCloseTab(e, tab.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
} 