
-- This function retrieves garages for multiple parts in a single query
-- It's optimized for bulk operations like loading garage data for all items in a cart
-- Parameters:
--   part_ids: An array of part IDs to find garages for
-- Returns:
--   Table containing part_id, garage details (id, name, location) and installation fee

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
