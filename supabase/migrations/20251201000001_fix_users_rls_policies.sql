-- Fix RLS policies for users table to work with custom authentication
-- The system uses custom auth, not Supabase Auth, so we need permissive policies for anon role

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Create permissive policies for anon role (used by custom auth)
CREATE POLICY "Allow anon to select users for login"
ON public.users
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anon to update users"
ON public.users
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anon to insert users"
ON public.users
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated role as well for admin operations
CREATE POLICY "Allow authenticated to manage users"
ON public.users
FOR ALL
TO authenticated
USING (true);