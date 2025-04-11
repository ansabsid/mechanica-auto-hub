
-- Create a secure RPC function for profile creation that bypasses RLS
CREATE OR REPLACE FUNCTION public.create_profile_for_user(
  user_id UUID,
  user_email TEXT,
  user_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- This makes it run with the privileges of the function creator
SET search_path = public
AS $$
BEGIN
  -- Check if profile already exists to avoid duplicate key errors
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id) THEN
    INSERT INTO profiles (id, email, role)
    VALUES (user_id, user_email, user_role);
  END IF;
END;
$$;

-- Grant execution privileges to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile_for_user TO authenticated;
