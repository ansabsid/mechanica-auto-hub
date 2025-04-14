
-- Create a function to get all retailer parts that a garage can associate with
CREATE OR REPLACE FUNCTION public.get_retailer_parts_for_garage(garage_id_param UUID)
RETURNS TABLE (
  part_id INTEGER,
  part_name TEXT,
  part_description TEXT,
  part_price NUMERIC,
  part_stock INTEGER,
  part_image_url TEXT,
  retailer_id UUID,
  retailer_name TEXT,
  current_installation_fee NUMERIC,
  is_associated BOOLEAN
)
LANGUAGE sql
AS $$
  SELECT 
    p.id as part_id,
    p.name as part_name,
    p.description as part_description,
    p.price as part_price,
    p.stock as part_stock,
    p.image_url as part_image_url,
    p.retailer_id,
    r.name as retailer_name,
    COALESCE(pg.installation_fee, 0) as current_installation_fee,
    CASE WHEN pg.part_id IS NULL THEN FALSE ELSE TRUE END as is_associated
  FROM 
    parts p
  JOIN 
    retailers r ON p.retailer_id = r.id
  LEFT JOIN 
    parts_garages pg ON p.id = pg.part_id AND pg.garage_id = garage_id_param
  WHERE 
    p.source_type = 'retailer';
$$;
