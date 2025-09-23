/*
  # Fix missing columns and improve schema

  1. Schema Updates
    - Add missing 'deadline' column to projects table
    - Ensure all required columns exist
    - Add indexes for better performance

  2. Functions
    - Update generate_team_code function to be more robust
    - Add helper functions for user state tracking

  3. Security
    - Maintain existing RLS policies
    - Add performance optimizations
*/

-- Add missing deadline column to projects if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deadline') THEN
    ALTER TABLE projects ADD COLUMN deadline timestamptz;
  END IF;
END $$;

-- Add has_ever_created_project flag to profiles for better empty state logic
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'has_ever_created_project') THEN
    ALTER TABLE profiles ADD COLUMN has_ever_created_project boolean DEFAULT false;
  END IF;
END $$;

-- Update existing users who have created projects
UPDATE profiles 
SET has_ever_created_project = true 
WHERE id IN (
  SELECT DISTINCT created_by FROM projects
);

-- Create trigger to update has_ever_created_project flag
CREATE OR REPLACE FUNCTION update_user_project_flag()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET has_ever_created_project = true 
    WHERE id = NEW.created_by;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project creation
DROP TRIGGER IF EXISTS update_user_project_flag_trigger ON projects;
CREATE TRIGGER update_user_project_flag_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_user_project_flag();

-- Improve generate_team_code function
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
  attempts integer := 0;
BEGIN
  LOOP
    code := 'CT-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4));
    SELECT EXISTS(SELECT 1 FROM team_codes WHERE team_codes.code = code AND expires_at > now()) INTO exists;
    attempts := attempts + 1;
    
    IF NOT exists OR attempts > 100 THEN
      EXIT;
    END IF;
  END LOOP;
  
  IF attempts > 100 THEN
    RAISE EXCEPTION 'Unable to generate unique team code after 100 attempts';
  END IF;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_members_user_project ON project_members(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_team_codes_active ON team_codes(code) WHERE expires_at > now();

-- Function to get user projects with proper OR logic
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
  user_role member_role,
  team_code text
) AS $$
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
    COALESCE(pm.role, 'lead'::member_role) as user_role,
    tc.code as team_code
  FROM projects p
  LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = user_uuid
  LEFT JOIN team_codes tc ON p.id = tc.project_id AND tc.expires_at > now()
  WHERE p.created_by = user_uuid OR pm.user_id = user_uuid
  ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_projects(uuid) TO authenticated;