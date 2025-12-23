-- Add media columns to stories table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS media_type text,
ADD COLUMN IF NOT EXISTS media_description text,
ADD COLUMN IF NOT EXISTS media_status text DEFAULT 'pending';

-- Add comment explaining media_status values
COMMENT ON COLUMN public.stories.media_status IS 'pending, approved, rejected - separate review for media content';

-- Create storage bucket for story media
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-media', 'story-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for story-media bucket
CREATE POLICY "Anyone can upload story media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-media');

CREATE POLICY "Anyone can view story media"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-media');

CREATE POLICY "Admins can delete story media"
ON storage.objects FOR DELETE
USING (bucket_id = 'story-media' AND public.has_role(auth.uid(), 'admin'::app_role));