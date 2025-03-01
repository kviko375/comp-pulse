/*
  # Add reports table and storage configuration

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `storage_path` (text)
      - `created_at` (timestamp)
      - `report_date` (date)

  2. Security
    - Enable RLS on `reports` table
    - Add policies for authenticated users to read their own reports
    - Add policy for service role to insert reports
*/

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  storage_path text NOT NULL,
  report_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, report_date)
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert reports
CREATE POLICY "Service role can insert reports"
  ON reports
  FOR INSERT
  TO service_role
  WITH CHECK (true);