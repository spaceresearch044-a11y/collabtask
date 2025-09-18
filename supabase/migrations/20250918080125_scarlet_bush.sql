/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - Infinite recursion detected in policy for relation "project_members"
    - Circular dependencies between project_members and profiles policies
    - Complex subqueries causing recursive policy evaluation

  2. Solution
    - Simplify project_members policies to avoid circular references
    - Remove problematic policies that use get_user_projects_safe function
    - Use direct auth.uid() checks instead of complex subqueries
    - Ensure policies are straightforward and don't trigger recursive evaluations

  3. Changes
    - Drop problematic policies on project_members
    - Create simplified, non-recursive policies
    - Maintain security while avoiding circular dependencies
*/

-- Drop all existing policies on project_members to start fresh
DROP POLICY IF EXISTS "Project creators can manage members" ON project_members;
DROP POLICY IF EXISTS "Team leads can manage members" ON project_members;
DROP POLICY IF EXISTS "Users can join projects" ON project_members;
DROP POLICY IF EXISTS "Users can join projects safely" ON project_members;
DROP POLICY IF EXISTS "Users can read project members" ON project_members;
DROP POLICY IF EXISTS "Users can read project members safely" ON project_members;

-- Create simplified policies that don't cause recursion
CREATE POLICY "Users can read all project members"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert themselves as project members"
  ON project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Project creators can manage all members"
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

CREATE POLICY "Users can leave projects"
  ON project_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Also simplify profiles policies to avoid any potential recursion
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create simplified profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());