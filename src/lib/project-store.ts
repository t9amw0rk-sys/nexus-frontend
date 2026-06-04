import { create } from 'zustand'
import { projectsApi } from './api'
import { toast } from 'sonner'

interface User {
  id: string
  fullName: string
  email: string
  avatarUrl: string | null
  role: string
}

interface ProjectMember {
  userId: string
  fullName: string
  email: string
  avatarUrl: string | null
  role: string
  joinedAt: string
}

interface Project {
  id: string
  name: string
  description: string | null
  color: string | null
  progress: number
  isArchived: boolean
  createdAt: string
  owner: User
  members: ProjectMember[]
  tasksCount: number
}

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null  // ✅ FIX: أضفنا error state
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<void>
  createProject: (data: { name: string; description?: string; color?: string }) => Promise<Project>
  updateProject: (id: string, data: object) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  addMember: (id: string, data: { userId: string; role: string }) => Promise<void>
  removeMember: (id: string, memberId: string) => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // ✅ FIX: error handling على fetchProjects
  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await projectsApi.getAll()
      set({ projects: res.data.data })
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to load projects'
      set({ error: msg })
      toast.error(msg)
    } finally {
      set({ isLoading: false })
    }
  },

  // ✅ FIX: error handling على fetchProject
  fetchProject: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await projectsApi.getById(id)
      set({ currentProject: res.data.data })
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to load project'
      set({ error: msg })
      toast.error(msg)
    } finally {
      set({ isLoading: false })
    }
  },

  // ✅ FIX: error handling على createProject
  createProject: async (data) => {
    try {
      const res = await projectsApi.create(data)
      const newProject = res.data.data
      set((state) => ({ projects: [newProject, ...state.projects] }))
      toast.success('Project created!')
      return newProject
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to create project'
      toast.error(msg)
      throw err
    }
  },

  // ✅ FIX: error handling على updateProject
  updateProject: async (id, data) => {
    try {
      const res = await projectsApi.update(id, data)
      const updated = res.data.data
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
        currentProject: state.currentProject?.id === id ? updated : state.currentProject,
      }))
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to update project'
      toast.error(msg)
      throw err
    }
  },

  // ✅ FIX: error handling على deleteProject
  deleteProject: async (id) => {
    try {
      await projectsApi.delete(id)
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }))
      toast.success('Project deleted')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to delete project'
      toast.error(msg)
      throw err
    }
  },

  // ✅ FIX: error handling على addMember
  addMember: async (id, data) => {
    try {
      await projectsApi.addMember(id, data)
      const res = await projectsApi.getById(id)
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? res.data.data : p)),
        currentProject: res.data.data,
      }))
      toast.success('Member added')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to add member'
      toast.error(msg)
      throw err
    }
  },

  // ✅ FIX: error handling على removeMember
  removeMember: async (id, memberId) => {
    try {
      await projectsApi.removeMember(id, memberId)
      const res = await projectsApi.getById(id)
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? res.data.data : p)),
        currentProject: res.data.data,
      }))
      toast.success('Member removed')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to remove member'
      toast.error(msg)
      throw err
    }
  },
}))