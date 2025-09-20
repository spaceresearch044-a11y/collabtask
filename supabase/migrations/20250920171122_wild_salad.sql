/*
  # Fix Auth and Schema Issues

  1. Database Functions
    - Create `get_user_projects()` function to handle complex project queries
    - Create `ensure_user_profile_exists()` function for profile management
    - Improve `generate_team_code()` function

  2. Schema Fixes
    - Add missing `user_id` column to files table
    - Fix team member policies to prevent recursion
    - Update RLS policies for better performance

  3. Security
    - Fix recursive RLS policies
    - Ensure proper foreign key constraints
    - Add performance indexes
*/

-- Create get_user_projects function to handle complex OR queries
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
  WHERE p.created_by = user_uuid OR pm.user_id = user_uuid;
END;
$$;

-- Create ensure_user_profile_exists function
CREATE OR REPLACE FUNCTION ensure_user_profile_exists(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  SELECT 
    auth.uid(),
    auth.email(),
    COALESCE(auth.raw_user_meta_data()->>'full_name', auth.email())
  WHERE auth.uid() = user_id
  ON CONFLICT (id) DO NOTHING;
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

-- Add missing user_id column to files table if it doesn't exist
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

-- Fix teams RLS policies to prevent recursion
DROP POLICY IF EXISTS "Users can read teams they belong to" ON teams;
CREATE POLICY "Users can read teams they belong to"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Fix team_members RLS policies to prevent recursion
DROP POLICY IF EXISTS "Users can read team members for their teams" ON team_members;
CREATE POLICY "Users can read team members for their teams"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    invited_by = auth.uid() OR
    team_id IN (
      SELECT id FROM teams 
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;
CREATE POLICY "Team admins can manage members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams 
      WHERE created_by = auth.uid()
    ) OR
    (user_id = auth.uid() AND invited_by IS NOT NULL)
  )
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams 
      WHERE created_by = auth.uid()
    ) OR
    user_id = auth.uid()
  );

-- Add files RLS policies
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read files for their projects" ON files;
CREATE POLICY "Users can read files for their projects"
  ON files
  FOR SELECT
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR
    user_id = auth.uid() OR
    project_id IN (
      SELECT project_id FROM get_user_projects(auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can upload files" ON files;
CREATE POLICY "Users can upload files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "File uploaders can manage their files" ON files;
CREATE POLICY "File uploaders can manage their files"
  ON files
  FOR ALL
  TO authenticated
  USING (uploaded_by = auth.uid() AND user_id = auth.uid())
  WITH CHECK (uploaded_by = auth.uid() AND user_id = auth.uid());

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_project_user ON files(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_projects(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_user_profile_exists(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_team_code() TO authenticated;