
-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow select access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow insert access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow update access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow delete access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Garage staff can access their garage items" ON public.order_items;

-- Enable RLS on order_items table if not already enabled
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to order_items
CREATE POLICY "Allow select access to order_items" 
ON public.order_items
FOR SELECT 
USING (true);

-- Create policy for insert access to order_items
CREATE POLICY "Allow insert access to order_items" 
ON public.order_items
FOR INSERT 
WITH CHECK (true);

-- Create policy for update access to order_items
CREATE POLICY "Allow update access to order_items" 
ON public.order_items
FOR UPDATE 
USING (true);

-- Create policy for delete access to order_items
CREATE POLICY "Allow delete access to order_items" 
ON public.order_items
FOR DELETE 
USING (true);

-- Create a security definer function to check if a user is associated with a garage
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

-- Ensure RLS is enabled on other relevant tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders table if they don't exist
DROP POLICY IF EXISTS "Allow select access to orders" ON public.orders;
CREATE POLICY "Allow select access to orders" 
ON public.orders
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow insert access to orders" ON public.orders;
CREATE POLICY "Allow insert access to orders" 
ON public.orders
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update access to orders" ON public.orders;
CREATE POLICY "Allow update access to orders" 
ON public.orders
FOR UPDATE 
USING (true);
