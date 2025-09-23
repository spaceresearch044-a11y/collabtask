/*
  # Phase 1: Core Fixes + Auth

  1. Database Functions
    - `get_user_projects(user_id)` - Get all projects user has access to
    - `ensure_user_profile_exists(user_id)` - Auto-create user profiles
    - `generate_team_code()` - Generate unique team codes

  2. Schema Fixes
    - Add `files.user_id` column
    - Fix foreign key constraints
    - Add performance indexes

  3. RLS Fixes
    - Fix recursive RLS for teams/team_members
    - Use EXISTS instead of self-referencing queries

  4. Performance Improvements
    - Add indexes for common queries
    - Optimize RLS policies
*/

-- Add missing user_id column to files table
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

-- Create get_user_projects function
CREATE OR REPLACE FUNCTION get_user_projects(user_id uuid)
RETURNS TABLE(project_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id as project_id
  FROM projects p
  WHERE p.created_by = user_id
  
  UNION
  
  SELECT pm.project_id
  FROM project_members pm
  WHERE pm.user_id = user_id;
END;
$$;

-- Create ensure_user_profile_exists function
CREATE OR REPLACE FUNCTION ensure_user_profile_exists(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_name text;
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    RETURN;
  END IF;
  
  -- Get user data from auth.users
  SELECT email, raw_user_meta_data->>'full_name'
  INTO user_email, user_name
  FROM auth.users
  WHERE id = user_id;
  
  -- Create profile if user exists
  IF user_email IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, has_ever_created_project)
    VALUES (user_id, user_email, user_name, false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$;

-- Improved generate_team_code function
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code text;
  attempts int := 0;
  max_attempts int := 100;
BEGIN
  LOOP
    -- Generate code in format CT-XXXX
    code := 'CT-' || upper(substring(md5(random()::text) from 1 for 4));
    
    -- Check if code already exists
    IF NOT EXISTS (
      SELECT 1 FROM team_codes 
      WHERE team_codes.code = code 
      AND expires_at > now()
    ) THEN
      RETURN code;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique team code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$;

-- Fix teams table RLS policies (remove recursive references)
DROP POLICY IF EXISTS "Users can read teams they belong to" ON teams;
CREATE POLICY "Users can read teams they belong to"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    created_by = uid() OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id AND tm.user_id = uid()
    )
  );

-- Fix team_members table RLS policies
DROP POLICY IF EXISTS "Users can read team members for their teams" ON team_members;
CREATE POLICY "Users can read team members for their teams"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id 
      AND (t.created_by = uid() OR team_members.user_id = uid())
    )
  );

DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
CREATE POLICY "Team admins can manage members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id 
      AND t.created_by = uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_members.team_id 
      AND t.created_by = uid()
    )
  );

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_by_status ON projects(created_by, status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_status ON tasks(assigned_to, status) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_members_user_project ON project_members(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_user_project ON files(user_id, project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_team_codes_code_expires ON team_codes(code, expires_at) WHERE expires_at > now();

-- Fix files table foreign keys
DO $$
BEGIN
  -- Add user_id foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'files_user_id_fkey'
  ) THEN
    ALTER TABLE files ADD CONSTRAINT files_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update files RLS policies
DROP POLICY IF EXISTS "Users can upload files" ON files;
CREATE POLICY "Users can upload files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = uid() AND uploaded_by = uid());

DROP POLICY IF EXISTS "Users can read files for their projects" ON files;
CREATE POLICY "Users can read files for their projects"
  ON files
  FOR SELECT
  TO authenticated
  USING (
    user_id = uid() OR
    uploaded_by = uid() OR
    (project_id IS NOT NULL AND project_id IN (
      SELECT project_id FROM get_user_projects(uid())
    ))
  );

-- Create trigger to auto-create profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, has_ever_created_project)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_projects(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_user_profile_exists(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_team_code() TO authenticated;