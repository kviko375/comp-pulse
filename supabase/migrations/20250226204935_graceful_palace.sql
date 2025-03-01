/*
  # Add notification tracking to reports table

  1. Changes
    - Add `notified` column to `reports` table to track if users have been notified about new reports
*/

-- Add notified column to reports table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'notified'
  ) THEN
    ALTER TABLE reports ADD COLUMN notified boolean DEFAULT false;
  END IF;
END $$;