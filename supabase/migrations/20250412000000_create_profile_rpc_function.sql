
-- This function creates a user profile with specified role and email
-- It's designed to be called when a new user account is created
-- Uses SECURITY DEFINER to bypass Row Level Security (RLS) policies
-- Parameters:
--   user_id: UUID of the user to create a profile for
--   user_email: Email address of the user
--   user_role: Role to assign to the user (e.g., 'customer', 'garage')
-- Returns:
--   VOID (no return value)

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
