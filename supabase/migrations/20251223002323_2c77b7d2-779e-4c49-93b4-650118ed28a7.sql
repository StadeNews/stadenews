-- Add is_verified column to stories table
ALTER TABLE public.stories 
ADD COLUMN is_verified boolean DEFAULT true;

-- Comment explaining the field
COMMENT ON COLUMN public.stories.is_verified IS 'Whether the story has been officially verified by admins';