/*
  # Fix reports RLS policies

  1. Changes
     - Add policy for users to insert their own reports
     - Add policy for users to upload files to storage
     - Ensure proper access to reports storage bucket
     - Add policy for users to update their own reports
*/

-- Allow users to insert their own reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reports' AND policyname = 'Users can insert own reports'
  ) THEN
    CREATE POLICY "Users can insert own reports"
      ON reports
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Ensure storage policies allow users to upload their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND policyname = 'Users can upload own reports'
  ) THEN
    CREATE POLICY "Users can upload own reports"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'reports'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END
$$;

-- Allow users to update their own reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reports' AND policyname = 'Users can update own reports'
  ) THEN
    CREATE POLICY "Users can update own reports"
      ON reports
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Make the reports bucket public for authenticated users
DO $$
BEGIN
  UPDATE storage.buckets
  SET public = true
  WHERE id = 'reports'
  AND NOT public;
END
$$;