/*
  # Update storage policies for public access to reports

  1. Changes
    - Add policy to allow public access to reports bucket
    - This enables sharing reports with non-authenticated users
*/

-- Create policy to allow public access to reports
CREATE POLICY "Allow public access to reports"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'reports' AND public = true);

-- Update reports bucket to allow public access
UPDATE storage.buckets
SET public = true
WHERE id = 'reports';