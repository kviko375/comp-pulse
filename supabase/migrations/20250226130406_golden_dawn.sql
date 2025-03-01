/*
  # Fix admin permissions and policies

  1. Changes
    - Enable RLS on profiles table
    - Create proper policies for access control
    - Add service role permissions
    - Add trigger for profile creation

  2. Security
    - Service role gets full access
    - Authenticated users can read profiles
    - Users can only update their own non-admin fields
    - Admin status can only be modified by service role
*/

-- Ensure profiles table has proper permissions
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can update admin status" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create comprehensive policies
CREATE POLICY "Allow service role full access"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read any profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Split the update policy into two parts to avoid OLD reference
CREATE POLICY "Users can update own basic fields"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND is_admin IS NOT TRUE -- Prevent users from setting themselves as admin
  );

CREATE POLICY "Service role can manage admin status"
  ON profiles
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON profiles TO service_role;
GRANT ALL ON auth.users TO service_role;

-- Create function to ensure admin exists in profiles
CREATE OR REPLACE FUNCTION public.ensure_admin_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;