
-- Create a function to get all retailers
CREATE OR REPLACE FUNCTION public.get_retailers()
RETURNS TABLE (
  id UUID,
  name TEXT,
  location TEXT,
  area TEXT
)
LANGUAGE sql
AS $$
  SELECT 
    id,
    name,
    location,
    area
  FROM 
    retailers
  ORDER BY 
    name;
$$;
