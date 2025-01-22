import { create } from 'zustand'

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
  removeTab: (id: string) => string | null // Returns the path to navigate to
  setActiveTab: (id: string) => void
  setActiveTabByPath: (path: string) => void
  hasTab: (path: string) => boolean
  getTabByPath: (path: string) => Tab | undefined
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tab) => {
    const id = crypto.randomUUID()
    set((state) => ({
      tabs: [...state.tabs, { ...tab, id }],
      activeTabId: id,
    }))
  },

  removeTab: (id) => {
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
    set({ activeTabId: id })
  },

  setActiveTabByPath: (path) => {
    const tab = get().getTabByPath(path)
    if (tab) {
      set({ activeTabId: tab.id })
    }
  },

  hasTab: (path) => {
    const { tabs } = get()
    return tabs.some((tab) => tab.path === path)
  },

  getTabByPath: (path) => {
    const { tabs } = get()
    return tabs.find((tab) => tab.path === path)
  },
})) 