
-- First, make sure we can view all order items for a specific garage
-- by improving our RLS policies

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow select access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Garage staff can view their installation requests" ON public.order_items;

-- Create a new more specific policy for select access
CREATE POLICY "Allow select access to specific garage items" 
ON public.order_items
FOR SELECT 
USING (
  (garage_id IS NULL) OR  -- Allow access to items without a garage
  (garage_id = ANY(
    SELECT g.id FROM garages g
    JOIN profiles p ON p.garage_id = g.id
    WHERE p.id = auth.uid()
  ))
);

-- Create a temporary view to help debug installation requests
CREATE OR REPLACE VIEW public.debug_installation_requests AS
SELECT 
  oi.id as order_item_id,
  oi.order_id,
  oi.garage_id,
  oi.part_id,
  oi.installation_status,
  oi.installation_fee,
  oi.scheduled_date,
  oi.scheduled_time,
  g.name as garage_name,
  p.name as part_name,
  o.user_id,
  o.user_name,
  o.user_email,
  o.user_phone
FROM 
  public.order_items oi
LEFT JOIN 
  public.garages g ON oi.garage_id = g.id
LEFT JOIN 
  public.parts p ON oi.part_id = p.id
LEFT JOIN 
  public.orders o ON oi.order_id = o.id
WHERE
  oi.installation_status IS NOT NULL;

-- Create a debug function to check access to a specific garage's installation requests
CREATE OR REPLACE FUNCTION public.debug_garage_installation_requests(garage_id_param UUID)
RETURNS TABLE (
  order_item_id UUID,
  garage_id UUID,
  garage_name TEXT,
  installation_status TEXT,
  user_has_access BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  user_garage_id UUID;
BEGIN
  -- Get current user info
  user_id := auth.uid();
  
  -- Get user's garage
  SELECT profiles.garage_id INTO user_garage_id
  FROM profiles
  WHERE profiles.id = user_id;
  
  RETURN QUERY
  SELECT 
    oi.id as order_item_id,
    oi.garage_id,
    g.name as garage_name,
    oi.installation_status,
    (user_garage_id = oi.garage_id OR public.is_garage_staff(oi.garage_id)) as user_has_access
  FROM 
    public.order_items oi
  LEFT JOIN 
    public.garages g ON oi.garage_id = g.id
  WHERE 
    oi.garage_id = garage_id_param
    AND oi.installation_status IS NOT NULL;
END;
$$;
