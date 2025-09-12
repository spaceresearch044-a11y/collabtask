export interface Database {
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
          project_count: number
          is_online: boolean
          last_seen: string
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
          project_count?: number
          is_online?: boolean
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'member'
          points?: number
          level?: number
          project_count?: number
          is_online?: boolean
          last_seen?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          project_type: 'individual' | 'team'
          status: string
          deadline: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          color?: string
          project_type?: 'individual' | 'team'
          status?: string
          deadline?: string | null
          created_by: string
        }
        Update: {
          name?: string
          description?: string | null
          color?: string
          project_type?: 'individual' | 'team'
          status?: string
          deadline?: string | null
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
          tags: string[]
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
          tags?: string[]
        }
        Update: {
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          due_date?: string | null
          position?: number
          tags?: string[]
        }
      }
      team_codes: {
        Row: {
          id: string
          code: string
          project_id: string
          created_by: string
          created_at: string
          expires_at: string
        }
        Insert: {
          code: string
          project_id: string
          created_by: string
          expires_at?: string
        }
        Update: {
          expires_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'lead' | 'member'
          joined_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          role?: 'lead' | 'member'
        }
        Update: {
          role?: 'lead' | 'member'
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          task_id: string | null
          activity_type: 'created_project' | 'joined_project' | 'completed_task' | 'uploaded_file' | 'commented' | 'assigned_task'
          description: string
          metadata: Record<string, any>
          created_at: string
        }
        Insert: {
          user_id: string
          project_id?: string | null
          task_id?: string | null
          activity_type: 'created_project' | 'joined_project' | 'completed_task' | 'uploaded_file' | 'commented' | 'assigned_task'
          description: string
          metadata?: Record<string, any>
        }
        Update: never
      }
      files: {
        Row: {
          id: string
          name: string
          size: number
          mime_type: string
          url: string
          project_id: string | null
          task_id: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          name: string
          size: number
          mime_type: string
          url: string
          project_id?: string | null
          task_id?: string | null
          uploaded_by: string
        }
        Update: never
      }
      comments: {
        Row: {
          id: string
          content: string
          task_id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          content: string
          task_id: string
          user_id: string
        }
        Update: {
          content?: string
        }
      }
    }
  }
}