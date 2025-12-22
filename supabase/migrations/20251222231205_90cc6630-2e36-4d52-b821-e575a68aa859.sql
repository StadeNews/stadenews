-- Add is_closed column to chat_groups for temporary closure
ALTER TABLE public.chat_groups 
ADD COLUMN IF NOT EXISTS is_closed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS closed_reason text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS closed_by uuid DEFAULT NULL;

-- Create banned_users table for user bans
CREATE TABLE IF NOT EXISTS public.banned_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  reason text NOT NULL,
  banned_by uuid NOT NULL,
  banned_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_or_anonymous CHECK (user_id IS NOT NULL OR anonymous_id IS NOT NULL)
);

-- Enable RLS on banned_users
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Admins can manage bans
CREATE POLICY "Admins can manage bans"
ON public.banned_users
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Anyone can check if they're banned (for their own ID)
CREATE POLICY "Users can check own ban status"
ON public.banned_users
FOR SELECT
USING (user_id = auth.uid() OR anonymous_id IS NOT NULL);

-- Add realtime for banned_users
ALTER PUBLICATION supabase_realtime ADD TABLE public.banned_users;