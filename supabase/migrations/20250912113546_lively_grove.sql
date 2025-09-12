/*
  # Fix profiles table RLS policies

  1. Security Updates
    - Drop existing conflicting policies on profiles table
    - Add proper policy for users to insert their own profile during signup
    - Add proper policy for users to read their own profile
    - Add proper policy for users to update their own profile
    - Keep policy for authenticated users to read all profiles (for team collaboration)

  2. Changes
    - Remove conflicting policies that may prevent signup
    - Ensure users can create their profile during the signup process
    - Maintain security while allowing proper functionality
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;

-- Create new policies with proper permissions
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);