
-- Add retailer table to track retailers who can upload parts
CREATE TABLE IF NOT EXISTS public.retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  area TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for retailers table
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;

-- Add source_type and retailer_id columns to parts table
ALTER TABLE public.parts 
ADD COLUMN IF NOT EXISTS retailer_id UUID REFERENCES public.retailers(id) NULL,
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('garage', 'retailer')) NULL;

-- Update the insert_part function to include retailer_id and source_type
CREATE OR REPLACE FUNCTION public.insert_part(part_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_part_id INTEGER;
  result JSONB;
BEGIN
  -- Insert the part
  INSERT INTO public.parts (
    name,
    price,
    stock,
    description,
    manufacturer_id,
    model_id,
    year,
    garage_id,
    retailer_id,
    source_type,
    image_url,
    category
  ) VALUES (
    part_data->>'name',
    (part_data->>'price')::numeric,
    (part_data->>'stock')::integer,
    part_data->>'description',
    (part_data->>'manufacturer_id')::integer,
    (part_data->>'model_id')::integer,
    (part_data->>'year')::integer,
    (part_data->>'garage_id')::uuid,
    (part_data->>'retailer_id')::uuid,
    part_data->>'source_type',
    part_data->>'image_url',
    part_data->>'category'
  )
  RETURNING id INTO inserted_part_id;
  
  -- Return the result
  result := jsonb_build_object('id', inserted_part_id);
  RETURN result;
END;
$$;

-- Create retailer_parts view to make it easier to query parts by retailer
CREATE OR REPLACE VIEW public.retailer_parts AS
SELECT 
  p.*,
  r.name as retailer_name,
  r.location as retailer_location
FROM 
  parts p
JOIN 
  retailers r ON p.retailer_id = r.id
WHERE 
  p.source_type = 'retailer';

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

-- Insert some sample retailers for testing
INSERT INTO public.retailers (name, location, area)
VALUES 
  ('AutoZone Dubai', 'Sheikh Zayed Road, Dubai', 'Downtown Dubai'),
  ('Parts Plus', 'Al Quoz Industrial Area, Dubai', 'Al Quoz'),
  ('Emirates Auto Parts', 'Dubai Silicon Oasis', 'Dubai Silicon Oasis')
ON CONFLICT DO NOTHING;
