import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  currentView: '3d' | 'kanban' | 'list'
  currentPage: string
  showNotifications: boolean
  notifications: Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: number
  }>
}

const initialState: UIState = {
  theme: 'dark',
  sidebarOpen: true,
  currentView: '3d',
  currentPage: 'dashboard',
  showNotifications: false,
  notifications: [],
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setCurrentView: (state, action: PayloadAction<UIState['currentView']>) => {
      state.currentView = action.payload
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload
    },
    toggleNotifications: (state) => {
      state.showNotifications = !state.showNotifications
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
      const notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      }
      state.notifications.unshift(notification)
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10)
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
  },
})

export const {
  toggleTheme,
  toggleSidebar,
  setCurrentView,
  setCurrentPage,
  toggleNotifications,
  addNotification,
  removeNotification,
} = uiSlice.actions