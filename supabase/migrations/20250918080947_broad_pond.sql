/*
  # Add Team Management Tables

  1. New Tables
    - `teams` - Team information and codes
    - `team_members` - Team membership with roles
    - `notifications` - User notifications system
    - `achievements` - User achievements and badges

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for team management
    - Ensure proper role-based access control

  3. Functions
    - Team code generation
    - Notification triggers
    - Achievement tracking
*/

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('admin', 'lead', 'member')) DEFAULT 'member',
  invited_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  badge_url text,
  points_awarded integer DEFAULT 0,
  awarded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can read teams they belong to"
  ON teams FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team creators can update their teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team creators can delete their teams"
  ON teams FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Team members policies
CREATE POLICY "Users can read team members for their teams"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams 
      WHERE created_by = auth.uid()
    ) OR
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams 
      WHERE created_by = auth.uid()
    ) OR
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'lead')
    )
  );

-- Notifications policies
CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Achievements policies
CREATE POLICY "Users can read their own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(code);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- Update triggers
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Generate team code function
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate a 6-character code
    code := 'TM-' || upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM teams WHERE teams.code = code) INTO exists;
    
    -- If code doesn't exist, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;