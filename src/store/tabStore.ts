import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Tab {
  id: string
  title: string
  path: string
  icon?: string
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab: Omit<Tab, 'id'>) => void
  updateTab: (path: string, updates: Partial<Omit<Tab, 'id'>>) => void
  removeTab: (id: string) => string | null // Returns the path to navigate to
  setActiveTab: (id: string) => void
  setActiveTabByPath: (path: string) => void
  hasTab: (path: string) => boolean
  getTabByPath: (path: string) => Tab | undefined
}

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      addTab: (tab) => {
        const id = crypto.randomUUID()
        console.log('[TabStore] Adding tab:', { ...tab, id })
        set((state) => ({
          tabs: [...state.tabs, { ...tab, id }],
          activeTabId: id,
        }))
      },

      updateTab: (path, updates) => {
        console.log('[TabStore] Updating tab:', { path, updates })
        set((state) => ({
          tabs: state.tabs.map((tab) => 
            tab.path === path 
              ? { ...tab, ...updates }
              : tab
          )
        }))
      },

      removeTab: (id) => {
        console.log('[TabStore] Removing tab:', id)
        const state = get()
        const tabIndex = state.tabs.findIndex((tab) => tab.id === id)
        const isActive = state.activeTabId === id
        
        // Get the next tab to activate
        let nextTabPath: string | null = null
        if (isActive) {
          const remainingTabs = state.tabs.filter((tab) => tab.id !== id)
          // Try to get the next tab to the right
          const nextTab = remainingTabs[tabIndex] ?? 
            // If no tab to the right, try to get the tab to the left
            remainingTabs[tabIndex - 1] ?? 
            // If no tabs remain, we'll return null to indicate we should go to dashboard
            null

          nextTabPath = nextTab?.path ?? '/dashboard'
          console.log('[TabStore] Next tab path:', nextTabPath)
        }

        set((state) => ({
          tabs: state.tabs.filter((tab) => tab.id !== id),
          activeTabId: isActive 
            ? (nextTabPath === '/dashboard' ? null : state.tabs.find(t => t.path === nextTabPath)?.id ?? null)
            : state.activeTabId
        }))

        return nextTabPath
      },

      setActiveTab: (id) => {
        console.log('[TabStore] Setting active tab:', id)
        set({ activeTabId: id })
      },

      setActiveTabByPath: (path) => {
        console.log('[TabStore] Setting active tab by path:', path)
        const tab = get().getTabByPath(path)
        if (tab) {
          console.log('[TabStore] Found tab for path:', tab.id)
          set({ activeTabId: tab.id })
        }
      },

      hasTab: (path) => {
        const { tabs } = get()
        const hasTab = tabs.some((tab) => tab.path === path)
        console.log('[TabStore] Checking has tab:', { path, hasTab })
        return hasTab
      },

      getTabByPath: (path) => {
        const { tabs } = get()
        const tab = tabs.find((tab) => tab.path === path)
        console.log('[TabStore] Getting tab by path:', { path, foundTab: !!tab })
        return tab
      },
    }),
    {
      name: 'tab-storage', // unique name for localStorage key
    }
  )
) 