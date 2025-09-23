/*
  # Fix Tasks and Teams RLS Policies

  1. Security Updates
    - Fix RLS policies for tasks table to prevent unauthorized access
    - Add proper team member access policies
    - Optimize queries to prevent recursion
    - Add missing indexes for performance

  2. Team Management
    - Add team code generation function
    - Fix project member policies
    - Add team leave functionality

  3. Task Management
    - Optimize task queries for real-time updates
    - Add proper task assignment policies
    - Fix task status update permissions
*/

-- Ensure the generate_team_code function exists and works properly
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate a 6-character code with format CT-XXXX
    code := 'CT-' || upper(substring(md5(random()::text) from 1 for 4));
    
    -- Check if code already exists and is not expired
    SELECT EXISTS(
      SELECT 1 FROM team_codes 
      WHERE team_codes.code = code 
      AND expires_at > now()
    ) INTO exists_check;
    
    -- If code doesn't exist or is expired, we can use it
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Create function to get user's accessible projects safely
CREATE OR REPLACE FUNCTION get_user_projects_safe(user_id uuid)
RETURNS TABLE(project_id uuid)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Projects created by user
  SELECT id as project_id FROM projects WHERE created_by = user_id
  UNION
  -- Projects user is a member of
  SELECT pm.project_id FROM project_members pm WHERE pm.user_id = user_id;
$$;

-- Update tasks RLS policies to be more efficient
DROP POLICY IF EXISTS "Authenticated users can read all tasks" ON tasks;
DROP POLICY IF EXISTS "Task creators and assignees can update tasks" ON tasks;

-- More efficient task read policy
CREATE POLICY "Users can read tasks from accessible projects"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM get_user_projects_safe(auth.uid())
    )
  );

-- More efficient task update policy
CREATE POLICY "Task creators and assignees can update tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    project_id IN (
      SELECT p.id FROM projects p WHERE p.created_by = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    project_id IN (
      SELECT p.id FROM projects p WHERE p.created_by = auth.uid()
    )
  );

-- Update project members policies to prevent recursion
DROP POLICY IF EXISTS "Users can read project members for accessible projects" ON project_members;

CREATE POLICY "Users can read project members for their projects"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM get_user_projects_safe(auth.uid())
    )
  );

-- Add policy for users to leave teams
CREATE POLICY "Users can leave teams"
  ON project_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_assigned 
  ON tasks(project_id, assigned_to) 
  WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_status_priority 
  ON tasks(status, priority);

CREATE INDEX IF NOT EXISTS idx_project_members_role 
  ON project_members(project_id, role);

CREATE INDEX IF NOT EXISTS idx_team_codes_active 
  ON team_codes(code, expires_at) 
  WHERE expires_at > now();

-- Function to ensure user profile exists (called from auth hook)
CREATE OR REPLACE FUNCTION ensure_user_profile_exists(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  SELECT 
    user_id,
    COALESCE(auth.email(), 'unknown@example.com'),
    COALESCE(auth.raw_user_meta_data()->>'full_name', 'User')
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id
  );
END;
$$;

-- Add RLS policy for calendar events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendar events"
  ON calendar_events
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read project calendar events"
  ON calendar_events
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM get_user_projects_safe(auth.uid())
    )
  );

-- Add RLS policies for meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own meetings"
  ON meetings
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can read project meetings"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM get_user_projects_safe(auth.uid())
    )
  );

-- Add RLS policies for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reports"
  ON reports
  FOR ALL
  TO authenticated
  USING (generated_by = auth.uid())
  WITH CHECK (generated_by = auth.uid());

-- Add RLS policies for achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);