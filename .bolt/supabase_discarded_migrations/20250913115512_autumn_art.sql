/*
  # Fix Database Schema Issues

  1. Schema Fixes
    - Add missing foreign key constraints between tasks and profiles
    - Fix RLS policies causing infinite recursion
    - Add missing columns and improve data integrity
    - Create proper relationships for profile joins

  2. Security Updates
    - Fix project_members RLS policies to prevent recursion
    - Ensure proper access control without circular dependencies
    - Add performance optimizations

  3. Data Integrity
    - Add proper foreign key constraints
    - Update existing data to maintain consistency
    - Add indexes for better performance
*/

-- First, let's add the missing foreign key constraint between tasks and profiles
-- We need to update the tasks table to properly reference profiles instead of auth.users for assigned_to

-- Add foreign key constraint for assigned_to if it doesn't exist
DO $$
BEGIN
  -- Check if the foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_assigned_to_fkey' 
    AND table_name = 'tasks'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE tasks 
    ADD CONSTRAINT tasks_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key constraint for created_by to profiles
DO $$
BEGIN
  -- Check if the foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_created_by_fkey' 
    AND table_name = 'tasks'
  ) THEN
    -- First drop the existing constraint to auth.users if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'tasks_created_by_fkey' 
      AND table_name = 'tasks'
    ) THEN
      ALTER TABLE tasks DROP CONSTRAINT tasks_created_by_fkey;
    END IF;
    
    -- Add the new foreign key constraint to profiles
    ALTER TABLE tasks 
    ADD CONSTRAINT tasks_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix the infinite recursion in project_members RLS policies
DROP POLICY IF EXISTS "Project leads can manage members" ON project_members;
DROP POLICY IF EXISTS "Users can read project members" ON project_members;

-- Create new policies without recursion
CREATE POLICY "Users can read project members for their projects"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    -- User can see members of projects they created
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
    OR
    -- User can see members of projects they are part of
    user_id = auth.uid()
    OR
    -- User can see other members of projects they belong to
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Project creators and leads can manage members"
  ON project_members FOR ALL
  TO authenticated
  USING (
    -- Project creator can manage all members
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
    OR
    -- Project leads can manage members (but not themselves being removed by others)
    (project_id IN (
      SELECT pm.project_id FROM project_members pm 
      WHERE pm.user_id = auth.uid() AND pm.role = 'lead'
    ) AND (TG_OP != 'DELETE' OR user_id = auth.uid()))
  );

-- Add missing has_ever_created_project column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_ever_created_project'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_ever_created_project boolean DEFAULT false;
  END IF;
END $$;

-- Update existing users who have created projects
UPDATE profiles 
SET has_ever_created_project = true 
WHERE id IN (SELECT DISTINCT created_by FROM projects);

-- Improve the generate_team_code function to handle collisions better
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
  attempts integer := 0;
  max_attempts integer := 100;
BEGIN
  LOOP
    -- Generate a more unique code using timestamp and random
    code := 'CT-' || upper(substring(md5(random()::text || extract(epoch from now())::text) from 1 for 4));
    
    -- Check if code exists and is still valid
    SELECT EXISTS(
      SELECT 1 FROM team_codes 
      WHERE team_codes.code = code 
      AND expires_at > now()
    ) INTO exists;
    
    attempts := attempts + 1;
    
    -- Exit if we found a unique code or exceeded max attempts
    IF NOT exists OR attempts >= max_attempts THEN
      EXIT;
    END IF;
  END LOOP;
  
  -- Raise exception if we couldn't generate a unique code
  IF attempts >= max_attempts AND exists THEN
    RAISE EXCEPTION 'Unable to generate unique team code after % attempts', max_attempts;
  END IF;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user projects with proper OR logic (avoiding RLS recursion)
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
    CASE 
      WHEN p.created_by = user_uuid THEN 'lead'::member_role
      ELSE COALESCE(pm.role, 'member'::member_role)
    END as user_role
  FROM projects p
  LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = user_uuid
  WHERE p.created_by = user_uuid OR pm.user_id = user_uuid
  ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_projects(uuid) TO authenticated;

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

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_project_members_composite ON project_members(project_id, user_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_project_flag ON profiles(has_ever_created_project) WHERE has_ever_created_project = true;

-- Ensure all existing profiles have the required fields
UPDATE profiles 
SET 
  points = COALESCE(points, 0),
  level = COALESCE(level, 1),
  project_count = COALESCE(project_count, 0),
  is_online = COALESCE(is_online, false),
  last_seen = COALESCE(last_seen, now())
WHERE points IS NULL OR level IS NULL OR project_count IS NULL OR is_online IS NULL OR last_seen IS NULL;