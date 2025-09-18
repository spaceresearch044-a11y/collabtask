/*
  # Fix Activity Logs Foreign Key Relationship

  This migration fixes the missing foreign key relationship between activity_logs and profiles tables.

  ## Problem
  - Supabase queries fail with "Could not find a relationship" error
  - Missing foreign key prevents join alias resolution: user_profile:profiles!activity_logs_user_id_fkey(...)

  ## Changes
  1. Drop existing foreign key constraint if it exists
  2. Add proper foreign key constraint with exact name "activity_logs_user_id_fkey"
  3. Enable cascade delete to maintain data integrity

  ## Security
  - Maintains existing RLS policies
  - Ensures referential integrity between users and their activity logs
*/

-- Step 1: Drop existing foreign key constraint if it exists
ALTER TABLE IF EXISTS activity_logs
DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;

-- Step 2: Drop any other user_id foreign key constraints that might exist
ALTER TABLE IF EXISTS activity_logs
DROP CONSTRAINT IF EXISTS fk_activity_user;

-- Step 3: Add the correct foreign key constraint with the exact name Supabase expects
ALTER TABLE activity_logs
ADD CONSTRAINT activity_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id 
ON activity_logs(user_id);

-- Step 5: Verify the constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'activity_logs_user_id_fkey'
    AND table_name = 'activity_logs'
  ) THEN
    RAISE EXCEPTION 'Foreign key constraint activity_logs_user_id_fkey was not created successfully';
  END IF;
END $$;