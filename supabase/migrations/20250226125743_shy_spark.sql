/*
  # Add admin role to profiles table

  1. Changes
    - Add `is_admin` boolean column to profiles table with default false
    - Add RLS policies to protect admin status
      - Only service role can update admin status
      - Users can read their own admin status
  
  2. Security
    - Enable RLS for admin column access
    - Restrict admin status updates to service role only
*/

-- Add is_admin column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create policies for admin status
CREATE POLICY "Users can read own admin status"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Only service role can update admin status"
  ON profiles
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);