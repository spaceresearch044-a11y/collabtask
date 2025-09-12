import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  project_id: string
  assigned_to: string | null
  created_by: string
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
}

interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
}

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload)
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
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
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  setLoading,
  setError,
} = tasksSlice.actions