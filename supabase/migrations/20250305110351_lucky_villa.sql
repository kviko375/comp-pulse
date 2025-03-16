/*
  # Fix public reports storage policies

  1. Changes
    - Add storage policies for public reports folder
    - Allow authenticated users to upload to public folder
    - Allow public access to public folder
    - Allow users to update reports table with public_url

  2. Security
    - Maintain RLS for private reports
    - Only allow access to public reports through specific paths
*/

-- Allow users to upload to the public folder
CREATE POLICY "Users can upload public reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports'
  AND (storage.foldername(name))[1] = 'public'
);

-- Allow public access to public reports
CREATE POLICY "Anyone can read public reports"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'reports'
  AND (storage.foldername(name))[1] = 'public'
);

-- Allow users to update their reports with public_url
CREATE POLICY "Users can update own reports with public_url"
ON reports
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);