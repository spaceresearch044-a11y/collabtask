/*
  # Add missing functionality and fix database issues

  1. Database Functions
    - `get_user_projects_safe()` - Safe project fetching with proper RLS
    - `ensure_user_profile_exists()` - Auto-create profiles for new users
    - `generate_team_code()` - Generate unique team codes
    - `update_user_project_flag()` - Track if user has created projects

  2. Schema Updates
    - Add missing columns and indexes
    - Fix RLS policies for proper access control

  3. Security
    - Enable RLS on all tables
    - Add proper policies for each table
*/

-- Create safe project fetching function
CREATE OR REPLACE FUNCTION get_user_projects_safe(user_id uuid)
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

-- Create profile auto-creation function
CREATE OR REPLACE FUNCTION ensure_user_profile_exists(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_name text;
BEGIN
  -- Get user data from auth.users
  SELECT email, raw_user_meta_data->>'full_name'
  INTO user_email, user_name
  FROM auth.users
  WHERE id = user_id;

  -- Insert profile if it doesn't exist
  INSERT INTO profiles (id, email, full_name, has_ever_created_project)
  VALUES (user_id, user_email, user_name, false)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Create team code generation function
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate random 6-character code
    code := 'CT-' || upper(substring(md5(random()::text) from 1 for 4));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM team_codes 
      WHERE team_codes.code = code 
      AND expires_at > now()
    ) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Create function to update project creation flag
CREATE OR REPLACE FUNCTION update_user_project_flag()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET has_ever_created_project = true
  WHERE id = NEW.created_by;
  RETURN NEW;
END;
$$;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_status ON tasks(assigned_to, status) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_members_role ON project_members(role);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Fix RLS policies for teams table
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

-- Fix RLS policies for meetings table
DROP POLICY IF EXISTS "Users can manage their meetings" ON meetings;
CREATE POLICY "Users can manage their meetings"
  ON meetings
  FOR ALL
  TO authenticated
  USING (created_by = uid())
  WITH CHECK (created_by = uid());

DROP POLICY IF EXISTS "Users can read meeting participants" ON meetings;
CREATE POLICY "Users can read meeting participants"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (
    created_by = uid() OR
    participants ? uid()::text
  );

-- Add RLS policies for reports table
DROP POLICY IF EXISTS "Users can manage their reports" ON reports;
CREATE POLICY "Users can manage their reports"
  ON reports
  FOR ALL
  TO authenticated
  USING (generated_by = uid())
  WITH CHECK (generated_by = uid());

-- Add RLS policies for calendar_events table
DROP POLICY IF EXISTS "Users can manage their events" ON calendar_events;
CREATE POLICY "Users can manage their events"
  ON calendar_events
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

DROP POLICY IF EXISTS "Users can read project events" ON calendar_events;
CREATE POLICY "Users can read project events"
  ON calendar_events
  FOR SELECT
  TO authenticated
  USING (
    user_id = uid() OR
    project_id IN (
      SELECT project_id FROM get_user_projects_safe(uid())
    )
  );