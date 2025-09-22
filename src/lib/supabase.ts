import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the development server.')
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the development server.')
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the development server.')
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('Invalid VITE_SUPABASE_URL format. Should be: https://your-project-ref.supabase.co')
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('Invalid VITE_SUPABASE_URL format. Should be: https://your-project-ref.supabase.co')
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('Invalid VITE_SUPABASE_URL format. Should be: https://your-project-ref.supabase.co')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key)
        } catch {
          return null
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value)
        } catch {
          // Ignore storage errors
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key)
        } catch {
          // Ignore storage errors
        }
      }
    }
  }
})

// Handle invalid refresh tokens
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && !session) {
    // Clear invalid session data
    localStorage.removeItem('sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token')
    window.location.reload()
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'member'
          points: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member'
          points?: number
          level?: number
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member'
          points?: number
          level?: number
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_by: string
          deadline: string | null
          project_type: 'individual' | 'team'
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          color?: string
          created_by: string
          deadline?: string | null
          project_type?: 'individual' | 'team'
          status?: string
        }
        Update: {
          name?: string
          description?: string | null
          color?: string
          deadline?: string | null
          project_type?: 'individual' | 'team'
          status?: string
        }
      }
      tasks: {
        Row: {
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
        Insert: {
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          project_id: string
          assigned_to?: string | null
          created_by: string
          due_date?: string | null
          position?: number
        }
        Update: {
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          due_date?: string | null
          position?: number
        }
      }
      files: {
        Row: {
          id: string
          name: string
          file_size: number
          size: bigint
          mime_type: string
          url: string
          file_url: string
          project_id: string | null
          task_id: string | null
          user_id: string
          uploaded_by: string
          version: number
          tags: string[]
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          file_size: number
          size: bigint
          mime_type: string
          url: string
          file_url: string
          project_id?: string | null
          task_id?: string | null
          user_id: string
          uploaded_by: string
          version?: number
          tags?: string[]
          is_public?: boolean
        }
        Update: {
          name?: string
          tags?: string[]
          is_public?: boolean
        }
      }
    }
  }
}