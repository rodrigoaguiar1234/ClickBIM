import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ViewType = 'board' | 'list' | 'gantt' | 'calendar'

interface WorkspaceStore {
  activeWorkspaceId: string | null
  activeWorkspaceSlug: string | null
  activeSpaceId: string | null
  activeProjectId: string | null
  activeListId: string | null
  activeView: ViewType
  setActiveWorkspaceId: (id: string | null) => void
  setActiveWorkspaceSlug: (slug: string | null) => void
  setActiveSpaceId: (id: string | null) => void
  setActiveProjectId: (id: string | null) => void
  setActiveListId: (id: string | null) => void
  setActiveView: (view: ViewType) => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeWorkspaceSlug: null,
      activeSpaceId: null,
      activeProjectId: null,
      activeListId: null,
      activeView: 'board',
      setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
      setActiveWorkspaceSlug: (slug) => set({ activeWorkspaceSlug: slug }),
      setActiveSpaceId: (id) => set({ activeSpaceId: id }),
      setActiveProjectId: (id) => set({ activeProjectId: id }),
      setActiveListId: (id) => set({ activeListId: id }),
      setActiveView: (view) => set({ activeView: view }),
    }),
    { name: 'clickbim-workspace' }
  )
)
