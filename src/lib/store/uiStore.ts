import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  activeModal: string | null
  setActiveModal: (modal: string | null) => void
  taskDetailId: string | null
  setTaskDetailId: (id: string | null) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      activeModal: null,
      setActiveModal: (modal) => set({ activeModal: modal }),
      taskDetailId: null,
      setTaskDetailId: (id) => set({ taskDetailId: id }),
    }),
    { name: 'clickbim-ui' }
  )
)
