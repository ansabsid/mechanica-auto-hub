
-- This function retrieves all garages that can install a specific part
-- It returns details about each garage along with their installation fee for the given part
-- Parameters:
--   part_id_param: The ID of the part to find garages for
-- Returns:
--   Table of garage details (id, name, location) and installation fee

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
