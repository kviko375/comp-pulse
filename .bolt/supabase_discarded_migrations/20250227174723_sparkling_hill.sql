/*
  # Fix storage bucket for report sharing

  1. Changes
    - Ensure the reports bucket exists and is properly configured
    - Create policy to allow public access to reports
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

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public access to reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read own reports" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage all reports" ON storage.objects;

-- Create policies with proper permissions
CREATE POLICY "Authenticated users can read own reports"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Service role can manage all reports"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'reports')
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Public can access reports"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'reports');

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;