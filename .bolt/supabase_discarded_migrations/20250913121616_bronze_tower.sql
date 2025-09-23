/*
  # Fix User Profiles and Database Constraints

  1. Database Fixes
    - Create trigger to auto-insert user profiles on signup
    - Fix foreign key constraints for tasks table
    - Add proper RLS policies for user creation flow
    - Create function to handle user profile creation

  2. Security
    - Enable proper RLS policies for profiles table
    - Allow users to insert their own profile during signup
    - Maintain existing security while fixing constraints

  3. Data Integrity
    - Ensure all users have profiles
    - Fix task creation foreign key issues
    - Add proper error handling
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, points, level, project_count, is_online, has_ever_created_project)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'member',
    0,
    1,
    0,
    true,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix RLS policies for profiles table to allow signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;

-- Create proper RLS policies
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Fix tasks table foreign key constraint
-- First, update any existing tasks that might have invalid created_by references
UPDATE tasks 
SET created_by = (
  SELECT id FROM profiles WHERE id = tasks.created_by LIMIT 1
)
WHERE created_by NOT IN (SELECT id FROM profiles);

-- Ensure tasks.created_by references profiles.id correctly
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_created_by_fkey' 
    AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_created_by_fkey;
  END IF;
  
  -- Add proper foreign key constraint
  ALTER TABLE tasks 
  ADD CONSTRAINT tasks_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;

-- Fix assigned_to foreign key constraint
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_assigned_to_fkey' 
    AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_assigned_to_fkey;
  END IF;
  
  -- Add proper foreign key constraint
  ALTER TABLE tasks 
  ADD CONSTRAINT tasks_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL;
END $$;

-- Create function to ensure user profile exists before task creation
CREATE OR REPLACE FUNCTION ensure_user_profile_exists(user_id uuid)
RETURNS boolean AS $$
DECLARE
  profile_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Get user data from auth.users
    INSERT INTO profiles (id, email, full_name, role, points, level, project_count, is_online, has_ever_created_project)
    SELECT 
      u.id,
      u.email,
      COALESCE(u.raw_user_meta_data->>'full_name', ''),
      'member',
      0,
      1,
      0,
      true,
      false
    FROM auth.users u
    WHERE u.id = user_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_user_profile_exists(uuid) TO authenticated;

-- Update existing users who might not have profiles
INSERT INTO profiles (id, email, full_name, role, points, level, project_count, is_online, has_ever_created_project)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  'member',
  0,
  1,
  0,
  false,
  CASE WHEN EXISTS(SELECT 1 FROM projects WHERE created_by = u.id) THEN true ELSE false END
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;

-- Create function to get user projects with better error handling
CREATE OR REPLACE FUNCTION get_user_projects_safe(user_uuid uuid)
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
  -- Ensure user profile exists
  PERFORM ensure_user_profile_exists(user_uuid);
  
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_projects_safe(uuid) TO authenticated;