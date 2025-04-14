
CREATE OR REPLACE FUNCTION public.get_retailer_parts_for_garage(garage_id_param uuid)
RETURNS TABLE (
  part_id integer,
  part_name text,
  part_description text,
  part_price numeric,
  part_stock integer,
  part_image_url text,
  retailer_id uuid,
  retailer_name text,
  current_installation_fee numeric,
  is_associated boolean
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
    CASE WHEN pg.garage_id IS NOT NULL THEN true ELSE false END as is_associated
  FROM
    parts p
  JOIN
    retailers r ON p.retailer_id = r.id
  LEFT JOIN
    parts_garages pg ON p.id = pg.part_id AND pg.garage_id = garage_id_param
  WHERE
    p.source_type = 'retailer'
  ORDER BY
    p.name;
$$;
