
-- Add retailer_id column to parts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'parts' 
                   AND column_name = 'retailer_id') THEN
        ALTER TABLE public.parts ADD COLUMN retailer_id UUID REFERENCES retailers(id);
    END IF;
END $$;

-- Add source_type column to parts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'parts' 
                   AND column_name = 'source_type') THEN
        ALTER TABLE public.parts ADD COLUMN source_type TEXT;
    END IF;
END $$;

-- Update any null source_type values based on garage_id
UPDATE public.parts
SET source_type = CASE 
    WHEN garage_id IS NOT NULL THEN 'garage'
    WHEN retailer_id IS NOT NULL THEN 'retailer'
    ELSE NULL
END
WHERE source_type IS NULL;
