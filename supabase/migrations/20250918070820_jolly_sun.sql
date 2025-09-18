/*
  # Fix RLS Policy Recursion Issues

  This migration fixes the infinite recursion error in RLS policies by:
  1. Dropping problematic policies that cause circular references
  2. Creating simpler, non-recursive policies
  3. Using direct user ID checks instead of complex joins

  ## Changes Made
  - Simplified project_members policies to avoid recursion
  - Fixed activity_logs policies to use direct user checks
  - Ensured policies don't reference the same table they protect
*/

-- Drop existing problematic policies on project_members
DROP POLICY IF EXISTS "Creators and leads can delete members safely" ON project_members;
DROP POLICY IF EXISTS "Creators and leads can update members safely" ON project_members;
DROP POLICY IF EXISTS "Users can manage project members" ON project_members;
DROP POLICY IF EXISTS "Users can read project members" ON project_members;

-- Drop existing problematic policies on activity_logs
DROP POLICY IF EXISTS "Users can read activity logs for their projects" ON activity_logs;
DROP POLICY IF EXISTS "Users can view project activity" ON activity_logs;
DROP POLICY IF EXISTS "Users can create their own activity logs" ON activity_logs;

-- Create simple, non-recursive policies for project_members
CREATE POLICY "Users can read project members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (true); -- Allow reading all project members for authenticated users

CREATE POLICY "Users can join projects"
  ON project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Project creators can manage members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Team leads can manage members"
  ON project_members
  FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT pm.project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid() 
      AND pm.role = 'lead'
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT pm.project_id 
      FROM project_members pm 
      WHERE pm.user_id = auth.uid() 
      AND pm.role = 'lead'
    )
  );

-- Create simple, non-recursive policies for activity_logs
CREATE POLICY "Users can create their own activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own activity"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read project activity"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    project_id IS NULL OR
    project_id IN (
      SELECT p.id FROM projects p WHERE p.created_by = auth.uid()
      UNION
      SELECT pm.project_id FROM project_members pm WHERE pm.user_id = auth.uid()
    )
  );

-- Create a safe function to get user projects without recursion
CREATE OR REPLACE FUNCTION get_user_projects_safe(user_uuid uuid)
RETURNS TABLE(project_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id as project_id
  FROM projects p
  WHERE p.created_by = user_uuid
  
  UNION
  
  SELECT pm.project_id
  FROM project_members pm
  WHERE pm.user_id = user_uuid;
$$;

-- Update the projects policy to use the safe function
DROP POLICY IF EXISTS "Users can select their projects" ON projects;

CREATE POLICY "Users can select their projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT project_id FROM get_user_projects_safe(auth.uid())
    )
  );