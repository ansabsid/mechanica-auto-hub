
-- Drop existing problematic functions
DROP FUNCTION IF EXISTS public.is_garage_staff(uuid);
DROP FUNCTION IF EXISTS public.debug_rls_access(uuid);

-- Create a properly qualified is_garage_staff function
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

-- Create an enhanced debug function that avoids ambiguous column references
CREATE OR REPLACE FUNCTION public.debug_rls_access(garage_id_param UUID)
RETURNS TABLE(
  has_access BOOLEAN,
  user_id UUID,
  user_garage_id UUID,
  request_matches BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  user_garage UUID;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- Get the user's garage_id from profiles with explicit reference
  SELECT profiles.garage_id INTO user_garage
  FROM profiles
  WHERE profiles.id = current_user_id;
  
  RETURN QUERY
  SELECT
    (user_garage = garage_id_param OR public.is_garage_staff(garage_id_param)) as has_access,
    current_user_id as user_id,
    user_garage as user_garage_id,
    (user_garage = garage_id_param) as request_matches;
END;
$$;

-- Drop existing policies that might be conflicting or using ambiguous references
DROP POLICY IF EXISTS "Garage staff can view their installation requests" ON public.order_items;
DROP POLICY IF EXISTS "Garage staff can update their installation requests" ON public.order_items;

-- Create a more specific policy for garage staff to view their installation requests
-- with explicit table qualification
CREATE POLICY "Garage staff can view their installation requests"
ON public.order_items
FOR SELECT
USING (
  (order_items.garage_id IS NULL) OR  -- Allow access to items without a garage
  (order_items.garage_id IN (
    SELECT profiles.garage_id FROM profiles WHERE profiles.id = auth.uid() AND profiles.garage_id IS NOT NULL
  )) OR  -- Allow access to items for the user's garage
  (public.is_garage_staff(order_items.garage_id))  -- Use the security definer function
);

-- Create policy for update access to order_items for garage staff
-- with explicit table qualification
CREATE POLICY "Garage staff can update their installation requests"
ON public.order_items
FOR UPDATE
USING (
  (order_items.garage_id IN (
    SELECT profiles.garage_id FROM profiles WHERE profiles.id = auth.uid() AND profiles.garage_id IS NOT NULL
  )) OR  -- Allow updates to items for the user's garage
  (public.is_garage_staff(order_items.garage_id))  -- Use the security definer function
);
