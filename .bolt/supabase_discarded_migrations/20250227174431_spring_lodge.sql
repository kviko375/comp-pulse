/*
  # Fix storage policies for public access to reports

  1. Changes
    - Ensure the reports bucket is set to public
    - Create policy to allow public access to reports if it doesn't exist
    - This enables sharing reports with non-authenticated users
*/

-- Make sure the reports bucket exists and is public
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'reports') THEN
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'reports';
  ELSE
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('reports', 'reports', true);
  END IF;
END $$;

-- Drop the policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow public access to reports" ON storage.objects;

-- Create policy to allow public access to reports
CREATE POLICY "Allow public access to reports"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'reports');

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;