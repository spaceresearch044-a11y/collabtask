import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Project {
  id: string
  name: string
  description: string | null
  color: string
  created_by: string
  created_at: string
  updated_at: string
}

interface ProjectsState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
}

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload)
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = action.payload
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setCurrentProject,
  setLoading,
  setError,
} = projectsSlice.actions