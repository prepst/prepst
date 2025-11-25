-- Add RLS policies for admin users to manage questions

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Check if role exists in user_metadata (this is where we store it)
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can update questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON public.questions;

-- Create policies for admin access to questions
CREATE POLICY "Admins can view all questions"
  ON public.questions
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update questions"
  ON public.questions
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can insert questions"
  ON public.questions
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete questions"
  ON public.questions
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Also add policies for topics table (for admin access)
DROP POLICY IF EXISTS "Admins can view all topics" ON public.topics;
DROP POLICY IF EXISTS "Admins can update topics" ON public.topics;

CREATE POLICY "Admins can view all topics"
  ON public.topics
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update topics"
  ON public.topics
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Grant necessary permissions
GRANT ALL ON public.questions TO authenticated;
GRANT ALL ON public.topics TO authenticated;