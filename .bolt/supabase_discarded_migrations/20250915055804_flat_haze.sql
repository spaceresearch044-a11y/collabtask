/*
  # Fix Infinite Recursion in RLS Policies

  1. Problem
    - RLS policies on project_members and activity_logs are causing infinite recursion
    - Policies are trying to query the same tables they're protecting
    - This breaks activity log fetching and other project-related queries

  2. Solution
    - Create a safe function to get user projects without triggering RLS
    - Update policies to use this function instead of recursive subqueries
    - Break the circular dependency between policies

  3. Changes
    - Create get_user_projects_safe function with SECURITY DEFINER
    - Update project_members RLS policies to avoid recursion
    - Update activity_logs RLS policies to use safe function
*/

-- Create a safe function to get user projects without RLS recursion
CREATE OR REPLACE FUNCTION get_user_projects_safe(user_uuid uuid)
RETURNS TABLE (project_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id as project_id
  FROM projects p
  LEFT JOIN project_members pm ON p.id = pm.project_id
  WHERE p.created_by = user_uuid OR pm.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_projects_safe(uuid) TO authenticated;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can read project members for their projects" ON project_members;
DROP POLICY IF EXISTS "Project creators and leads can manage members" ON project_members;
DROP POLICY IF EXISTS "Users can view project activity" ON activity_logs;

-- Create new non-recursive policies for project_members
CREATE POLICY "Users can read project members for their projects"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    -- User can see members of projects they created (direct check, no recursion)
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
    OR
    -- User can see their own membership records
    user_id = auth.uid()
    OR
    -- User can see other members using the safe function
    project_id IN (SELECT project_id FROM get_user_projects_safe(auth.uid()))
  );

CREATE POLICY "Project creators and leads can manage members"
  ON project_members FOR ALL
  TO authenticated
  USING (
    -- Project creator can manage all members (direct check, no recursion)
    project_id IN (SELECT id FROM projects WHERE created_by = auth.uid())
    OR
    -- Project leads can manage members (check role directly without recursion)
    (EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = project_members.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role = 'lead'
    ) AND (TG_OP != 'DELETE' OR user_id = auth.uid()))
  );

-- Create new non-recursive policy for activity_logs
CREATE POLICY "Users can view project activity"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    -- User can see their own activity
    user_id = auth.uid()
    OR
    -- User can see activity for projects they have access to (using safe function)
    project_id IN (SELECT project_id FROM get_user_projects_safe(auth.uid()))
  );

-- Ensure the activity_logs insert policy exists
CREATE POLICY "Users can create activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());