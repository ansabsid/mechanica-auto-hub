
CREATE OR REPLACE FUNCTION get_garages_for_part_bulk(part_ids INT[])
RETURNS TABLE (
  part_id INT,
  id UUID, 
  name TEXT, 
  location TEXT, 
  installation_fee NUMERIC
) 
LANGUAGE SQL
AS $$
  SELECT 
    pg.part_id,
    g.id, 
    g.name, 
    g.location, 
    pg.installation_fee
  FROM 
    parts_garages pg
  JOIN 
    garages g ON pg.garage_id = g.id
  WHERE 
    pg.part_id = ANY(part_ids);
$$;
