/*
  # Complete CollabTask Schema

  1. New Tables
    - `team_codes` - For team project joining
    - `project_members` - Many-to-many relationship for project membership
    - `activity_logs` - Track all user activities
    - `files` - File management
    - `comments` - Task comments

  2. Updates to existing tables
    - Add team_code, project_type, deadline, priority to projects
    - Add tags to tasks
    - Update profiles with project counts

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table
*/

-- Create enum types
CREATE TYPE project_type AS ENUM ('individual', 'team');
CREATE TYPE member_role AS ENUM ('lead', 'member');
CREATE TYPE activity_type AS ENUM ('created_project', 'joined_project', 'completed_task', 'uploaded_file', 'commented', 'assigned_task');

-- Create team_codes table
CREATE TABLE IF NOT EXISTS team_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role member_role DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size bigint NOT NULL,
  mime_type text NOT NULL,
  url text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to existing tables
DO $$
BEGIN
  -- Add columns to projects table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_type') THEN
    ALTER TABLE projects ADD COLUMN project_type project_type DEFAULT 'individual';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deadline') THEN
    ALTER TABLE projects ADD COLUMN deadline timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status') THEN
    ALTER TABLE projects ADD COLUMN status text DEFAULT 'active';
  END IF;

  -- Add columns to tasks table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'tags') THEN
    ALTER TABLE tasks ADD COLUMN tags text[] DEFAULT '{}';
  END IF;

  -- Add columns to profiles table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'project_count') THEN
    ALTER TABLE profiles ADD COLUMN project_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_online') THEN
    ALTER TABLE profiles ADD COLUMN is_online boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_seen') THEN
    ALTER TABLE profiles ADD COLUMN last_seen timestamptz DEFAULT now();
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE team_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for team_codes
CREATE POLICY "Users can read team codes for their projects"
  ON team_codes FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Project creators can manage team codes"
  ON team_codes FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Create policies for project_members
CREATE POLICY "Users can read project members"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can join projects"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Project leads can manage members"
  ON project_members FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role = 'lead'
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

-- Create policies for activity_logs
CREATE POLICY "Users can read activity logs for their projects"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can create their own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create policies for files
CREATE POLICY "Users can read files for their projects"
  ON files FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can upload files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "File uploaders can manage their files"
  ON files FOR ALL
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Create policies for comments
CREATE POLICY "Users can read comments for accessible tasks"
  ON comments FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.created_by = auth.uid() OR pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS team_codes_code_idx ON team_codes(code);
CREATE INDEX IF NOT EXISTS team_codes_project_id_idx ON team_codes(project_id);
CREATE INDEX IF NOT EXISTS project_members_project_id_idx ON project_members(project_id);
CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON project_members(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_project_id_idx ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS files_project_id_idx ON files(project_id);
CREATE INDEX IF NOT EXISTS files_task_id_idx ON files(task_id);
CREATE INDEX IF NOT EXISTS comments_task_id_idx ON comments(task_id);

-- Function to generate team codes
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := 'CT-' || upper(substring(md5(random()::text) from 1 for 4));
    SELECT EXISTS(SELECT 1 FROM team_codes WHERE team_codes.code = code) INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update project count
CREATE OR REPLACE FUNCTION update_project_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET project_count = project_count + 1 
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET project_count = project_count - 1 
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project count
CREATE TRIGGER update_user_project_count
  AFTER INSERT OR DELETE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION update_project_count();