/*
  # Fix reports RLS policies

  1. Changes
     - Add policy for users to insert their own reports
     - Add policy for users to upload files to storage
     - Ensure proper access to reports storage bucket
*/

-- Allow users to insert their own reports
CREATE POLICY "Users can insert own reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure storage policies allow users to upload their own files
CREATE POLICY "Users can upload own reports"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'reports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own reports
CREATE POLICY "Users can update own reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);