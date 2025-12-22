
-- Add anonymous_ids table for persistent anonymous login
CREATE TABLE public.anonymous_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id text NOT NULL UNIQUE,
  nickname text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_seen_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anonymous_ids ENABLE ROW LEVEL SECURITY;

-- Anyone can create/read anonymous IDs
CREATE POLICY "Anyone can create anonymous IDs"
ON public.anonymous_ids
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view anonymous IDs"
ON public.anonymous_ids
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update their anonymous ID"
ON public.anonymous_ids
FOR UPDATE
USING (true);

-- Extend profiles table with bio and avatar_url
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- Admin messages table for communication with users
CREATE TABLE public.admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  story_id uuid REFERENCES public.stories(id) ON DELETE SET NULL,
  admin_message text NOT NULL,
  user_reply text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all admin messages"
ON public.admin_messages
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own admin messages"
ON public.admin_messages
FOR SELECT
USING (user_id = auth.uid() OR anonymous_id IS NOT NULL);

CREATE POLICY "Users can reply to their messages"
ON public.admin_messages
FOR UPDATE
USING (user_id = auth.uid() OR anonymous_id IS NOT NULL);

-- Reports table for content reporting
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid,
  reporter_anonymous_id text,
  content_type text NOT NULL CHECK (content_type IN ('story', 'comment', 'chat_message', 'group_message', 'profile')),
  content_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit reports"
ON public.reports
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all reports"
ON public.reports
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports"
ON public.reports
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Extend stories with social media fields
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS social_media_suitable boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS credits_name text;

-- Online presence tracking
CREATE TABLE public.user_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  last_seen timestamp with time zone NOT NULL DEFAULT now(),
  is_online boolean DEFAULT true,
  UNIQUE(user_id),
  UNIQUE(anonymous_id)
);

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage presence"
ON public.user_presence
FOR ALL
USING (true);

-- Profile likes
CREATE TABLE public.profile_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  liker_user_id uuid,
  liker_anonymous_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(profile_id, liker_user_id),
  UNIQUE(profile_id, liker_anonymous_id)
);

ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profile likes"
ON public.profile_likes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can add profile likes"
ON public.profile_likes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can remove their likes"
ON public.profile_likes
FOR DELETE
USING (liker_user_id = auth.uid() OR liker_anonymous_id IS NOT NULL);

-- Rate limiting table for brute force protection
CREATE TABLE public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_or_id text NOT NULL,
  ip_address text,
  attempted_at timestamp with time zone NOT NULL DEFAULT now(),
  successful boolean DEFAULT false
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert login attempts"
ON public.login_attempts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for presence tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
