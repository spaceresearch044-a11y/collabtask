import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: 'admin' | 'manager' | 'member'
    points: number
    level: number
  } | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.loading = false
      state.error = null
    },
    setProfile: (state, action: PayloadAction<AuthState['profile']>) => {
      state.profile = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearAuth: (state) => {
      state.user = null
      state.profile = null
      state.loading = false
      state.error = null
    },
  },
})

export const { setUser, setProfile, setLoading, setError, clearAuth } = authSlice.actions