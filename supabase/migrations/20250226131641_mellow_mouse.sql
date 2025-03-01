/*
  # Fix storage access for reports

  1. Storage Configuration
    - Create reports bucket if it doesn't exist
    - Enable RLS on the bucket
    - Add policies for authenticated access

  2. Security
    - Allow authenticated users to read their own reports
    - Allow service role full access for report management
*/

-- Create the reports bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies for the reports bucket
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