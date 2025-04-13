
-- This migration fixes the ambiguous column reference issue in the is_garage_staff function
-- by explicitly qualifying all column references with their table names

-- Update is_garage_staff function to use explicit table qualification
CREATE OR REPLACE FUNCTION public.is_garage_staff(garage_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.garage_id = garage_id_param
  );
END;
$$;

-- Update debug_rls_access function to use explicit table qualification
CREATE OR REPLACE FUNCTION public.debug_rls_access(garage_id_param UUID)
RETURNS TABLE(
  has_access BOOLEAN,
  user_id UUID,
  user_garage_id UUID,
  request_matches BOOLEAN,
  rlsStatus TEXT,
  hasGarageAccess BOOLEAN,
  rlsError TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  user_garage UUID;
  is_staff BOOLEAN;
  error_message TEXT;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- Get the user's garage_id from profiles with explicit table reference
  SELECT profiles.garage_id INTO user_garage
  FROM profiles
  WHERE profiles.id = current_user_id;
  
  -- Check if user is garage staff
  BEGIN
    SELECT public.is_garage_staff(garage_id_param) INTO is_staff;
    error_message := NULL;
  EXCEPTION WHEN OTHERS THEN
    is_staff := FALSE;
    error_message := SQLERRM;
  END;
  
  RETURN QUERY
  SELECT
    (user_garage = garage_id_param OR is_staff) as has_access,
    current_user_id as user_id,
    user_garage as user_garage_id,
    (user_garage = garage_id_param) as request_matches,
    CASE 
      WHEN error_message IS NOT NULL THEN 'Error'
      WHEN user_garage = garage_id_param THEN 'Direct access'
      WHEN is_staff THEN 'Staff access'
      ELSE 'No access'
    END as rlsStatus,
    is_staff as hasGarageAccess,
    error_message as rlsError;
END;
$$;

-- Update has_installation_request_access function if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'has_installation_request_access' AND prokind = 'f'
  ) THEN
    EXECUTE $FUNC$
    CREATE OR REPLACE FUNCTION public.has_installation_request_access(request_garage_id uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    DECLARE
        user_garage UUID;
    BEGIN
        -- Get the current user's garage_id with explicit table reference
        SELECT profiles.garage_id INTO user_garage
        FROM profiles
        WHERE profiles.id = auth.uid();
        
        -- Return true if the user is associated with the request's garage or is garage staff
        RETURN (user_garage = request_garage_id) OR public.is_garage_staff(request_garage_id);
    END;
    $$;
    $FUNC$;
  END IF;
END $$;
