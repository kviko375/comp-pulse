/*
  # Add public_url to reports table

  1. Changes
    - Add `public_url` column to the `reports` table to store shareable links
*/

-- Add public_url column to reports table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'public_url'
  ) THEN
    ALTER TABLE reports ADD COLUMN public_url text;
  END IF;
END $$;