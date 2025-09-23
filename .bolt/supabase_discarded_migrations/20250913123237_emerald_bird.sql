/*
  # Complete CollabTask Schema

  1. New Tables
    - `calendar_events` - Calendar events and deadlines
    - `meetings` - Meeting scheduling and management
    - `files` - File storage metadata
    - `reports` - Generated reports
    - `activity_logs` - User activity tracking

  2. Updates to existing tables
    - Add missing columns to existing tables
    - Improve relationships and constraints

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table
    - Role-based access control
*/

-- Create additional enum types
CREATE TYPE meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE report_type AS ENUM ('weekly', 'monthly', 'custom', 'project_summary');
CREATE TYPE activity_action AS ENUM ('created_project', 'updated_project', 'deleted_project', 'created_task', 'updated_task', 'completed_task', 'deleted_task', 'uploaded_file', 'scheduled_meeting', 'joined_meeting', 'created_event', 'generated_report');

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  all_day boolean DEFAULT false,
  event_type text DEFAULT 'custom',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  duration integer DEFAULT 60, -- minutes
  status meeting_status DEFAULT 'scheduled',
  meeting_url text,
  participants jsonb DEFAULT '[]',
  notes text,
  recording_url text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  version integer DEFAULT 1,
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  generated_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type report_type NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  file_url text,
  date_range_start timestamptz,
  date_range_end timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  action activity_action NOT NULL,
  target_id uuid,
  target_type text,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add missing columns to existing tables
DO $$
BEGIN
  -- Add team_code to projects if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'team_code') THEN
    ALTER TABLE projects ADD COLUMN team_code text;
  END IF;
  
  -- Add project_type to projects if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_type') THEN
    ALTER TABLE projects ADD COLUMN project_type text DEFAULT 'individual';
  END IF;
  
  -- Add online status tracking to profiles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_online') THEN
    ALTER TABLE profiles ADD COLUMN is_online boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_seen') THEN
    ALTER TABLE profiles ADD COLUMN last_seen timestamptz DEFAULT now();
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar_events
CREATE POLICY "Users can manage their calendar events"
  ON calendar_events FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view project calendar events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

-- Create policies for meetings
CREATE POLICY "Users can view project meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Meeting creators can update meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Create policies for files
CREATE POLICY "Users can view project files"
  ON files FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
    OR user_id = auth.uid()
    OR is_public = true
  );

CREATE POLICY "Users can upload files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "File owners can manage files"
  ON files FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for reports
CREATE POLICY "Users can view project reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
    OR generated_by = auth.uid()
  );

CREATE POLICY "Users can generate reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (generated_by = auth.uid());

-- Create policies for activity_logs
CREATE POLICY "Users can view project activity"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can create activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_project_id ON calendar_events(project_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);

CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);

CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_task_id ON files(task_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);

CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id uuid,
  p_action activity_action,
  p_description text,
  p_project_id uuid DEFAULT NULL,
  p_task_id uuid DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_target_type text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_logs (
    user_id,
    project_id,
    task_id,
    action,
    target_id,
    target_type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_project_id,
    p_task_id,
    p_action,
    p_target_id,
    p_target_type,
    p_description,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION log_activity(uuid, activity_action, text, uuid, uuid, uuid, text, jsonb) TO authenticated;

-- Function to update user online status
CREATE OR REPLACE FUNCTION update_user_online_status(user_id uuid, is_online boolean)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    is_online = update_user_online_status.is_online,
    last_seen = CASE WHEN update_user_online_status.is_online = false THEN now() ELSE last_seen END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_user_online_status(uuid, boolean) TO authenticated;