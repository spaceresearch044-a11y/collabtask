import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          color?: string
          created_by: string
        }
        Update: {
          name?: string
          description?: string | null
          color?: string
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
    }
  }
}