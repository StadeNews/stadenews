-- Fix chat_groups RLS policy to be permissive
DROP POLICY IF EXISTS "Anyone can view active chat groups" ON public.chat_groups;
CREATE POLICY "Anyone can view active chat groups"
ON public.chat_groups
FOR SELECT
USING (is_active = true);

-- Add social_media_suitable and credits_name to stories if not exists
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS social_media_suitable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS credits_name TEXT;

-- Make sure admin_messages table has correct structure
ALTER TABLE public.admin_messages
ADD COLUMN IF NOT EXISTS story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE;

-- Enable realtime for admin_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_messages;