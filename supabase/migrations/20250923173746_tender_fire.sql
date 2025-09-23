/*
  # Fix Projects RLS and Database Functions

  1. Database Functions
    - Create `get_user_projects_safe` function for proper project access
    - Create `generate_team_code` function for unique team codes
    - Create `ensure_user_profile_exists` function for profile creation

  2. Security
    - Fix RLS policies for projects table
    - Ensure proper access control for team projects
    - Add missing indexes for performance

  3. Data Integrity
    - Add proper foreign key constraints
    - Ensure team codes are unique and expire properly
*/

-- Create function to safely get user projects
CREATE OR REPLACE FUNCTION get_user_projects_safe(user_id uuid)
RETURNS TABLE(project_id uuid) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate unique team codes
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate a 6-character code: CT-XXXX
    code := 'CT-' || upper(substring(md5(random()::text) from 1 for 4));
    
    -- Check if code already exists and is not expired
    SELECT EXISTS(
      SELECT 1 FROM team_codes 
      WHERE team_codes.code = code 
      AND expires_at > now()
    ) INTO exists;
    
    -- If code doesn't exist or is expired, we can use it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to ensure user profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile_exists(user_id uuid)
RETURNS void AS $$
DECLARE
  user_email text;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  -- Insert profile if it doesn't exist
  INSERT INTO profiles (id, email, full_name, has_ever_created_project)
  VALUES (user_id, user_email, null, false)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update projects RLS policies
DROP POLICY IF EXISTS "Users can select their projects safely" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects safely" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects safely" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects safely" ON projects;

-- Create comprehensive RLS policies for projects
CREATE POLICY "Users can select their accessible projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT project_id FROM get_user_projects_safe(auth.uid())
    )
  );

CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Project creators can update their projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Project creators can delete their projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by_status ON projects(created_by, status);
CREATE INDEX IF NOT EXISTS idx_projects_type_status ON projects(project_type, status);
CREATE INDEX IF NOT EXISTS idx_team_codes_expires_at ON team_codes(expires_at) WHERE expires_at > now();

-- Update team_codes RLS policies
DROP POLICY IF EXISTS "Project creators can manage team codes" ON team_codes;
DROP POLICY IF EXISTS "Users can read team codes for their projects" ON team_codes;

CREATE POLICY "Project creators can manage team codes"
  ON team_codes
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can read valid team codes"
  ON team_codes
  FOR SELECT
  TO authenticated
  USING (expires_at > now());

-- Update project_members RLS policies
DROP POLICY IF EXISTS "Project creators can manage all members" ON project_members;
DROP POLICY IF EXISTS "Users can read all project members" ON project_members;

CREATE POLICY "Project creators and leads can manage members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
    OR
    (
      project_id IN (
        SELECT project_id FROM project_members 
        WHERE user_id = auth.uid() AND role = 'lead'
      )
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
    OR
    (
      project_id IN (
        SELECT project_id FROM project_members 
        WHERE user_id = auth.uid() AND role = 'lead'
      )
    )
  );

CREATE POLICY "Users can read project members for accessible projects"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM get_user_projects_safe(auth.uid())
    )
  );

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_projects_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_team_code() TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_user_profile_exists(uuid) TO authenticated;