-- Add media support to spotted posts
ALTER TABLE public.spotted
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video')),
ADD COLUMN IF NOT EXISTS media_status TEXT DEFAULT 'pending' CHECK (media_status IN ('pending', 'approved', 'rejected'));

-- Create spotted_media table for multiple media per spotted post
CREATE TABLE IF NOT EXISTS public.spotted_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spotted_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_description TEXT,
  media_status TEXT NOT NULL DEFAULT 'pending' CHECK (media_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT spotted_media_spotted_id_fkey FOREIGN KEY (spotted_id) REFERENCES public.spotted(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.spotted_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for spotted_media
CREATE POLICY "Anyone can view approved spotted media"
ON public.spotted_media
FOR SELECT
USING (media_status = 'approved');

CREATE POLICY "Admins can view all spotted media"
ON public.spotted_media
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert spotted media"
ON public.spotted_media
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update spotted media"
ON public.spotted_media
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete spotted media"
ON public.spotted_media
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for spotted_media
ALTER PUBLICATION supabase_realtime ADD TABLE public.spotted_media;