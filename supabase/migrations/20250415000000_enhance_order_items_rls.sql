
-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow select access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow insert access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow update access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow delete access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Garage staff can access their garage items" ON public.order_items;

-- Enable RLS on order_items table if not already enabled
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create a more specific policy for garage staff to view their installation requests
CREATE POLICY "Garage staff can view their installation requests"
ON public.order_items
FOR SELECT
USING (
  (garage_id IS NULL) OR  -- Allow access to items without a garage
  (garage_id IN (
    SELECT garage_id FROM profiles WHERE id = auth.uid() AND garage_id IS NOT NULL
  )) OR  -- Allow access to items for the user's garage
  (public.is_garage_staff(garage_id))  -- Use the security definer function
);

-- Create policy for insert access to order_items
CREATE POLICY "Allow insert access to order_items" 
ON public.order_items
FOR INSERT 
WITH CHECK (true);

-- Create policy for update access to order_items for garage staff
CREATE POLICY "Garage staff can update their installation requests"
ON public.order_items
FOR UPDATE
USING (
  (garage_id IN (
    SELECT garage_id FROM profiles WHERE id = auth.uid() AND garage_id IS NOT NULL
  )) OR  -- Allow updates to items for the user's garage
  (public.is_garage_staff(garage_id))  -- Use the security definer function
);

-- Create policy for delete access to order_items
CREATE POLICY "Allow delete access to order_items" 
ON public.order_items
FOR DELETE 
USING (true);

-- Verify security definer function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'is_garage_staff' AND prokind = 'f'
  ) THEN
    EXECUTE $FUNC$
    CREATE OR REPLACE FUNCTION public.is_garage_staff(garage_id UUID)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND profiles.garage_id = garage_id
      );
    END;
    $$;
    $FUNC$;
  END IF;
END $$;

-- Add a new diagnostic function to help debug RLS issues
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
  
  -- Get the user's garage_id from profiles
  SELECT garage_id INTO user_garage
  FROM profiles
  WHERE id = current_user_id;
  
  RETURN QUERY
  SELECT
    (user_garage = garage_id_param OR public.is_garage_staff(garage_id_param)) as has_access,
    current_user_id as user_id,
    user_garage as user_garage_id,
    (user_garage = garage_id_param) as request_matches;
END;
$$;

-- Ensure RLS is enabled on related tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;

-- Fix or recreate policies for related tables
DROP POLICY IF EXISTS "Allow select access to garages" ON public.garages;
CREATE POLICY "Allow select access to garages"
ON public.garages
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow select access to orders" ON public.orders;
CREATE POLICY "Allow select access to orders"
ON public.orders
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow select access to parts" ON public.parts;
CREATE POLICY "Allow select access to parts"
ON public.parts
FOR SELECT
USING (true);
