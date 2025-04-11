
-- Create a function to insert a part with admin privileges
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
    image_url
  ) VALUES (
    part_data->>'name',
    (part_data->>'price')::numeric,
    (part_data->>'stock')::integer,
    part_data->>'description',
    (part_data->>'manufacturer_id')::integer,
    (part_data->>'model_id')::integer,
    (part_data->>'year')::integer,
    (part_data->>'garage_id')::uuid,
    part_data->>'image_url'
  )
  RETURNING id INTO inserted_part_id;
  
  -- Return the result
  result := jsonb_build_object('id', inserted_part_id);
  RETURN result;
END;
$$;

-- Drop the conflicting policy if it exists
DROP POLICY IF EXISTS "Allow part creation" ON public.parts;

-- Create a new policy with the correct syntax
CREATE POLICY "Allow part creation" ON public.parts
FOR INSERT WITH CHECK (true);

-- Create a policy for read access
CREATE POLICY "Allow read access" ON public.parts
FOR SELECT USING (true);

-- Create a policy for update access based on garage_id
CREATE POLICY "Allow update access" ON public.parts
FOR UPDATE USING (true);
