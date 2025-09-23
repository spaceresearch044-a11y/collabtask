/*
  # Create tasks table

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, nullable)
      - `status` (enum: todo|in_progress|review|completed, default todo)
      - `priority` (enum: low|medium|high|urgent, default medium)
      - `project_id` (uuid, references projects)
      - `assigned_to` (uuid, references profiles, nullable)
      - `created_by` (uuid, references auth.users)
      - `due_date` (timestamptz, nullable)
      - `position` (integer, default 0)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `tasks` table
    - Add policy for authenticated users to read all tasks
    - Add policy for authenticated users to create tasks
    - Add policy for task creators and assignees to update tasks
    - Add policy for task creators to delete tasks

  3. Functions
    - Use existing trigger to automatically update `updated_at` timestamp
*/

-- Create enums for task status and priority
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  due_date timestamptz,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Task creators and assignees can update tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Task creators can delete tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create trigger for tasks table
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_position_idx ON tasks(position);