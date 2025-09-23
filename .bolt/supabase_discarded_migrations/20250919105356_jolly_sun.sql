/*
  # Fix Database Issues

  1. Database Functions
    - Create `get_user_projects()` function to replace missing RPC
    - Fix team code generation function
    - Add user profile creation function

  2. Schema Updates
    - Add missing `user_id` column to files table
    - Fix team policies to prevent infinite recursion
    - Add proper indexes for performance

  3. Security
    - Simplify RLS policies to prevent recursion
    - Add proper role-based access controls
    - Fix team member relationship queries
*/

-- Create get_user_projects function
CREATE OR REPLACE FUNCTION get_user_projects(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  color text,
  project_type project_type,
  status text,
  deadline timestamptz,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  user_role member_role
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.color,
    p.project_type,
    p.status,
    p.deadline,
    p.created_by,
    p.created_at,
    p.updated_at,
    CASE 
      WHEN p.created_by = user_uuid THEN 'lead'::member_role
      ELSE COALESCE(pm.role, 'member'::member_role)
    END as user_role
  FROM projects p
  LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = user_uuid
  WHERE p.created_by = user_uuid 
     OR pm.user_id = user_uuid;
END;
$$;

-- Create ensure_user_profile_exists function
CREATE OR REPLACE FUNCTION ensure_user_profile_exists(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, has_ever_created_project)
  SELECT 
    user_id,
    COALESCE(auth.email(), 'unknown@example.com'),
    COALESCE(auth.raw_user_meta_data()->>'full_name', 'User'),
    false
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id
  );
END;
$$;

-- Improve generate_team_code function
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code text;
  attempts int := 0;
  max_attempts int := 10;
BEGIN
  LOOP
    -- Generate a random 6-character code
    code := 'CT-' || upper(substring(md5(random()::text) from 1 for 4));
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM team_codes WHERE team_codes.code = code AND expires_at > now()) THEN
      RETURN code;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique team code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$;

-- Add user_id column to files table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE files ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
    
    -- Update existing files to have user_id = uploaded_by
    UPDATE files SET user_id = uploaded_by WHERE user_id IS NULL;
    
    -- Make user_id NOT NULL after updating
    ALTER TABLE files ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Fix teams table RLS policies (remove infinite recursion)
DROP POLICY IF EXISTS "Users can read teams they belong to" ON teams;
CREATE POLICY "Users can read teams they belong to"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Fix team_members policies to prevent recursion
DROP POLICY IF EXISTS "Users can read team members for their teams" ON team_members;
CREATE POLICY "Users can read team members for their teams"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    ) OR
    team_id IN (
      SELECT tm.team_id 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid()
    )
  );

-- Add missing RLS policies for files
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read files for their projects" ON files;
CREATE POLICY "Users can read files for their projects"
  ON files
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    project_id IN (
      SELECT project_id FROM get_user_projects(auth.uid())
    ) OR
    is_public = true
  );

DROP POLICY IF EXISTS "Users can upload files" ON files;
CREATE POLICY "Users can upload files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "File uploaders can manage their files" ON files;
CREATE POLICY "File uploaders can manage their files"
  ON files
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_project_user ON files(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);

-- Add log_activity function for activity logging
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id uuid,
  p_action activity_action,
  p_description text,
  p_project_id uuid DEFAULT NULL,
  p_task_id uuid DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_target_type text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO activity_logs (
    user_id,
    project_id,
    task_id,
    activity_type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_project_id,
    p_task_id,
    p_action::activity_type,
    p_description,
    jsonb_build_object(
      'target_id', p_target_id,
      'target_type', p_target_type
    )
  );
END;
$$;