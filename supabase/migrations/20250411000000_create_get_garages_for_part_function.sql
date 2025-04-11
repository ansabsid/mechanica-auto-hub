
CREATE OR REPLACE FUNCTION get_garages_for_part(part_id_param INT)
RETURNS TABLE (
  id UUID, 
  name TEXT, 
  location TEXT, 
  installation_fee NUMERIC
) 
LANGUAGE SQL
AS $$
  SELECT 
    g.id, 
    g.name, 
    g.location, 
    pg.installation_fee
  FROM 
    parts_garages pg
  JOIN 
    garages g ON pg.garage_id = g.id
  WHERE 
    pg.part_id = part_id_param;
$$;
