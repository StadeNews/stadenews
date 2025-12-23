-- Create story_media table for multiple media per story
CREATE TABLE public.story_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_description TEXT,
  media_status TEXT NOT NULL DEFAULT 'pending' CHECK (media_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.story_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved story media"
ON public.story_media
FOR SELECT
USING (media_status = 'approved');

CREATE POLICY "Users can view their own story media"
ON public.story_media
FOR SELECT
USING (
  story_id IN (
    SELECT id FROM public.stories WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view pending media for their stories"
ON public.story_media
FOR SELECT
USING (
  story_id IN (
    SELECT id FROM public.stories WHERE user_id = auth.uid() OR anonymous_author IS NOT NULL
  )
);

CREATE POLICY "Admins can view all story media"
ON public.story_media
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert story media"
ON public.story_media
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update story media"
ON public.story_media
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete story media"
ON public.story_media
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add foreign key constraint
ALTER TABLE public.story_media
ADD CONSTRAINT story_media_story_id_fkey
FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;

-- Enable realtime for story_media
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_media;