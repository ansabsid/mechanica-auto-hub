
-- Function to get retailer parts that a garage can offer installation for
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
  installation_fee NUMERIC,
  is_associated BOOLEAN
) LANGUAGE SQL AS $$
  WITH garage_parts AS (
    SELECT 
      pg.part_id, 
      pg.installation_fee,
      TRUE as is_associated
    FROM 
      parts_garages pg
    WHERE 
      pg.garage_id = garage_id_param
  )
  SELECT 
    p.id as part_id,
    p.name as part_name,
    p.description as part_description,
    p.price as part_price,
    p.stock as part_stock,
    p.image_url as part_image_url,
    p.retailer_id,
    r.name as retailer_name,
    COALESCE(gp.installation_fee, 0) as installation_fee,
    COALESCE(gp.is_associated, FALSE) as is_associated
  FROM 
    parts p
  JOIN 
    retailers r ON p.retailer_id = r.id
  LEFT JOIN 
    garage_parts gp ON p.id = gp.part_id
  WHERE 
    p.source_type = 'retailer'
  ORDER BY 
    p.name;
$$;
